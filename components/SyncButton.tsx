'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { triggerSync, checkSyncStatus, getLatestSyncStatus, cancelSync, SyncStatusResponse } from '@/app/actions/materials/sync';

interface SyncButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function SyncButton({ variant = 'default', size = 'default', className = '' }: SyncButtonProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncId, setSyncId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to format the last synced time
  const formatLastSynced = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Load the latest sync status on component mount
  useEffect(() => {
    const loadLatestStatus = async () => {
      try {
        const status = await getLatestSyncStatus();
        if (status) {
          setSyncStatus(status);
          if (status.status === 'in_progress') {
            setSyncing(true);
            setSyncId(status.syncId);
            startPolling(status.syncId);
          }
        }
      } catch (error) {
        console.error('Failed to load latest sync status:', error);
      }
    };

    loadLatestStatus();
    
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Start polling for sync status updates
  const startPolling = (id: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const status = await checkSyncStatus(id);
        setSyncStatus(status);
        setProgress(status.progress || 0);
        
        if (status.status === 'completed') {
          toast({
            title: "Sync completed",
            description: `Successfully synced ${status.materialsCount} materials from Home Depot.`,
            variant: "default",
          });
          clearInterval(interval);
          setSyncing(false);
          setPollingInterval(null);
        } else if (status.status === 'failed') {
          toast({
            title: "Sync failed",
            description: status.errorMessage || 'An error occurred during sync.',
            variant: "destructive",
          });
          clearInterval(interval);
          setSyncing(false);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Error polling sync status:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };

  // Handle sync button click
  const handleSync = async () => {
    try {
      setSyncing(true);
      
      toast({
        title: "Sync started",
        description: "We've started syncing materials from Home Depot.",
        variant: "default",
      });
      
      const result = await triggerSync();
      setSyncId(result.syncId);
      
      // Start polling for status updates
      startPolling(result.syncId);
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: "Sync failed",
        description: `Failed to start sync: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setSyncing(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = async () => {
    if (!syncId) return;
    
    try {
      const result = await cancelSync(syncId);
      
      if (result.success) {
        toast({
          title: "Sync canceled",
          description: "The sync process has been canceled.",
          variant: "default",
        });
        
        // Stop polling and reset state
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setSyncing(false);
        
        // Update status to show canceled
        if (syncStatus) {
          setSyncStatus({
            ...syncStatus,
            status: 'canceled',
            completedAt: new Date().toISOString()
          });
        }
      } else {
        toast({
          title: "Unable to cancel",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error canceling sync:', error);
      toast({
        title: "Cancel failed",
        description: `Failed to cancel sync: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Button
          variant={variant}
          size={size}
          className={`${className} flex items-center gap-2`}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Syncing... {progress > 0 ? `${progress}%` : ''}</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Sync Materials</span>
            </>
          )}
        </Button>
        
        {/* Cancel button - only shown during active sync */}
        {syncing && syncId && (
          <Button 
            variant="outline" 
            size={size} 
            className="flex items-center gap-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600" 
            onClick={handleCancel}
          >
            <XCircle className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
        )}
      </div>
      
      {syncStatus?.completedAt && syncStatus.status === 'completed' && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <Check className="h-3 w-3 mr-1 text-green-500" />
          Last synced: {formatLastSynced(syncStatus.completedAt)}
        </div>
      )}
      
      {syncStatus?.status === 'failed' && (
        <div className="text-xs text-destructive mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Sync failed
        </div>
      )}
      
      {syncStatus?.status === 'canceled' && (
        <div className="text-xs text-amber-500 mt-1 flex items-center">
          <XCircle className="h-3 w-3 mr-1" />
          Sync canceled at {syncStatus.completedAt ? formatLastSynced(syncStatus.completedAt) : ''}
        </div>
      )}
    </div>
  );
}
