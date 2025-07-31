import { useState, useCallback, useEffect, useRef } from 'react';
import { get, set, del } from 'idb-keyval';
import { useToast } from '@/hooks/use-toast';

export interface AutosaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSyncedAt: Date | null;
  error: string | null;
  isDirty: boolean;
  queuedSaves: number;
}

export interface ConflictError extends Error {
  name: 'ConflictError';
  serverData: any;
  localData: any;
  etag: string;
}

interface AutosaveOptions {
  autosaveInterval?: number; // ms
  idleDelay?: number; // ms
  maxQueueSize?: number;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: Required<AutosaveOptions> = {
  autosaveInterval: 5000,
  idleDelay: 1000,
  maxQueueSize: 20,
  maxRetries: 5
};

interface QueuedSave {
  id: string;
  modelId: string;
  data: any;
  etag?: string;
  timestamp: number;
  retryCount: number;
  type: 'draft' | 'commit';
}

/**
 * Provides autosave functionality with offline queue and conflict resolution
 * Handles local persistence via IndexedDB and remote sync via API
 */
export function useAutosaveSync(modelId: string, options: AutosaveOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { toast } = useToast();
  
  const [state, setState] = useState<AutosaveState>({
    status: 'idle',
    lastSyncedAt: null,
    error: null,
    isDirty: false,
    queuedSaves: 0
  });

  const currentEtagRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveDataRef = useRef<any>(null);

  // IndexedDB keys
  const draftKey = `feasly.autosave.${modelId}`;
  const queueKey = `feasly.queue.${modelId}`;
  const etagKey = `feasly.etag.${modelId}`;

  // Load initial state from IndexedDB
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const [savedDraft, savedEtag, queue] = await Promise.all([
          get(draftKey),
          get(etagKey),
          get(queueKey) || []
        ]);

        if (savedEtag) {
          currentEtagRef.current = savedEtag;
        }

        setState(prev => ({
          ...prev,
          isDirty: !!savedDraft,
          queuedSaves: queue.length,
          status: queue.length > 0 ? 'offline' : 'idle'
        }));

        // Process queued saves if online
        if (navigator.onLine && queue.length > 0) {
          processQueue();
        }
      } catch (error) {
        console.error('Failed to load autosave state:', error);
      }
    };

    loadInitialState();
  }, [modelId]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        status: prev.queuedSaves > 0 ? 'offline' : 'idle',
        error: null
      }));
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        status: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process offline queue
  const processQueue = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const queue: QueuedSave[] = await get(queueKey) || [];
      if (queue.length === 0) return;

      setState(prev => ({ ...prev, status: 'saving' }));

      for (const save of queue) {
        try {
          if (save.type === 'draft') {
            await saveDraftToServer(save.data, save.etag);
          } else {
            await commitToServer(save.data, save.etag);
          }

          // Remove successful save from queue
          const updatedQueue = queue.filter(s => s.id !== save.id);
          await set(queueKey, updatedQueue);
          
          setState(prev => ({
            ...prev,
            queuedSaves: updatedQueue.length,
            lastSyncedAt: new Date(),
            error: null
          }));

        } catch (error) {
          // Increment retry count and reschedule
          save.retryCount++;
          
          if (save.retryCount >= opts.maxRetries) {
            // Remove failed save after max retries
            const updatedQueue = queue.filter(s => s.id !== save.id);
            await set(queueKey, updatedQueue);
            
            toast({
              title: "Save failed",
              description: `Failed to sync after ${opts.maxRetries} attempts`,
              variant: "destructive"
            });
          } else {
            // Exponential backoff retry
            const delay = Math.pow(2, save.retryCount) * 1000;
            retryTimeoutRef.current = setTimeout(() => processQueue(), delay);
          }
        }
      }

      const finalQueue: QueuedSave[] = await get(queueKey) || [];
      setState(prev => ({
        ...prev,
        status: finalQueue.length > 0 ? 'offline' : 'saved',
        queuedSaves: finalQueue.length
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Queue processing failed'
      }));
    }
  }, [modelId, opts.maxRetries, toast]);

  // Save draft data (debounced)
  const setDraft = useCallback((data: any) => {
    // Don't save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(lastSaveDataRef.current)) {
      return;
    }

    lastSaveDataRef.current = data;
    setState(prev => ({ ...prev, isDirty: true }));

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced autosave
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Save locally first
        await set(draftKey, data);

        if (navigator.onLine) {
          setState(prev => ({ ...prev, status: 'saving' }));
          
          try {
            const result = await saveDraftToServer(data, currentEtagRef.current);
            currentEtagRef.current = result.etag;
            await set(etagKey, result.etag);

            setState(prev => ({
              ...prev,
              status: 'saved',
              lastSyncedAt: new Date(),
              error: null
            }));
          } catch (error) {
            // Queue for offline sync
            await queueSave(data, currentEtagRef.current, 'draft');
            setState(prev => ({
              ...prev,
              status: 'offline',
              error: 'Queued for sync'
            }));
          }
        } else {
          // Queue for offline sync
          await queueSave(data, currentEtagRef.current, 'draft');
          setState(prev => ({ ...prev, status: 'offline' }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Save failed'
        }));
      }
    }, opts.idleDelay);
  }, [opts.idleDelay]);

  // Queue a save for offline processing
  const queueSave = useCallback(async (data: any, etag?: string, type: 'draft' | 'commit' = 'draft') => {
    const queue: QueuedSave[] = await get(queueKey) || [];
    
    const queuedSave: QueuedSave = {
      id: crypto.randomUUID(),
      modelId,
      data,
      etag,
      timestamp: Date.now(),
      retryCount: 0,
      type
    };

    const newQueue = [...queue, queuedSave].slice(-opts.maxQueueSize);
    await set(queueKey, newQueue);
    
    setState(prev => ({ ...prev, queuedSaves: newQueue.length }));

    if (newQueue.length < queue.length) {
      toast({
        title: "Queue overflow",
        description: `Dropped ${queue.length - newQueue.length} older saves`,
        variant: "destructive"
      });
    }
  }, [modelId, opts.maxQueueSize, toast]);

  // Commit final save (publish)
  const commit = useCallback(async (data: any): Promise<void> => {
    try {
      setState(prev => ({ ...prev, status: 'saving' }));

      if (navigator.onLine) {
        const result = await commitToServer(data, currentEtagRef.current);
        currentEtagRef.current = result.etag;
        await set(etagKey, result.etag);

        // Clear draft after successful commit
        await del(draftKey);

        setState(prev => ({
          ...prev,
          status: 'saved',
          lastSyncedAt: new Date(),
          isDirty: false,
          error: null
        }));
      } else {
        await queueSave(data, currentEtagRef.current, 'commit');
        setState(prev => ({ ...prev, status: 'offline' }));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'ConflictError') {
        // Re-throw conflict errors for UI handling
        throw error;
      }

      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Commit failed'
      }));
      throw error;
    }
  }, []);

  // Clear all local data
  const clearDraft = useCallback(async () => {
    await Promise.all([
      del(draftKey),
      del(queueKey),
      del(etagKey)
    ]);
    
    setState(prev => ({
      ...prev,
      isDirty: false,
      status: 'idle',
      queuedSaves: 0,
      error: null
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    setDraft,
    commit,
    clearDraft,
    processQueue
  };
}

// API functions (to be implemented in feaslyModel.ts)
async function saveDraftToServer(data: any, etag?: string): Promise<{ etag: string }> {
  // TODO: Implement actual API call
  const response = await fetch(`/api/models/${data.id}/draft`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(etag && { 'If-Match': etag })
    },
    body: JSON.stringify(data)
  });

  if (response.status === 409) {
    const conflictData = await response.json();
    const error = new Error('Conflict detected') as ConflictError;
    error.name = 'ConflictError';
    error.serverData = conflictData.serverData;
    error.localData = data;
    error.etag = conflictData.etag;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Draft save failed: ${response.statusText}`);
  }

  const result = await response.json();
  return { etag: result.etag };
}

async function commitToServer(data: any, etag?: string): Promise<{ etag: string }> {
  // TODO: Implement actual API call
  const response = await fetch(`/api/models/${data.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(etag && { 'If-Match': etag })
    },
    body: JSON.stringify(data)
  });

  if (response.status === 409) {
    const conflictData = await response.json();
    const error = new Error('Conflict detected') as ConflictError;
    error.name = 'ConflictError';
    error.serverData = conflictData.serverData;
    error.localData = data;
    error.etag = conflictData.etag;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Commit failed: ${response.statusText}`);
  }

  const result = await response.json();
  return { etag: result.etag };
}