'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { syncHomeDepotMaterials } from '@/lib/home-depot';
import { z } from 'zod';

// Define the type for the sync status response
export type SyncStatusResponse = {
  syncId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  materialsCount?: number;
  source: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  progress?: number;
};

/**
 * Trigger a new sync operation to fetch materials from Home Depot
 * This returns immediately while the sync runs asynchronously
 */
export async function triggerSync(): Promise<{ syncId: string }> {
  try {
    // Create a new sync status record
    const { data, error } = await supabase
      .from('sync_status')
      .insert({
        status: 'pending',
        source: 'home_depot',
        metadata: {
          user_agent: 'SupplyStack App',
          initial_timestamp: new Date().toISOString(),
        }
      })
      .select('sync_id')
      .single();
    
    if (error) {
      throw new Error(`Failed to create sync record: ${error.message}`);
    }
    
    if (!data || !data.sync_id) {
      throw new Error('Failed to get sync ID from the database');
    }
    
    const syncId = data.sync_id;
    
    // Start the sync process asynchronously
    // We don't await this to allow the function to return immediately
    syncHomeDepotMaterials(syncId)
      .catch(error => {
        console.error('Sync process failed:', error);
      });
    
    // Revalidate relevant paths to update UI
    revalidatePath('/');
    revalidatePath('/materials');
    
    return { syncId };
  } catch (error) {
    console.error('Error triggering sync:', error);
    throw new Error(`Failed to trigger sync: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Schema for validating the sync ID
const syncIdSchema = z.object({
  syncId: z.string().uuid({ message: 'Invalid sync ID format' })
});

/**
 * Check the status of a sync operation
 * @param syncId The ID of the sync operation to check
 */
export async function checkSyncStatus(syncId: string): Promise<SyncStatusResponse> {
  try {
    // Validate the sync ID
    const { syncId: validatedSyncId } = syncIdSchema.parse({ syncId });
    
    // Get the sync status from the database
    const { data, error } = await supabase
      .from('sync_status')
      .select('*')
      .eq('sync_id', validatedSyncId)
      .single();
    
    if (error) {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Sync with ID ${validatedSyncId} not found`);
    }
    
    // Calculate progress based on metadata if available
    let progress = 0;
    if (data.status === 'in_progress' && data.metadata && data.metadata.progress) {
      progress = data.metadata.progress;
    } else if (data.status === 'completed') {
      progress = 100;
    }
    
    // Transform the database record to the response format
    const response: SyncStatusResponse = {
      syncId: data.sync_id,
      status: data.status,
      startedAt: data.started_at,
      completedAt: data.completed_at || undefined,
      materialsCount: data.materials_count || undefined,
      source: data.source,
      errorMessage: data.error_message || undefined,
      metadata: data.metadata || undefined,
      progress
    };
    
    return response;
  } catch (error) {
    console.error('Error checking sync status:', error);
    throw new Error(`Failed to check sync status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the latest sync status
 * Returns the most recent sync operation details
 */
export async function getLatestSyncStatus(): Promise<SyncStatusResponse | null> {
  try {
    // Get the most recent sync record
    const { data, error } = await supabase
      .from('sync_status')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No records found
        return null;
      }
      throw new Error(`Failed to get latest sync status: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    // Calculate progress based on metadata if available
    let progress = 0;
    if (data.status === 'in_progress' && data.metadata && data.metadata.progress) {
      progress = data.metadata.progress;
    } else if (data.status === 'completed') {
      progress = 100;
    }
    
    // Transform the database record to the response format
    const response: SyncStatusResponse = {
      syncId: data.sync_id,
      status: data.status,
      startedAt: data.started_at,
      completedAt: data.completed_at || undefined,
      materialsCount: data.materials_count || undefined,
      source: data.source,
      errorMessage: data.error_message || undefined,
      metadata: data.metadata || undefined,
      progress
    };
    
    return response;
  } catch (error) {
    console.error('Error getting latest sync status:', error);
    throw new Error(`Failed to get latest sync status: ${error instanceof Error ? error.message : String(error)}`);
  }
}
