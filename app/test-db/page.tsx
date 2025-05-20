'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserPreferences, getSupabaseClient } from '@/lib/supabase';

export default function TestDatabasePage() {
  // We'll use the Supabase client directly for this test page
  const { userId, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Test saving preferences
  const testSavePreferences = async () => {
    if (!userId) {
      setResult({
        success: false,
        message: 'User ID not available'
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      // Get a client with the user's ID
      const supabaseClient = getSupabaseClient(userId);
      
      const testPrefs: UserPreferences = {
        defaultLocation: 'Denver, CO',
        notificationSettings: {
          email: true,
          push: false,
        },
        displaySettings: {
          darkMode: false,
          listViewDefault: true,
        },
      };
      
      console.log('Testing database connection with user ID:', userId);
      
      // Check if preferences already exist
      const { data: existingData, error: checkError } = await supabaseClient
        .from('user_preferences')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('Existing data check result:', { existingData, checkError });
      
      if (checkError) {
        console.error('Error checking for existing preferences:', checkError);
        setResult({
          success: false,
          message: `Error checking for existing preferences: ${checkError.message}`
        });
        setLoading(false);
        return;
      }
      
      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabaseClient
          .from('user_preferences')
          .update({ 
            preferences: testPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Insert new record
        result = await supabaseClient
          .from('user_preferences')
          .insert([
            { 
              user_id: userId, 
              preferences: testPrefs,
              updated_at: new Date().toISOString()
            }
          ]);
      }
      
      if (result.error) {
        console.error('Error saving preferences:', result.error);
        console.log('Full error details:', JSON.stringify(result.error));
        setResult({
          success: false,
          message: `Error saving preferences: ${result.error.message}`
        });
      } else {
        setResult({
          success: true,
          message: 'Successfully saved preferences to database!'
        });
        
        // Refresh preferences
        fetchPreferences();
      }
    } catch (error) {
      console.error('Exception in savePreferences:', error);
      setResult({
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch current preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get a client with the user's ID
      const supabaseClient = getSupabaseClient(userId);
      
      const { data, error } = await supabaseClient
        .from('user_preferences')
        .select('user_id, preferences, updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching preferences:', error);
        setResult({
          success: false,
          message: `Error fetching preferences: ${error.message}`
        });
      } else if (data && data.preferences) {
        setPreferences(data.preferences as UserPreferences);
      } else {
        // No preferences found yet, but connection is working
        setPreferences(null);
        console.log('No preferences found, but database connection is working');
      }
    } catch (error) {
      console.error('Exception fetching preferences:', error);
      setResult({
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading, setPreferences, setResult]);

  // Load preferences on initial render
  useEffect(() => {
    if (isSignedIn) {
      fetchPreferences();
    }
  }, [isSignedIn, fetchPreferences]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Database Connection Test</h1>
      
      {!isSignedIn ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>You need to be signed in to test the database connection.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="mb-2"><strong>User ID:</strong> {userId}</p>
            <button
              onClick={testSavePreferences}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Testing...' : 'Test Database Connection'}
            </button>
          </div>
          
          {result && (
            <div className={`mb-6 p-4 border-l-4 ${result.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
              <p>{result.message}</p>
            </div>
          )}
          
          {preferences && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Current Preferences</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
