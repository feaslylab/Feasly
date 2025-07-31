import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScenarioStore } from '../useScenarioStore';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
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

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => 'test-scenario-id'
}));

describe('useScenarioStore Create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockResolvedValue({ data: [], error: null });
  });

  it('creates + selects a new scenario', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.insert.mockReturnValue(insert);             // mock chain

    const { result } = renderHook(() =>
      useScenarioStore('project-123')
    );

    const newScn = await act(() => result.current.create('My Scenario'));

    expect(insert).toHaveBeenCalled();                     // DB hit
    expect(result.current.current?.name).toBe('My Scenario');
    expect(result.current.scenarios).toHaveLength(1);
  });

  it('handles creation errors gracefully', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
    mockSupabase.insert.mockReturnValue(insert);

    const { result } = renderHook(() =>
      useScenarioStore('project-123')
    );

    const newScn = await act(() => result.current.create('My Scenario'));

    expect(newScn).toBe(null);
    expect(result.current.scenarios).toHaveLength(0);
  });
});