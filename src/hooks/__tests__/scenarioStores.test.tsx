import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useConstructionStoreScenario, useSaleStore, useRentalStore } from '../useTableStores';
import { useScenarioStore } from '../useScenarioStore';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock Auth Provider
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
}));

describe('Scenario Stores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
  });

  it('construction store filters by scenario_id', async () => {
    mockSupabase.select.mockResolvedValue({ data: [], error: null });
    
    renderHook(() => useConstructionStoreScenario('test-project', 'test-scenario'));
    
    expect(mockSupabase.from).toHaveBeenCalledWith('construction_item');
    expect(mockSupabase.eq).toHaveBeenCalledWith('scenario_id', 'test-scenario');
  });

  it('creating new scenario works', async () => {
    const mockScenarioData = { id: 'new-scenario', name: 'Test Scenario' };
    mockSupabase.single.mockResolvedValue({ data: mockScenarioData, error: null });
    mockSupabase.select.mockResolvedValue({ data: [], error: null });
    
    const { result } = renderHook(() => useScenarioStore('test-project'));
    
    await result.current.create('Test Scenario');
    
    expect(mockSupabase.insert).toHaveBeenCalled();
  });
});