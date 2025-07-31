import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScenarioStore } from '../useScenarioStore';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ 
    user: { id: 'user-123', email: 'test@example.com' } 
  }),
}));

describe('useScenarioStore CRUD operations', () => {
  const projectId = 'project-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have create, rename, and remove functions', () => {
    const { result } = renderHook(() => useScenarioStore(projectId));
    
    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.rename).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useScenarioStore(projectId));
    
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should have scenarios array', () => {
    const { result } = renderHook(() => useScenarioStore(projectId));
    
    expect(Array.isArray(result.current.scenarios)).toBe(true);
  });
});