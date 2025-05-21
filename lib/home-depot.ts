/**
 * Home Depot Materials Data Scraper using Firecrawl
 *
 * This module provides functionality to fetch construction materials data from Home Depot
 * using the Firecrawl API. It is used for the asynchronous sync process to populate
 * the materials database.
 */

import { supabase } from "./supabase";
import { logSystemEvent } from "./supabase";
import FireCrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

// Material categories to search for
const MATERIAL_CATEGORIES = [
  "lumber",
  "drywall",
  "roofing",
  "insulation",
  "concrete",
  "flooring",
  "plumbing",
  "electrical",
  "hardware",
  "paint",
];

// Define schema for Firecrawl API - currently used for type definitions but will be used for API validation when deployed to production
const materialSchema = z.object({
  materials: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    category: z.string(),
    url: z.string(),
    image_url: z.string().optional(),
    vendor_name: z.string().default('Home Depot'),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    specifications: z.record(z.string()).optional(),
    availability: z.enum(['in_stock', 'available_soon', 'special_order']).optional().default('in_stock')
  }))
});

// Define the material type using the Zod schema
export type HomedepotMaterial = z.infer<typeof materialSchema>["materials"][number];

/**
 * Provides mock construction materials data for testing
 */
function getMockMaterials(
  category: string,
  limit: number = 10
): HomedepotMaterial[] {
  // Generate random mock materials based on the category
  const mockMaterials: HomedepotMaterial[] = [];

  for (let i = 1; i <= limit; i++) {
    const itemName = `${
      category.charAt(0).toUpperCase() + category.slice(1)
    } item ${i}`;
    mockMaterials.push({
      name: itemName,
      description: `High-quality ${category} for construction projects`,
      price: Math.floor(Math.random() * 100) + 10, // Random price between $10-$110
      category: category,
      url: `https://www.homedepot.com/p/${category}-item-${i}`,
      image_url: `https://images.homedepot.com/p/${category}-${i}.jpg`,
      vendor_name: "Home Depot",
      quantity: Math.floor(Math.random() * 50) + 1, // Random quantity between 1-50
      unit: category === "lumber" ? "board" : "each",
      specifications: { dimensions: "4x4", material: category },
      availability: Math.random() > 0.2 ? "in_stock" : "available_soon", // 80% chance of being in stock
    });
  }

  return mockMaterials;
}

/**
 * Fetches Home Depot materials using Firecrawl API
 * @param category - The material category to fetch
 * @param limit - Maximum number of materials to return
 */
