import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConstructionStore } from "../useConstructionStore";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock auth provider
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })
}));

// Mock lodash debounce
vi.mock('lodash', () => ({
  debounce: (fn: any) => fn
}));

describe("useConstructionStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("saves KPI snapshot to database", async () => {
    const { result } = renderHook(() => useConstructionStore('test-project'));
    
    const mockKPIs = {
      npv: 489000,
      irr: 0.1536,
      profit: 400000
    };

    await result.current.saveKPIs(mockKPIs);

    expect(mockSupabase.from).toHaveBeenCalledWith('kpi_snapshot');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      project_id: 'test-project',
      npv: 489000,
      irr: 0.1536,
      profit: 400000,
      user_id: 'test-user-id'
    });
  });

  test("saves construction item to database", async () => {
    const { result } = renderHook(() => useConstructionStore('test-project'));
    
    const mockItem = {
      baseCost: 1_200_000,
      startPeriod: 6,
      endPeriod: 24,
      escalationRate: 0.05,
      retentionPercent: 0.05,
      retentionReleaseLag: 2
    };

    await result.current.saveItem(mockItem);

    expect(mockSupabase.from).toHaveBeenCalledWith('construction_item');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      project_id: 'test-project',
      base_cost: 1_200_000,
      start_period: 6,
      end_period: 24,
      escalation_rate: 0.05,
      retention_percent: 0.05,
      retention_release_lag: 2,
      user_id: 'test-user-id'
    });
  });
});