'use server'

import { z } from 'zod';
import FireCrawlApp from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Define the schema for materials
const materialSchema = z.object({
  materials: z.array(z.object({
    price: z.number(),
    material_name: z.string(),
    url: z.string(),
    quantity: z.number().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    vendor_name: z.string().optional(),
    location_coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }))
});

// Type for the extracted material data
export type MaterialData = z.infer<typeof materialSchema>;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Crawl websites for material data using Firecrawl and store in Supabase
 */
export async function crawlAndStoreMaterials() {
  try {
    // Initialize Firecrawl
    const app = new FireCrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

    // Define websites to crawl (these can be customized based on your needs)
    const websites = [
      "https://www.homedepot.com/b/Building-Materials/N-5yc1vZaqns"
    ];

    // Extract data using Firecrawl
    const extractResult = await app.extract(websites, {
      prompt: "Ensure each material has a price, material name, and a URL. Extract additional details like quantity, description, thumbnail, vendor name, and location coordinates if available.",
      schema: materialSchema,
      enableWebSearch: true,
    });

    console.log('Extraction completed:', extractResult);

    // Check if we have valid data
    if (!extractResult.data || !extractResult.data.materials || extractResult.data.materials.length === 0) {
      return {
        success: false,
        message: 'No materials found during crawl',
        count: 0
      };
    }

    // Store the materials in Supabase
    const { data, error } = await supabase
      .from('materials')
      .insert(
        extractResult.data.materials.map(material => ({
          material_name: material.material_name,
          price: material.price,
          url: material.url,
          quantity: material.quantity || null,
          description: material.description || null,
          thumbnail: material.thumbnail || null,
          vendor_name: material.vendor_name || null,
          location_coordinates: material.location_coordinates || null
        }))
      );

    if (error) {
      console.error('Error storing materials:', error);
      return {
        success: false,
        message: `Error storing materials: ${error.message}`,
        count: 0
      };
    }

    // Revalidate the materials page to show the new data
    revalidatePath('/materials');
    revalidatePath('/');

    return {
      success: true,
      message: `Successfully crawled and stored ${extractResult.data.materials.length} materials`,
      count: extractResult.data.materials.length
    };
  } catch (error) {
    console.error('Error in crawlAndStoreMaterials:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    };
  }
}

/**
 * Get all materials from the database
 */
export async function getMaterials() {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching materials:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getMaterials:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}