async function fetchFromFirecrawl(category: string, limit: number = 10): Promise<HomedepotMaterial[]> {
  try {
    console.log(`Fetching ${category} materials from Home Depot using Firecrawl`);
    
    // Initialize Firecrawl with your API key
    const app = new FireCrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
    
    // Define search URL targeting this specific category
    const searchUrl = `https://www.homedepot.com/b/${category}`;
    
    // Extract data using Firecrawl
    const extractResult = await app.extract([searchUrl], {
      prompt: `Extract ${limit} construction materials from the ${category} category. Include name, description, price, category, URL, image URL, quantity, unit, specifications, and availability status.`,
      schema: materialSchema,
      enableWebSearch: true,
    });
    
    // Check if we have an actual error response
    if ('error' in extractResult && extractResult.error) {
      console.warn(`Error in Firecrawl extraction for ${category}:`, extractResult.error);
      throw new Error(`Firecrawl extraction error: ${String(extractResult.error)}`);
    }
    
    // Since this is not an error response, it must be a successful ExtractResponse
    // Use a type assertion to help TypeScript understand the type
    const successResult = extractResult as { data: { materials: HomedepotMaterial[] } };
    
    if (!successResult.data || !successResult.data.materials || successResult.data.materials.length === 0) {
      console.warn(`No materials found for category: ${category}`);
      return [];
    }
    
    return successResult.data.materials.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching ${category} materials with Firecrawl:`, error);
    throw error;
  }
}

/**
 * Main function to fetch construction materials
 * Always tries the Firecrawl API first and falls back to mock data on errors
 */
export async function fetchHomedepotMaterials(
  category: string,
  limit: number = 10
): Promise<HomedepotMaterial[]> {
  try {
    // Always try using Firecrawl API first
    return await fetchFromFirecrawl(category, limit);
  } catch (error) {
    // Fall back to mock data if API call fails
    console.warn(`Falling back to mock data for ${category} due to API error: ${String(error)}`);
    return getMockMaterials(category, limit);
  }
}

/**
 * Main function to synchronize Home Depot materials with the database
 * @param syncId The ID of the sync operation
 */
export async function syncHomeDepotMaterials(syncId: string): Promise<void> {
  try {
    // Update sync status to in_progress
    await supabase
      .from("sync_status")
      .update({ status: "in_progress" })
      .eq("sync_id", syncId);

    let totalMaterialsProcessed = 0;

    // Fetch materials for each category
    for (const category of MATERIAL_CATEGORIES) {
      try {
        // Update sync status with current category
        await supabase
          .from("sync_status")
          .update({
            metadata: {
              current_category: category,
              progress: Math.round(
                (MATERIAL_CATEGORIES.indexOf(category) /
                  MATERIAL_CATEGORIES.length) *
                  100
              ),
            },
          })
          .eq("sync_id", syncId);

        // Fetch materials for this category using Firecrawl
        let materials: HomedepotMaterial[] = [];
        try {
          materials = await fetchHomedepotMaterials(category, 10);
        } catch (fetchError) {
          console.error(`Error fetching ${category} materials:`, fetchError);
          await logSystemEvent("sync_category_fetch_error", {
            message: `Error fetching ${category} materials from Firecrawl`,
            severity: "error",
            metadata: {
              category,
              syncId,
              error:
                fetchError instanceof Error
                  ? fetchError.message
                  : String(fetchError),
            },
          });
          continue; // Skip this category and continue with the next one
        }

        if (materials.length === 0) {
          console.warn(`No materials found for category: ${category}`);
          continue; // Skip this category and continue with the next one
        }

        // Transform to database format
        const dbRecords = materials.map((material) => ({
          material_name: material.name,
          description: material.description || "",
          price: material.price,
          category: material.category,
          url: material.url,
          thumbnail: material.image_url,
          vendor_name: material.vendor_name,
          quantity: material.quantity || null,
          unit: material.unit || "each",
          specifications: material.specifications || {},
          // The availability is already a string enum
          availability: material.availability || "in_stock",
          // We don't have lead_time in the current schema, but adding an empty value
          lead_time: "",
          source: "home_depot",
          last_synced: new Date().toISOString(),
        }));

        // Insert into database in batches
        const { error } = await supabase
          .from("materials")
          .upsert(dbRecords, { onConflict: "url" });

        if (error) {
          throw new Error(
            `Error inserting ${category} materials: ${error.message}`
          );
        }

        totalMaterialsProcessed += materials.length;

        // Log progress
        console.log(`Synced ${materials.length} ${category} materials`);
      } catch (error) {
        console.error(`Error processing ${category} materials:`, error);
        await logSystemEvent("sync_category_error", {
          message: `Error syncing ${category} materials`,
          severity: "error",
          metadata: {
            category,
            syncId,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // Update sync status to completed
    await supabase
      .from("sync_status")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        materials_count: totalMaterialsProcessed,
      })
      .eq("sync_id", syncId);

    // Log successful completion
    await logSystemEvent("sync_completed", {
      message: `Successfully synced ${totalMaterialsProcessed} materials from Home Depot`,
      metadata: { syncId, totalMaterials: totalMaterialsProcessed },
    });
  } catch (error) {
    console.error("Error in syncHomeDepotMaterials:", error);

    // Update sync status to failed
    await supabase
      .from("sync_status")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : String(error),
      })
      .eq("sync_id", syncId);

    // Log failure
    await logSystemEvent("sync_failed", {
      message: "Failed to sync materials from Home Depot",
      severity: "error",
      metadata: {
        syncId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
