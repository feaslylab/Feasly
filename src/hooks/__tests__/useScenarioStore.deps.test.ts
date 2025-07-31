import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScenarioStore } from '../useScenarioStore';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock Auth Provider
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
}));

describe('useScenarioStore Dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockResolvedValue({ data: [], error: null });
  });

  it('loadScenarios memoisation stays stable across rerenders', () => {
    const { result, rerender } = renderHook(() =>
      useScenarioStore('project-123')
    );

    const firstCallback = result.current.reload;

    // Simulate a rerender with same IDs
    rerender();

    expect(result.current.reload).toBe(firstCallback);
  });

  it('loadScenarios changes when projectId changes', () => {
    const { result, rerender } = renderHook(
      ({ projectId }) => useScenarioStore(projectId),
      { initialProps: { projectId: 'project-123' } }
    );

    const firstCallback = result.current.reload;

    // Change projectId
    rerender({ projectId: 'project-456' });

    expect(result.current.reload).not.toBe(firstCallback);
  });
});