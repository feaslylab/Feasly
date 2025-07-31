import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutosaveSync } from '../useAutosaveSync';
import * as idbKeyval from 'idb-keyval';

// Mock idb-keyval
vi.mock('idb-keyval');
const mockGet = vi.mocked(idbKeyval.get);
const mockSet = vi.mocked(idbKeyval.set);
const mockDel = vi.mocked(idbKeyval.del);

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useAutosaveSync', () => {
  const modelId = 'test-model-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue(undefined);
    mockDel.mockResolvedValue(undefined);
    
    // Mock online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('offline behavior', () => {
    it('should queue saves when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      const { result } = renderHook(() => useAutosaveSync(modelId));
      
      const testData = { project_name: 'Test Project' };
      
      act(() => {
        result.current.setDraft(testData);
      });

      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(result.current.state.status).toBe('offline');
      expect(result.current.state.queuedSaves).toBeGreaterThan(0);

      // Verify data was saved locally
      expect(mockSet).toHaveBeenCalledWith(
        `feasly.autosave.${modelId}`,
        testData
      );
    });

    it('should increase queue count on multiple offline saves', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      mockGet.mockResolvedValue([]); // Empty queue initially
      
      const { result } = renderHook(() => useAutosaveSync(modelId));
      
      act(() => {
        result.current.setDraft({ project_name: 'Test 1' });
      });
      
      act(() => {
        result.current.setDraft({ project_name: 'Test 2' });
      });

      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(result.current.state.queuedSaves).toBeGreaterThan(0);
    });
  });

  describe('online sync', () => {
    it('should successfully save draft when online', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ etag: 'new-etag-123' })
      });

      const { result } = renderHook(() => useAutosaveSync(modelId));
      
      const testData = { project_name: 'Test Project' };
      
      act(() => {
        result.current.setDraft(testData);
      });

      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(result.current.state.status).toBe('saved');
      expect(result.current.state.lastSyncedAt).toBeTruthy();

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/models/${modelId}/draft`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should process queued saves when coming back online', async () => {
      // Start with queued saves
      const queuedSaves = [
        {
          id: 'save-1',
          modelId,
          data: { project_name: 'Queued Save' },
          timestamp: Date.now(),
          retryCount: 0,
          type: 'draft'
        }
      ];
      mockGet.mockImplementation((key) => {
        if (key === `feasly.queue.${modelId}`) return Promise.resolve(queuedSaves);
        return Promise.resolve(null);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ etag: 'processed-etag' })
      });

      const { result } = renderHook(() => useAutosaveSync(modelId));

      act(() => {
        result.current.processQueue();
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(result.current.state.queuedSaves).toBe(0);
      expect(result.current.state.status).toBe('saved');

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('conflict handling', () => {
    it('should throw ConflictError on 409 response', async () => {
      const conflictResponse = {
        serverData: { project_name: 'Server Version' },
        etag: 'server-etag'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve(conflictResponse)
      });

      const { result } = renderHook(() => useAutosaveSync(modelId));
      
      const testData = { project_name: 'Local Version' };

      await expect(async () => {
        await act(async () => {
          await result.current.commit(testData);
        });
      }).rejects.toThrow('Conflict detected');
    });
  });

  describe('retry logic', () => {
    it('should retry failed saves with exponential backoff', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ etag: 'retry-success' })
        });

      const queuedSaves = [
        {
          id: 'retry-save',
          modelId,
          data: { project_name: 'Retry Test' },
          timestamp: Date.now(),
          retryCount: 0,
          type: 'draft'
        }
      ];
      
      mockGet.mockImplementation((key) => {
        if (key === `feasly.queue.${modelId}`) return Promise.resolve(queuedSaves);
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAutosaveSync(modelId));

      act(() => {
        result.current.processQueue();
      });

      // Should eventually succeed after retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(result.current.state.status).toBe('saved');
    });
  });

  describe('data persistence', () => {
    it('should load initial state from IndexedDB', async () => {
      const savedDraft = { project_name: 'Saved Draft' };
      const savedEtag = 'saved-etag';
      const savedQueue = [{ id: '1', modelId, data: {}, timestamp: Date.now(), retryCount: 0, type: 'draft' }];

      mockGet.mockImplementation((key) => {
        if (key === `feasly.autosave.${modelId}`) return Promise.resolve(savedDraft);
        if (key === `feasly.etag.${modelId}`) return Promise.resolve(savedEtag);
        if (key === `feasly.queue.${modelId}`) return Promise.resolve(savedQueue);
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAutosaveSync(modelId));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(result.current.state.isDirty).toBe(true);
      expect(result.current.state.queuedSaves).toBe(1);
    });

    it('should clear all data on clearDraft', async () => {
      const { result } = renderHook(() => useAutosaveSync(modelId));

      await act(async () => {
        await result.current.clearDraft();
      });

      expect(mockDel).toHaveBeenCalledWith(`feasly.autosave.${modelId}`);
      expect(mockDel).toHaveBeenCalledWith(`feasly.queue.${modelId}`);
      expect(mockDel).toHaveBeenCalledWith(`feasly.etag.${modelId}`);

      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.queuedSaves).toBe(0);
    });
  });
});