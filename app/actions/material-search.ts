"use server";

import { supabase } from "@/lib/supabase";
import { MaterialItem, MaterialSearchResponse } from "@/lib/firecrawl";
import { headers } from "next/headers";

/**
 * Server action for searching materials from the Supabase database
 * This replaces the previous Firecrawl direct API call with database queries
 *
 * @param query The search query string
 * @param page Optional page number for pagination
 * @param limit Optional limit of results per page
 * @returns Promise with search results
 */
export async function searchMaterialsAction(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<MaterialSearchResponse> {
  console.log("[SERVER ACTION DEBUG] Received query:", query);

  try {
    // Log headers for debugging
    const headersList = headers();
    console.log(
      "[SERVER ACTION DEBUG] Request origin:",
      headersList.get("origin")
    );

    if (!query || typeof query !== "string") {
      console.log("[SERVER ACTION DEBUG] Invalid query detected");
      throw new Error("Search query is required and must be a string");
    }

    // Calculate pagination parameters
    const offset = (page - 1) * limit;

    // Log the search request
    console.log(
      "[SERVER ACTION DEBUG] Search parameters:",
      JSON.stringify({ query, page, limit }, null, 2)
    );

    // Search materials in Supabase database
    console.log(
      "[SERVER ACTION DEBUG] Searching materials in Supabase with query:",
      query
    );

    // First, get the count of total results for pagination
    const countQuery = supabase
      .from("materials")
      .select("id", { count: "exact" })
      .or(`material_name.ilike.%${query}%,description.ilike.%${query}%`);

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Error counting search results: ${countError.message}`);
    }

    // Then get the actual results for this page
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .or(`material_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("last_synced", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error searching materials: ${error.message}`);
    }

    // Transform database results to match the MaterialSearchResponse format
    const results: MaterialItem[] = data.map((item) => ({
      id: item.id,
      name: item.material_name,
      description: item.description || "",
      category: item.category || "",
      price: parseFloat(item.price),
      unit: item.unit || "each",
      vendor: {
        id: item.vendor_id || "unknown",
        name: item.vendor_name || "Unknown Vendor",
        location: item.vendor_location || {
          address: "",
          city: "",
          state: "",
          zipCode: "",
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        contact: {},
      },
      availability: {
        status: item.availability || "in_stock",
        quantity: item.quantity || 0,
        leadTime: item.lead_time,
      },
      specifications: item.specifications || {},
      images: item.thumbnail ? [item.thumbnail] : [],
      material_url: item.url, // Added product URL
      lastUpdated: item.last_synced || new Date().toISOString(),
    }));

    // Create the search response
    const searchResults: MaterialSearchResponse = {
      results,
      pagination: {
        totalResults: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        limit,
      },
      metadata: {
        searchTime: 0, // We don't track this with database queries
        timestamp: new Date().toISOString(),
      },
    };

    // Log the search results
    console.log(
      `[SERVER ACTION DEBUG] Search returned ${results.length} results out of ${count}`
    );

    return searchResults;
  } catch (error) {
    console.error("Error in material search server action:", error);
    throw new Error(
      `Failed to search for materials: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
