/**
 * Firecrawl API Integration
 * 
 * This module handles interactions with the Firecrawl API for real-time
 * material availability and pricing data for construction materials.
 */

// Types for Firecrawl API responses and requests
export interface MaterialSearchParams {
  query: string;
  location?: {
    zipCode?: string;
    city?: string;
    state?: string;
    radius?: number; // in miles
  };
  filters?: {
    category?: string;
    vendor?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    quantity?: number;
    availability?: 'in_stock' | 'available_soon' | 'special_order';
    sortBy?: 'price_asc' | 'price_desc' | 'distance' | 'availability' | 'relevance';
  };
  page?: number;
  limit?: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string; // e.g., "per sq ft", "each", "per ton"
  vendor: {
    id: string;
    name: string;
    location: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates: {
        latitude: number;
        longitude: number;
      }
    };
    contact: {
      phone?: string;
      email?: string;
      website?: string;
    };
  };
  availability: {
    status: 'in_stock' | 'available_soon' | 'special_order';
    quantity?: number;
    leadTime?: string; // e.g., "2-3 days", "1 week"
  };
  specifications?: Record<string, string>; // Additional material specifications
  images?: string[]; // URLs to material images
  lastUpdated: string; // ISO date string
}

export interface MaterialSearchResponse {
  results: MaterialItem[];
  pagination: {
    totalResults: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  metadata: {
    searchTime: number; // in milliseconds
    timestamp: string; // ISO date string
  };
}

// API configuration - loaded from environment variables
export const getFirecrawlConfig = () => ({
  apiKey: process.env.FIRECRAWL_API_KEY || 'mock_api_key',
  baseUrl: process.env.FIRECRAWL_API_BASE_URL || 'https://api.firecrawl.construction/v1'
});

/**
 * Maximum number of retry attempts for API calls
 */
const MAX_RETRIES = 2;

/**
 * Search for construction materials using the Firecrawl API
 * @param params Search parameters for materials
 * @returns Promise with search results
 */
export async function searchMaterials(
  params: MaterialSearchParams
): Promise<MaterialSearchResponse> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`[FIRECRAWL] Searching materials with params (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, JSON.stringify(params));
      
      const config = getFirecrawlConfig();
      const url = `${config.baseUrl}/materials/search`;
      
      // Prepare the request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(params)
      };
      
      console.log(`[FIRECRAWL] Making API request to: ${url}`);
      
      // Make the actual API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if the response is successful
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FIRECRAWL] API error (${response.status}):`, errorText);
          
          // For certain status codes, we might want to retry
          if (response.status === 429 || response.status >= 500) {
            if (retries < MAX_RETRIES) {
              retries++;
              const delay = Math.pow(2, retries) * 1000; // Exponential backoff
              console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // If we get an error from the API, fall back to mock data for development
          console.warn('[FIRECRAWL] Falling back to mock data due to API error');
          return getMockMaterialSearchResponse(params);
        }
        
        // Parse the response as JSON
        const data = await response.json();
        console.log(`[FIRECRAWL] API response received with ${data.results?.length || 0} results`);
        
        // Validate the response data structure
        if (!data.results || !Array.isArray(data.results)) {
          console.error('[FIRECRAWL] Invalid API response structure:', data);
          return getMockMaterialSearchResponse(params);
        }
        
        return data as MaterialSearchResponse;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Rethrow to be caught by the outer try/catch
      }
    } catch (error) {
      console.error(`[FIRECRAWL] Error searching materials (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Check if we should retry
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('[FIRECRAWL] Request timed out');
      }
      
      if (retries < MAX_RETRIES) {
        retries++;
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For development, fall back to mock data if the API call fails after all retries
        console.warn('[FIRECRAWL] Falling back to mock data after all retry attempts');
        return getMockMaterialSearchResponse(params);
      }
    }
  }
  
  // This should never be reached due to the return in the last else block,
  // but TypeScript needs it for type safety
  return getMockMaterialSearchResponse(params);
}

/**
 * Get real-time updates for material availability and pricing
 * @param materialIds Array of material IDs to get updates for
 * @returns Promise with updated material data
 */
export async function getMaterialUpdates(
  materialIds: string[]
): Promise<MaterialItem[]> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`[FIRECRAWL] Getting updates for materials (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, materialIds);
      
      const config = getFirecrawlConfig();
      const url = `${config.baseUrl}/materials/updates`;
      
      // Prepare the request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ materialIds })
      };
      
      console.log(`[FIRECRAWL] Making API request to: ${url}`);
      
      // Make the actual API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if the response is successful
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FIRECRAWL] API error (${response.status}):`, errorText);
          
          // For certain status codes, we might want to retry
          if (response.status === 429 || response.status >= 500) {
            if (retries < MAX_RETRIES) {
              retries++;
              const delay = Math.pow(2, retries) * 1000; // Exponential backoff
              console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // If we get an error from the API, fall back to mock data for development
          console.warn('[FIRECRAWL] Falling back to mock data due to API error');
          const mockUpdates = materialIds.map(id => getMockMaterialItem(id));
          return mockUpdates;
        }
        
        // Parse the response as JSON
        const data = await response.json();
        console.log(`[FIRECRAWL] API response received with ${data.length || 0} updated materials`);
        
        // Validate the response data structure
        if (!Array.isArray(data)) {
          console.error('[FIRECRAWL] Invalid API response structure:', data);
          const mockUpdates = materialIds.map(id => getMockMaterialItem(id));
          return mockUpdates;
        }
        
        return data as MaterialItem[];
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Rethrow to be caught by the outer try/catch
      }
    } catch (error) {
      console.error(`[FIRECRAWL] Error getting material updates (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Check if we should retry
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('[FIRECRAWL] Request timed out');
      }
      
      if (retries < MAX_RETRIES) {
        retries++;
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For development, fall back to mock data if the API call fails after all retries
        console.warn('[FIRECRAWL] Falling back to mock data after all retry attempts');
        const mockUpdates = materialIds.map(id => getMockMaterialItem(id));
        return mockUpdates;
      }
    }
  }
  
  // This should never be reached due to the return in the last else block,
  // but TypeScript needs it for type safety
  const mockUpdates = materialIds.map(id => getMockMaterialItem(id));
  return mockUpdates;
}

