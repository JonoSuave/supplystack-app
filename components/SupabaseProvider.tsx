'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/nextjs';

// Import types from supabase.ts
import type { SearchFilters, UserPreferences } from '@/lib/supabase';

// Define response types
type SupabaseResponse<T> = {
  data: T | null;
  error: string | Error | null;
  status?: number; // HTTP status code
  statusText?: string; // Status text for better error reporting
};

// Define the context type
type SupabaseContextType = {
  saveSearch: (searchQuery: string, filters: SearchFilters) => Promise<SupabaseResponse<unknown>>;
  getSavedSearches: () => Promise<SupabaseResponse<unknown[]>>;
  savePreferences: (preferences: UserPreferences) => Promise<SupabaseResponse<unknown>>;
  getPreferences: () => Promise<SupabaseResponse<unknown>>;
};

// Create the context
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Provider component
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  
  // Save a search query with filters
  const saveSearch = async (searchQuery: string, filters: SearchFilters) => {
    if (!isSignedIn || !userId) {
      console.error('User must be signed in to save searches');
      return { data: null, error: 'User not authenticated' };
    }
    
    try {
      // Get a Supabase client with the user ID in the header
      const supabaseWithAuth = getSupabaseClient(userId);
      
      console.log('Saving search for user:', userId, 'Query:', searchQuery);
      
      const { data, error, status, statusText } = await supabaseWithAuth
        .from('saved_searches')
        .insert([
          { 
            user_id: userId, 
            search_query: searchQuery, 
            filters: filters,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Error saving search:', error, 'Status:', status, statusText);
      }
      
      return { data, error, status, statusText };
    } catch (err) {
      console.error('Exception in saveSearch:', err);
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  };
  
  // Get user's saved searches
  const getSavedSearches = async () => {
    if (!isSignedIn || !userId) {
      return { data: [], error: 'User not authenticated' };
    }
    
    try {
      // Get a Supabase client with the user ID in the header
      const supabaseWithAuth = getSupabaseClient(userId);
      
      console.log('Getting saved searches for user:', userId);
      
      const { data, error, status, statusText } = await supabaseWithAuth
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting saved searches:', error, 'Status:', status, statusText);
      } else {
        console.log(`Found ${data?.length || 0} saved searches`);
      }
      
      return { data: data || [], error, status, statusText };
    } catch (err) {
      console.error('Exception in getSavedSearches:', err);
      return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
    }
  };
  
  // Save user preferences
  const savePreferences = async (preferences: UserPreferences) => {
    if (!isSignedIn || !userId) {
      return { data: null, error: 'User not authenticated' };
    }
    
    try {
      // Get a Supabase client with the user ID in the header
      const supabaseWithAuth = getSupabaseClient(userId);
      
      console.log('Checking for existing preferences for user:', userId);
      
      // First check if the record exists
      const { data: existingData, error: checkError, status: checkStatus } = await supabaseWithAuth
        .from('user_preferences')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing preferences:', checkError, 'Status:', checkStatus);
        return { data: null, error: checkError, status: checkStatus };
      }
      
      console.log('Existing preferences check result:', existingData ? 'Found' : 'Not found');
      
      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabaseWithAuth
          .from('user_preferences')
          .update({ 
            preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Insert new record
        result = await supabaseWithAuth
          .from('user_preferences')
          .insert([
            { 
              user_id: userId, 
              preferences: preferences,
              updated_at: new Date().toISOString()
            }
          ]);
      }
      
      if (result.error) {
        console.error('Error saving preferences:', result.error, 'Status:', result.status);
      } else {
        console.log('Successfully saved preferences for user:', userId);
      }
      
      return { 
        data: result.data, 
        error: result.error,
        status: result.status,
        statusText: result.statusText 
      };
    } catch (err) {
      console.error('Exception in savePreferences:', err);
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  };
  
  // Get user preferences
  const getPreferences = async () => {
    if (!isSignedIn || !userId) {
      return { data: null, error: 'User not authenticated' };
    }
    
    try {
      // Get a Supabase client with the user ID in the header
      const supabaseWithAuth = getSupabaseClient(userId);
      
      console.log('Getting preferences for user:', userId);
      
      // First check if the user has preferences
      const { data, error, status, statusText } = await supabaseWithAuth
        .from('user_preferences')
        .select('user_id, preferences, updated_at')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results case
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error, 'Status:', status, statusText);
        return { data: null, error, status, statusText };
      }
      
      // If no preferences exist yet, return empty preferences
      if (!data) {
        console.log('No preferences found for user:', userId);
        return { data: { preferences: null }, error: null, status: 200, statusText: 'OK' };
      }
      
      console.log('Successfully retrieved preferences for user:', userId);
      return { data, error: null, status, statusText };
    } catch (err) {
      console.error('Exception in getPreferences:', err);
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  };
  
  // Context value
  const value = {
    saveSearch,
    getSavedSearches,
    savePreferences,
    getPreferences
  };
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Custom hook to use the Supabase context
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
