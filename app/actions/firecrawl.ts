'use server';

import { z } from 'zod';
import FireCrawlApp from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Zod schema for Firecrawl extraction, matching user's example
const firecrawlProductSchema = z.object({
  thumbnail_url: z.string().optional().nullable(),
  url: z.string(),
  price: z.number().nullable(), // Price can be null
  stock: z.string().optional().nullable(),
  product_id: z.string(),
  material_name: z.string().optional().nullable(), // Optional: attempt to extract name
});

const firecrawlExtractSchema = z.object({
  products: z.array(firecrawlProductSchema)
});

// Type for the extracted data from Firecrawl (single successful response)
export type FirecrawlSingleExtractSuccessData = z.infer<typeof firecrawlExtractSchema>;

// Firecrawl's app.extract can return an array of these, or ErrorResponse objects
import type { ExtractResponse, ErrorResponse } from '@mendable/firecrawl-js';

// Type guard to check for a successful Firecrawl extraction response
function isSuccessResponse(response: ExtractResponse<typeof firecrawlExtractSchema> | ErrorResponse): response is ExtractResponse<typeof firecrawlExtractSchema> {
  return (response as ExtractResponse<typeof firecrawlExtractSchema>).data !== undefined;
}

// Helper function to parse stock string to number
function parseStockString(stockStr: string | null | undefined): number | null {
  if (!stockStr) return null;
  const match = stockStr.match(/^(\d+)/); // Extracts leading numbers
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Crawl Home Depot for material data using Firecrawl and store/update in Supabase.
 * @param searchQueryForPrompt The search query to use in the Firecrawl prompt (e.g., "lumber", "paint").
 * @param categoryForDb The category to assign to these materials in the DB (e.g., "Lumber", "Paint").
 */
export async function crawlAndStoreMaterials(
  searchQueryForPrompt: string = 'general construction materials',
  categoryForDb: string = 'General'
) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  let syncRecordId: string | null = null;

  try {
    // Log start of sync
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sync_status')
      .insert({
        source: 'firecrawl_homedepot',
        status: 'in_progress',
        category: categoryForDb,
        metadata: { searchQuery: searchQueryForPrompt }
      })
      .select('id')
      .single();

    if (syncLogError || !syncLog) {
      console.error('Error creating sync_status record:', syncLogError);
      // Proceed without syncRecordId if logging fails, but log the error
    } else {
      syncRecordId = syncLog.id;
    }

    const app = new FireCrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

    const extractParams = {
      prompt: `Extract the thumbnail URL, product URL, price, stock status, and product ID for ${searchQueryForPrompt}. The product ID is located at the end of the product URL. For example the product id for the following is 206019465: https://www.homedepot.com/p/2-in-x-6-in-x-12-ft-2-Premium-Grade-Fir-Dimensional-Lumber-2023-12/206019465. Also try to extract the product name if available.`, 
      schema: firecrawlExtractSchema,
      // Note: Firecrawl's `extract` method with schema might not use `enableWebSearch` or `crawlerOptions` effectively.
      // It's primarily for extracting structured data from specific URLs based on the schema.
      // If broad crawling is needed first, a `crawl` call might be required, then `extract` on resulting URLs.
    };

    console.log(`[Firecrawl] Starting extraction for: ${searchQueryForPrompt} with Home Depot`);
    
    // Firecrawl's extract method expects an array of URLs. 
    // To search broadly, we give it a base URL pattern.
    // The effectiveness of "*" depends on Firecrawl's implementation for `extract`.
    const extractionOrErrorResponse = await app.extract<typeof firecrawlExtractSchema>(
      ["https://homedepot.com/*"], // URL pattern to guide extraction
      extractParams
    );

    // Check if the response indicates an error
    if (!isSuccessResponse(extractionOrErrorResponse as ExtractResponse<typeof firecrawlExtractSchema> | ErrorResponse)) {
      const errorResponseMessage = (extractionOrErrorResponse as ErrorResponse).error || 'Unknown Firecrawl error';
      throw new Error(`Firecrawl extraction failed: ${errorResponseMessage}`);
    }

    // Now extractionOrErrorResponse is ExtractResponse<typeof firecrawlExtractSchema>
    const firecrawlData = (extractionOrErrorResponse as ExtractResponse<typeof firecrawlExtractSchema>).data as unknown as FirecrawlSingleExtractSuccessData;

    if (!firecrawlData.products || firecrawlData.products.length === 0) {
      if (syncRecordId) {
        await supabase.from('sync_status').update({
          status: 'completed_no_data',
          materials_count: 0,
          completed_at: new Date().toISOString(),
        }).eq('id', syncRecordId);
      }
      return {
        success: true, // Technically successful, just no data found
        message: 'No materials found by Firecrawl for the given query.',
        count: 0
      };
    }

    const materialsToUpsert = firecrawlData.products.map(product => ({
      sku: product.product_id, // Essential for upsert conflict resolution
      material_name: product.material_name || product.product_id, // Fallback to product_id if name not extracted
      product_url: product.url,
      image_url: product.thumbnail_url,
      price: product.price,
      quantity: parseStockString(product.stock),
      vendor_name: 'Home Depot',
      category: categoryForDb,
      source: 'firecrawl_homedepot',
      // description: product.description, // Not in the provided schema, add if needed
      // last_synced_at: new Date().toISOString(), // Good to have for tracking freshness
    }));    

    const { error: upsertError, count: upsertCount } = await supabase
      .from('materials')
      .upsert(materialsToUpsert, { onConflict: 'sku', ignoreDuplicates: false });

    if (upsertError) {
      throw upsertError;
    }

    if (syncRecordId) {
      await supabase.from('sync_status').update({
        status: 'completed_success',
        materials_count: upsertCount || materialsToUpsert.length, // upsertCount might be null if all were updates
        completed_at: new Date().toISOString(),
      }).eq('id', syncRecordId);
    }

    revalidatePath('/materials');
    revalidatePath('/'); // Revalidate other relevant paths

    return {
      success: true,
      message: `Successfully synced ${upsertCount || materialsToUpsert.length} materials for ${searchQueryForPrompt}.`,
      count: upsertCount || materialsToUpsert.length
    };

  } catch (error: unknown) {
    console.error('[Firecrawl Action Error]', error);
    if (syncRecordId) {
      try {
        await supabase.from('sync_status').update({
          status: 'failed',
          error_message: (error instanceof Error ? error.message : String(error)),
          completed_at: new Date().toISOString(),
        }).eq('id', syncRecordId);
      } catch (logError) {
        console.error('Failed to update sync_status on error:', logError);
      }
    }
    return {
      success: false,
      message: `Error during Firecrawl sync: ${(error instanceof Error ? error.message : String(error))}`,
      error: (error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Get all materials from the database, ordered by creation date.
 */
export async function getMaterials() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching materials:', error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)), data: [] };
    }
    return { success: true, data: data || [] };
  } catch (error: unknown) {
    console.error('Error in getMaterials:', error);
    return { 
      success: false, 
      error: (error instanceof Error ? error.message : String(error)),
      data: [] 
    };
  }
}