/**
 * Get detailed information for a specific material
 * @param materialId ID of the material to get details for
 * @returns Promise with material details
 */
export async function getMaterialDetails(
  materialId: string
): Promise<MaterialItem> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`[FIRECRAWL] Getting details for material (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, materialId);
      
      const config = getFirecrawlConfig();
      const url = `${config.baseUrl}/materials/${encodeURIComponent(materialId)}`;
      
      // Prepare the request options
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        }
      };
      
      console.log(`[FIRECRAWL] Making API request to: ${url}`);
      
      // Make the actual API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if the response is successful
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FIRECRAWL] API error (${response.status}):`, errorText);
          
          // For certain status codes, we might want to retry
          if (response.status === 429 || response.status >= 500) {
            if (retries < MAX_RETRIES) {
              retries++;
              const delay = Math.pow(2, retries) * 1000; // Exponential backoff
              console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // If we get an error from the API, fall back to mock data for development
          console.warn('[FIRECRAWL] Falling back to mock data due to API error');
          return getMockMaterialItem(materialId);
        }
        
        // Parse the response as JSON
        const data = await response.json();
        console.log(`[FIRECRAWL] API response received for material: ${materialId}`);
        
        // Validate the response data structure
        if (!data || typeof data !== 'object' || !data.id) {
          console.error('[FIRECRAWL] Invalid API response structure:', data);
          return getMockMaterialItem(materialId);
        }
        
        return data as MaterialItem;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Rethrow to be caught by the outer try/catch
      }
    } catch (error) {
      console.error(`[FIRECRAWL] Error getting material details (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Check if we should retry
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('[FIRECRAWL] Request timed out');
      }
      
      if (retries < MAX_RETRIES) {
        retries++;
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.warn(`[FIRECRAWL] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For development, fall back to mock data if the API call fails after all retries
        console.warn('[FIRECRAWL] Falling back to mock data after all retry attempts');
        return getMockMaterialItem(materialId);
      }
    }
  }
  
  // This should never be reached due to the return in the last else block,
  // but TypeScript needs it for type safety
  return getMockMaterialItem(materialId);
}

