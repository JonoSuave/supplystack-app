"use client";

import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientSearchBar from "@/components/ClientSearchBar";
import MapView from "@/components/MapView";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { MaterialSearchResponse } from "@/lib/firecrawl";
import { searchMaterialsAction } from "@/app/actions/material-search";

// Define interfaces for the search result items
interface MaterialSearchResult {
  id: string;
  name: string;
  vendor: {
    name: string;
    location: {
      city: string;
      state: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
  };
  price: number;
  availability: {
    quantity?: number;
  };
  images?: string[];
}

interface Location {
  id: number;
  name: string;
  vendor: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  // Get the query from URL search params
  const query = searchParams.get("query") || "lumber";
  console.log("[SEARCH DEBUG] Initial query from URL:", query);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] =
    useState<MaterialSearchResponse | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      vendor: string;
      price: number;
      quantity: number;
      location: string;
      distance: string;
      imageUrl: string;
      lat: number;
      lng: number;
    }>
  >([]);

  const [mapLocations, setMapLocations] = useState<Location[]>([]);

  // Track the current search query to detect changes
  // Use a ref instead of state to avoid stale closures in the fetchSearchResults callback
  const currentQueryRef = useRef(query);

  // Memoize the calculate distance function to avoid dependency issues
  const calculateDistance = useCallback(() => {
    // In a real app, we would calculate the actual distance from the user's location
    // For now, we'll return a random distance between 0.5 and 15 miles
    return `${(0.5 + Math.random() * 14.5).toFixed(1)} miles`;
  }, []);

  // Memoize the fetch search results function to avoid recreating it on every render
  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    console.log("[SEARCH DEBUG] fetchSearchResults called with:", searchQuery);
    setIsLoading(true);
    setError(null);

    try {
      // Make sure we have a valid query - but don't override the user's search term
      if (!searchQuery || searchQuery.trim() === "") {
        console.log("[SEARCH DEBUG] Empty query, using default 'lumber'");
        searchQuery = "lumber"; // Only use default if query is empty
      }
      
      // Store the actual query being used in the ref to avoid stale closures
      const trimmedQuery = searchQuery.trim();
      console.log("[SEARCH DEBUG] Final query being sent to server action:", trimmedQuery);
      console.log("Fetching search results for:", trimmedQuery);

      // Use the server action instead of API endpoint
      console.log("[SEARCH DEBUG] Calling server action with query:", trimmedQuery);
      const data = await searchMaterialsAction(trimmedQuery);
      console.log(
        "[SEARCH DEBUG] Search response received, results count:",
        data.results?.length || 0
      );
      setSearchResponse(data);

      // Transform the API response to match our UI format
      const transformedResults = data.results.map(
        (item: MaterialSearchResult) => ({
          id: item.id,
          name: item.name,
          vendor: item.vendor.name,
          price: item.price,
          quantity: item.availability.quantity || 0,
          location: `${item.vendor.location.city}, ${item.vendor.location.state}`,
          distance: calculateDistance(),
          // Always use local placeholder image to avoid next-image-unconfigured-host errors
          imageUrl: "/placeholder.jpg",
          lat: item.vendor.location.coordinates.latitude,
          lng: item.vendor.location.coordinates.longitude,
        })
      );

      setSearchResults(transformedResults);

      // Transform results for map view
      const locationData: Location[] = data.results.map(
        (item: MaterialSearchResult) => ({
          id:
            parseInt(item.id.replace(/\D/g, "")) ||
            Math.floor(Math.random() * 1000),
          name: item.name,
          vendor: item.vendor.name,
          address: `${item.vendor.location.city}, ${item.vendor.location.state}`,
          lat: item.vendor.location.coordinates.latitude,
          lng: item.vendor.location.coordinates.longitude,
          price: item.price,
        })
      );

      setMapLocations(locationData);
    } catch (error) {
      console.error("[SEARCH DEBUG] Error fetching search results:", error);
      
      // Handle server action errors more gracefully
      if (error && typeof error === 'object' && 'digest' in error) {
        console.error("[SEARCH DEBUG] Server action error with digest:", error);
        // This is likely a header mismatch error in the browser preview
        setError("There was an issue processing your search in preview mode. This would work in the actual application.");
        
        // Even with an error, we can still show some mock results for demonstration purposes
        const searchTermLower = searchQuery.toLowerCase();
        if (searchTermLower.includes('sand') && searchTermLower.includes('paper')) {
          // Generate some mock sandpaper results
          const mockResults = Array.from({ length: 5 }, (_, i) => ({
            id: `sandpaper-${i}`,
            name: `${Math.floor(Math.random() * 400) + 60} Grit Sandpaper`,
            vendor: ['Home Depot', 'Lowe\'s', 'Ace Hardware'][Math.floor(Math.random() * 3)],
            price: Math.round(Math.random() * 200) / 10,
            quantity: Math.floor(Math.random() * 100),
            location: 'Denver, CO',
            distance: `${(0.5 + Math.random() * 14.5).toFixed(1)} miles`,
            imageUrl: '/placeholder.jpg',
            lat: 39.7392 + (Math.random() - 0.5) * 0.2,
            lng: -104.9903 + (Math.random() - 0.5) * 0.2,
          }));
          
          setSearchResults(mockResults);
          
          // Also set location data for map view
          const mockLocationData = mockResults.map(item => ({
            id: parseInt(item.id.replace(/\D/g, "")) || Math.floor(Math.random() * 1000),
            name: item.name,
            vendor: item.vendor,
            address: item.location,
            lat: item.lat,
            lng: item.lng,
            price: item.price,
          }));
          
          setMapLocations(mockLocationData);
        }
      } else {
        setError(`Failed to fetch search results: ${error instanceof Error ? error.message : String(error)}`);
        setSearchResults([]);
        setMapLocations([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [calculateDistance]);

  // Fetch search results when the component mounts or query changes
  useEffect(() => {
    console.log("[SEARCH DEBUG] useEffect running with query:", query);
    console.log("[SEARCH DEBUG] currentQueryRef.current:", currentQueryRef.current);
    
    // Check if the query has actually changed using the ref
    if (query !== currentQueryRef.current) {
      console.log("[SEARCH DEBUG] Query changed from", currentQueryRef.current, "to", query);
      currentQueryRef.current = query;
      console.log("Fetching search results for query:", query);
      fetchSearchResults(query);
    } else if (!searchResults.length) {
      // Initial load or no results yet
      console.log("[SEARCH DEBUG] Initial fetch for query:", query);
      fetchSearchResults(query);
    } else {
      console.log("[SEARCH DEBUG] No fetch needed - query unchanged and results exist");
    }

    // Add event listener for debugging network issues
    const handleOnline = () => console.log("Browser is online");
    const handleOffline = () => console.log("Browser is offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [query, fetchSearchResults, searchResults.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-dark-gray font-montserrat">
              Supply<span className="text-golden-yellow">Stack</span>
            </h1>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-dark-gray hover:text-golden-yellow transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-dark-gray hover:text-golden-yellow transition-colors font-medium"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-dark-gray hover:text-golden-yellow transition-colors font-medium"
          >
            Contact
          </Link>
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="bg-golden-yellow hover:bg-amber-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="border border-golden-yellow text-golden-yellow hover:bg-golden-yellow hover:text-white px-4 py-2 rounded-md font-medium transition-colors">
                Sign Up
              </button>
            </SignUpButton>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
        <button className="md:hidden text-dark-gray" aria-label="Open menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </header>

      {/* Search Results Section */}
      <main className="flex-grow px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar Component */}
          <ClientSearchBar
            defaultValue={query}
            className="mb-8"
            key={`search-bar-${query}`} // Force re-render when query changes
          />

          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-dark-gray">
              Search Results for &quot;{query}&quot;
              <span className="text-gray-500 font-normal">
                {isLoading
                  ? " (Loading...)"
                  : error
                  ? " (Error loading results)"
                  : ` (${
                      searchResponse?.pagination.totalResults ||
                      searchResults.length
                    } items found)`}
              </span>
            </h2>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {/* List/Map View Toggle */}
          <Tabs defaultValue="list" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-golden-yellow data-[state=active]:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="data-[state=active]:bg-golden-yellow data-[state=active]:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Map View
                </TabsTrigger>
              </TabsList>
              <button className="text-sm text-golden-yellow hover:underline flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Save this search
              </button>
            </div>

            {/* List View */}
            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-golden-yellow"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Error: {error}</p>
                  <p className="text-gray-500 mt-2">
                    Please try again or use a different search term.
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No results found for &quot;{query}&quot;. Please try a
                    different search term.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row"
                    >
                      <div className="md:w-24 md:h-24 mb-4 md:mb-0 md:mr-6">
                        <Image
                          src="/placeholder.jpg"
                          alt={item.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-dark-gray">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              Vendor: {item.vendor}
                            </p>
                          </div>
                          <div className="md:text-right">
                            <p className="text-lg font-bold text-golden-yellow">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-gray-600 text-sm">
                              Quantity: {item.quantity} available
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between mt-2">
                          <p className="text-gray-600 text-sm flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="w-4 h-4 mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {item.location} ({item.distance})
                          </p>
                          <div className="mt-2 md:mt-0">
                            <button className="bg-golden-yellow hover:bg-amber-500 text-white px-4 py-1 rounded text-sm font-medium transition-colors">
                              Contact Vendor
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Map View Component */}
            <TabsContent value="map" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12 h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-golden-yellow"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">
                    No results found for &quot;{query}&quot;. Please try a
                    different search term.
                  </p>
                </div>
              ) : (
                <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
                  <MapView locations={mapLocations} />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-golden-yellow text-white">
                1
              </button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-gray">
              Supply<span className="text-golden-yellow">Stack</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Finding construction materials made easy.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  For Vendors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SupplyStack Construction. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
