/**
 * Home Depot Materials Data Scraper
 * 
 * This module provides functionality to fetch construction materials data from Home Depot.
 * It is used for the asynchronous sync process to populate the materials database.
 */

import { supabase } from './supabase';
import { logSystemEvent } from './supabase';

// Material categories to search for
const MATERIAL_CATEGORIES = [
  'lumber',
  'drywall',
  'roofing',
  'insulation',
  'concrete',
  'flooring',
  'plumbing',
  'electrical',
  'hardware',
  'paint'
];

// Define the material interface
export interface HomedepotMaterial {
  name: string;
  description: string;
  price: number;
  category: string;
  url: string;
  image_url?: string;
  vendor_name: string;
  quantity?: number;
  unit: string;
  specs?: Record<string, string>;
  availability: 'in_stock' | 'available_soon' | 'special_order';
}

/**
 * Fetches construction materials from Home Depot
 * This is a mock implementation that generates sample data
 * In a real implementation, this would use an API or web scraping
 */
export async function fetchHomedepotMaterials(category: string, limit: number = 10): Promise<HomedepotMaterial[]> {
  // In a real implementation, this would fetch actual data from Home Depot
  // For now, we're generating mock data
  console.log(`Fetching ${limit} ${category} materials from Home Depot`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return Array.from({ length: limit }, (_, i) => generateMockMaterial(category, i));
}

/**
 * Main function to synchronize Home Depot materials with the database
 * @param syncId The ID of the sync operation
 */
export async function syncHomeDepotMaterials(syncId: string): Promise<void> {
  try {
    // Update sync status to in_progress
    await supabase
      .from('sync_status')
      .update({ status: 'in_progress' })
      .eq('sync_id', syncId);
    
    let totalMaterialsProcessed = 0;
    
    // Fetch materials for each category
    for (const category of MATERIAL_CATEGORIES) {
      try {
        // Update sync status with current category
        await supabase
          .from('sync_status')
          .update({ 
            metadata: { 
              current_category: category,
              progress: Math.round((MATERIAL_CATEGORIES.indexOf(category) / MATERIAL_CATEGORIES.length) * 100)
            }
          })
          .eq('sync_id', syncId);
        
        // Fetch materials for this category
        const materials = await fetchHomedepotMaterials(category, 10);
        
        // Transform to database format
        const dbRecords = materials.map(material => ({
          material_name: material.name,
          description: material.description,
          price: material.price,
          category: material.category,
          url: material.url,
          thumbnail: material.image_url,
          vendor_name: material.vendor_name,
          quantity: material.quantity || null,
          unit: material.unit,
          specifications: material.specs || {},
          availability: material.availability,
          source: 'home_depot',
          last_synced: new Date().toISOString()
        }));
        
        // Insert into database in batches
        const { error } = await supabase
          .from('materials')
          .upsert(dbRecords, { onConflict: 'url' });
        
        if (error) {
          throw new Error(`Error inserting ${category} materials: ${error.message}`);
        }
        
        totalMaterialsProcessed += materials.length;
        
        // Log progress
        console.log(`Synced ${materials.length} ${category} materials`);
      } catch (error) {
        console.error(`Error processing ${category} materials:`, error);
        await logSystemEvent('sync_category_error', {
          message: `Error syncing ${category} materials`,
          severity: 'error',
          metadata: { category, syncId, error: error instanceof Error ? error.message : String(error) }
        });
      }
    }
    
    // Update sync status to completed
    await supabase
      .from('sync_status')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        materials_count: totalMaterialsProcessed
      })
      .eq('sync_id', syncId);
    
    // Log successful completion
    await logSystemEvent('sync_completed', {
      message: `Successfully synced ${totalMaterialsProcessed} materials from Home Depot`,
      metadata: { syncId, totalMaterials: totalMaterialsProcessed }
    });
  } catch (error) {
    console.error('Error in syncHomeDepotMaterials:', error);
    
    // Update sync status to failed
    await supabase
      .from('sync_status')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : String(error)
      })
      .eq('sync_id', syncId);
    
    // Log failure
    await logSystemEvent('sync_failed', {
      message: 'Failed to sync materials from Home Depot',
      severity: 'error',
      metadata: { syncId, error: error instanceof Error ? error.message : String(error) }
    });
  }
}

/**
 * Helper function to generate mock material data
 */
function generateMockMaterial(category: string, index: number): HomedepotMaterial {
  const id = `${category}-${Date.now()}-${index}`;
  const price = Math.round((Math.random() * 100 + 5) * 100) / 100; // $5 to $105 with 2 decimal places
  
  // Generate a realistic name based on category
  let name, unit, description;
  
  switch (category) {
    case 'lumber':
      name = `${['Pine', 'Oak', 'Cedar', 'Maple'][index % 4]} ${['2x4', '2x6', '4x4', '1x8'][index % 4]} ${['Board', 'Stud', 'Plank', 'Beam'][index % 4]}`;
      unit = 'per board foot';
      description = `High-quality ${name.toLowerCase()} for construction projects. Available in various lengths and treatments.`;
      break;
    case 'drywall':
      name = `${['Regular', 'Moisture-Resistant', 'Fire-Resistant', 'Soundproof'][index % 4]} Drywall Panel ${['1/2"', '5/8"', '3/8"', '1/4"'][index % 4]}`;
      unit = 'per sheet';
      description = `Professional-grade drywall panel for interior walls and ceilings. Dimensions: 4' x 8'.`;
      break;
    case 'roofing':
      name = `${['Asphalt', 'Metal', 'Slate', 'Tile'][index % 4]} ${['Shingle', 'Panel', 'Sheet', 'Material'][index % 4]}`;
      unit = 'per bundle';
      description = `Durable roofing material designed to protect against the elements. Easy installation and long-lasting.`;
      break;
    default:
      name = `${category.charAt(0).toUpperCase() + category.slice(1)} Item #${index + 1}`;
      unit = 'each';
      description = `Quality ${category} material for construction and home improvement projects.`;
  }
  
  // Random availability status
  const availabilityOptions: ('in_stock' | 'available_soon' | 'special_order')[] = ['in_stock', 'in_stock', 'available_soon', 'special_order'];
  const availability = availabilityOptions[Math.floor(Math.random() * 4)];
  
  return {
    name,
    description,
    price,
    category,
    url: `https://www.homedepot.com/p/${category}/${id}`,
    image_url: `https://images.homedepot.com/materials/${category}/${id}.jpg`,
    vendor_name: 'Home Depot',
    quantity: Math.floor(Math.random() * 100) + 1,
    unit,
    specs: {
      brand: ['HDX', 'Husky', 'Milwaukee', 'DeWalt', 'Ryobi'][Math.floor(Math.random() * 5)],
      warranty: `${Math.floor(Math.random() * 10) + 1} years`,
      weight: `${Math.floor(Math.random() * 50) + 1} lbs`
    },
    availability
  };
}