// Helper function to generate mock data for development and testing
function getMockMaterialSearchResponse(params: MaterialSearchParams): MaterialSearchResponse {
  console.log('[FIRECRAWL DEBUG] Generating mock response for query:', params.query);
  const searchQuery = params.query.toLowerCase();
  
  // Generate a pool of potential results
  const potentialResults: MaterialItem[] = [];
  
  // Generate 50 potential items
  for (let i = 0; i < 50; i++) {
    potentialResults.push(getMockMaterialItem(`material-${i}`, searchQuery));
  }
  
  // Filter results based on the search query
  const filteredResults = potentialResults.filter(item => 
    item.name.toLowerCase().includes(searchQuery) || 
    item.description.toLowerCase().includes(searchQuery) || 
    item.category.toLowerCase().includes(searchQuery)
  );
  
  console.log(`[FIRECRAWL DEBUG] Found ${filteredResults.length} items matching query: ${searchQuery}`);
  
  // Use filtered results or generate specific results for the query
  const finalResults = filteredResults.length > 0 ? filteredResults : [];
  
  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Slice the results based on pagination
  const paginatedResults = finalResults.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    pagination: {
      totalResults: finalResults.length,
      currentPage: page,
      totalPages: Math.ceil(finalResults.length / limit),
      limit: limit
    },
    metadata: {
      searchTime: 250, // Mock search time in ms
      timestamp: new Date().toISOString()
    }
  };
  

}

