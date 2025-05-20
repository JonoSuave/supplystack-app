'use server';

import { searchMaterials, MaterialSearchParams, MaterialSearchResponse } from '@/lib/firecrawl';
import { headers } from 'next/headers';

/**
 * Server action for searching materials using the Firecrawl API
 * This keeps API keys secure on the server side and follows Next.js 14 best practices
 * 
 * @param query The search query string
 * @param page Optional page number for pagination
 * @param limit Optional limit of results per page
 * @returns Promise with search results
 */
export async function searchMaterialsAction(
  query: string,
  page?: number,
  limit?: number
): Promise<MaterialSearchResponse> {
  console.log('[SERVER ACTION DEBUG] Received query:', query);
  console.log('[SERVER ACTION DEBUG] Query type:', typeof query);
  
  try {
    // Log headers for debugging
    const headersList = headers();
    console.log('[SERVER ACTION DEBUG] Request origin:', headersList.get('origin'));
    console.log('[SERVER ACTION DEBUG] X-Forwarded-Host:', headersList.get('x-forwarded-host'));
    
    if (!query || typeof query !== 'string') {
      console.log('[SERVER ACTION DEBUG] Invalid query detected');
      throw new Error('Search query is required and must be a string');
    }

  // Prepare search parameters
  const searchParams: MaterialSearchParams = {
    query,
    page: page || 1,
    limit: limit || 10
  };
  
  // Log the search request
  console.log('[SERVER ACTION DEBUG] Search parameters:', JSON.stringify(searchParams, null, 2));
  console.log('Material search request (Server Action):', JSON.stringify(searchParams, null, 2));
  
    // Call the Firecrawl API using our custom implementation
    console.log('[SERVER ACTION DEBUG] Calling Firecrawl API with query:', searchParams.query);
    const searchResults = await searchMaterials(searchParams);
    
    // Log the search results
    console.log(`[SERVER ACTION DEBUG] Search returned ${searchResults.results?.length || 0} results`);
    console.log(`Search returned ${searchResults.results?.length || 0} results`);
    
    return searchResults;
  } catch (error) {
    console.error('Error in material search server action:', error);
    throw new Error(`Failed to search for materials: ${error instanceof Error ? error.message : String(error)}`);
  }
}
