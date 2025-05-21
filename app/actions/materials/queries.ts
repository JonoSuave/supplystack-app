'use server';

import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Define the schema for material search parameters
const materialSearchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  availability: z.enum(['in_stock', 'available_soon', 'special_order']).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10)
});

export type MaterialSearchParams = z.infer<typeof materialSearchParamsSchema>;

/**
 * Get materials with optional filtering and pagination
 */
export async function getMaterials(params: MaterialSearchParams = {}) {
  try {
    // Validate and sanitize input parameters
    const validatedParams = materialSearchParamsSchema.parse(params);
    
    // Start building the query
    let query = supabase
      .from('materials')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (validatedParams.query) {
      query = query.or(`material_name.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`);
    }
    
    if (validatedParams.category) {
      query = query.eq('category', validatedParams.category);
    }
    
    if (validatedParams.vendor) {
      query = query.eq('vendor_name', validatedParams.vendor);
    }
    
    if (validatedParams.minPrice !== undefined) {
      query = query.gte('price', validatedParams.minPrice);
    }
    
    if (validatedParams.maxPrice !== undefined) {
      query = query.lte('price', validatedParams.maxPrice);
    }
    
    if (validatedParams.availability) {
      query = query.eq('availability', validatedParams.availability);
    }
    
    // Add pagination
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    query = query
      .order('last_synced', { ascending: false })
      .range(startIndex, startIndex + validatedParams.limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch materials: ${error.message}`);
    }
    
    // Calculate pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / validatedParams.limit);
    
    return {
      materials: data || [],
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalCount,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw new Error(`Failed to fetch materials: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a single material by ID
 */
export async function getMaterialById(materialId: string) {
  try {
    // Validate the material ID
    if (!materialId || typeof materialId !== 'string') {
      throw new Error('Invalid material ID');
    }
    
    // Get the material from the database
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch material: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Material with ID ${materialId} not found`);
    }
    
    return { material: data };
  } catch (error) {
    console.error('Error fetching material by ID:', error);
    throw new Error(`Failed to fetch material: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get available categories for materials
 */
export async function getMaterialCategories() {
  try {
    // Get distinct categories from the database
    const { data, error } = await supabase
      .from('materials')
      .select('category')
      .order('category')
      .is('category', 'not.null');
    
    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    
    // Extract unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    
    return { categories };
  } catch (error) {
    console.error('Error fetching material categories:', error);
    throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get available vendors for materials
 */
export async function getMaterialVendors() {
  try {
    // Get distinct vendors from the database
    const { data, error } = await supabase
      .from('materials')
      .select('vendor_name')
      .order('vendor_name')
      .is('vendor_name', 'not.null');
    
    if (error) {
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }
    
    // Extract unique vendors
    const vendors = [...new Set(data?.map(item => item.vendor_name).filter(Boolean))];
    
    return { vendors };
  } catch (error) {
    console.error('Error fetching material vendors:', error);
    throw new Error(`Failed to fetch vendors: ${error instanceof Error ? error.message : String(error)}`);
  }
}