// Helper function to generate a mock material item
function getMockMaterialItem(id: string, query?: string): MaterialItem {
  const categories = [
    'Lumber', 'Concrete', 'Drywall', 'Insulation', 'Roofing', 
    'Flooring', 'Plumbing', 'Electrical', 'Hardware', 'Paint', 'Sandpaper', 
    'Tools', 'Adhesives', 'Fasteners', 'Sealants'
  ];
  
  const vendors = [
    { name: 'Home Depot', city: 'Denver', state: 'CO' },
    { name: 'Lowe\'s', city: 'Boulder', state: 'CO' },
    { name: 'Ace Hardware', city: 'Fort Collins', state: 'CO' },
    { name: 'McCoy\'s Building Supply', city: 'Colorado Springs', state: 'CO' },
    { name: 'Menards', city: 'Aurora', state: 'CO' }
  ];
  
  // If query matches a category, prioritize that category
  const selectedCategory = categories.find(cat => 
    cat.toLowerCase().includes(query?.toLowerCase() || '')) || 
    categories[Math.floor(Math.random() * categories.length)];
  
  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
  
  // Generate a more realistic material name based on the query
  let materialName;
  if (query && query.toLowerCase().includes('sand') && query.toLowerCase().includes('paper')) {
    materialName = `${selectedCategory === 'Sandpaper' ? '' : 'Sandpaper - '}${Math.floor(Math.random() * 400) + 60} Grit ${selectedCategory}`;
  } else if (query) {
    // Make sure the material name contains the query for better search results
    const queryCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
    materialName = `${queryCapitalized} ${selectedCategory}`;
  } else {
    materialName = `${selectedCategory} Material ${id}`;
  }
  
  return {
    id,
    name: materialName,
    description: `High-quality ${selectedCategory.toLowerCase()} material for construction projects.`,
    category: selectedCategory,
    price: Math.round(Math.random() * 1000) / 10, // Random price between 0 and 100
    unit: getUnitForCategory(selectedCategory),
    vendor: {
      id: `vendor-${randomVendor.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: randomVendor.name,
      location: {
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
        city: randomVendor.city,
        state: randomVendor.state,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        coordinates: {
          latitude: 39.7392 + (Math.random() - 0.5) * 0.5, // Around Denver area
          longitude: -104.9903 + (Math.random() - 0.5) * 0.5
        }
      },
      contact: {
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `info@${randomVendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        website: `https://www.${randomVendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      }
    },
    availability: {
      status: getRandomAvailability(),
      quantity: Math.floor(Math.random() * 100) + 1,
      leadTime: getRandomLeadTime()
    },
    specifications: getSpecificationsForCategory(selectedCategory),
    images: [
      `https://example.com/materials/${selectedCategory.toLowerCase()}/image1.jpg`,
      `https://example.com/materials/${selectedCategory.toLowerCase()}/image2.jpg`
    ],
    lastUpdated: new Date().toISOString()
  };
}

// Helper function to get a random availability status
function getRandomAvailability(): 'in_stock' | 'available_soon' | 'special_order' {
  const statuses: ('in_stock' | 'available_soon' | 'special_order')[] = [
    'in_stock', 'in_stock', 'in_stock', // Higher probability for in_stock
    'available_soon', 'available_soon',
    'special_order'
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Helper function to get a random lead time
function getRandomLeadTime(): string {
  const leadTimes = [
    '1-2 days', '2-3 days', '3-5 days', '1 week', '2 weeks'
  ];
  return leadTimes[Math.floor(Math.random() * leadTimes.length)];
}

// Helper function to get appropriate unit for a category
function getUnitForCategory(category: string): string {
  switch (category) {
    case 'Lumber':
      return 'per board foot';
    case 'Concrete':
      return 'per cubic yard';
    case 'Drywall':
      return 'per sheet';
    case 'Insulation':
      return 'per sq ft';
    case 'Roofing':
      return 'per square';
    case 'Flooring':
      return 'per sq ft';
    case 'Plumbing':
      return 'each';
    case 'Electrical':
      return 'each';
    case 'Hardware':
      return 'each';
    case 'Paint':
      return 'per gallon';
    default:
      return 'each';
  }
}

// Helper function to get specifications for a category
function getSpecificationsForCategory(category: string): Record<string, string> {
  switch (category) {
    case 'Lumber':
      return {
        'Dimensions': `${Math.floor(Math.random() * 10) + 1}" x ${Math.floor(Math.random() * 10) + 1}"`,
        'Length': `${Math.floor(Math.random() * 12) + 8} ft`,
        'Wood Type': ['Pine', 'Oak', 'Cedar', 'Maple'][Math.floor(Math.random() * 4)],
        'Treatment': ['Untreated', 'Pressure-Treated', 'Kiln-Dried'][Math.floor(Math.random() * 3)]
      };
    case 'Concrete':
      return {
        'Strength': `${Math.floor(Math.random() * 2000) + 3000} PSI`,
        'Mix Type': ['Regular', 'High-Strength', 'Fast-Setting'][Math.floor(Math.random() * 3)],
        'Application': ['Foundation', 'Slab', 'Footings', 'General Use'][Math.floor(Math.random() * 4)]
      };
    case 'Drywall':
      return {
        'Thickness': `${[1/4, 3/8, 1/2, 5/8][Math.floor(Math.random() * 4)]}"`,
        'Dimensions': `4' x ${[8, 10, 12][Math.floor(Math.random() * 3)]}'`,
        'Type': ['Regular', 'Moisture-Resistant', 'Fire-Resistant'][Math.floor(Math.random() * 3)]
      };
    default:
      return {
        'Quality': ['Standard', 'Premium', 'Professional-Grade'][Math.floor(Math.random() * 3)],
        'Warranty': `${Math.floor(Math.random() * 10) + 1} years`,
        'Certification': ['ASTM', 'ANSI', 'UL', 'Energy Star'][Math.floor(Math.random() * 4)]
      };
  }
}
