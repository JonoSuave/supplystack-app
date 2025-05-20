import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Common client options to prevent multiple GoTrueClient instances
const clientOptions = {
  auth: {
    persistSession: false, // We don't want to persist the Supabase session since we're using Clerk
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

// Create the base Supabase client (for unauthenticated operations only)
export const supabase = createClient(supabaseUrl, supabaseKey, clientOptions);

// Create a Supabase client with the user's ID in the header for RLS policies
export const getSupabaseClient = (userId: string) => {
  if (!userId) {
    console.error('getSupabaseClient called without a userId');
    return supabase; // Return the unauthenticated client as fallback
  }
  
  console.log('Creating Supabase client with user ID:', userId);
  
  // Create a new client with the user ID in the headers
  return createClient(supabaseUrl, supabaseKey, {
    ...clientOptions,
    global: {
      headers: {
        // These headers will be used for RLS policies
        'x-user-id': userId,
        // Use the anon key for authorization
        'apikey': supabaseKey,
      },
    },
  });
};

// Helper functions for common database operations

// Define types for our database entities
export type SearchFilters = {
  location?: string;
  priceRange?: { min: number; max: number };
  quantity?: number;
  vendor?: string;
  category?: string;
  [key: string]: unknown;
};

// User saved searches
export async function saveSearch(userId: string, searchQuery: string, filters: SearchFilters) {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert([
      { 
        user_id: userId, 
        search_query: searchQuery, 
        filters: filters,
        created_at: new Date().toISOString()
      }
    ]);
  
  return { data, error };
}

export async function getUserSavedSearches(userId: string) {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Material data
export async function getMaterialById(materialId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', materialId)
    .single();
  
  return { data, error };
}

// User preferences type
export type UserPreferences = {
  defaultLocation?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
  };
  displaySettings?: {
    darkMode: boolean;
    listViewDefault: boolean;
  };
  [key: string]: unknown;
};

// User preferences
export async function saveUserPreferences(userId: string, preferences: UserPreferences) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([
      { 
        user_id: userId, 
        preferences: preferences,
        updated_at: new Date().toISOString()
      }
    ]);
  
  return { data, error };
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

// System log details type
export type EventDetails = {
  message: string;
  severity?: 'info' | 'warning' | 'error';
  source?: string;
  metadata?: Record<string, unknown>;
};

// System logs
export async function logSystemEvent(eventType: string, details: EventDetails, userId?: string) {
  const { data, error } = await supabase
    .from('system_logs')
    .insert([
      { 
        event_type: eventType, 
        details: details,
        user_id: userId || null,
        created_at: new Date().toISOString()
      }
    ]);
  
  return { data, error };
}
