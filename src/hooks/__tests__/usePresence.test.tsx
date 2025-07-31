import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePresence } from '@/hooks/usePresence'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'

// Mock dependencies
vi.mock('@/components/auth/AuthProvider')
vi.mock('@/integrations/supabase/client')

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z'
} as any

describe('usePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      signOut: vi.fn()
    } as any)

    // Mock presence channel
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      track: vi.fn(),
      untrack: vi.fn(),
      presenceState: vi.fn().mockReturnValue({
        'user-456': [{
          user_id: 'user-456',
          display_name: 'Other User',
          email: 'other@example.com',
          last_seen: '2024-01-01T12:00:00Z'
        }]
      })
    }
    
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any)
    vi.mocked(supabase.removeChannel).mockImplementation(vi.fn())

    // Mock document and window events
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true
    })
    
    global.addEventListener = vi.fn()
    global.removeEventListener = vi.fn()
    global.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as any
  })

  it('should initialize with empty presence users', () => {
    const { result } = renderHook(() => usePresence('project-123'))
    
    expect(result.current.presenceUsers).toEqual([])
  })

  it('should create presence channel for project', () => {
    renderHook(() => usePresence('project-123'))
    
    expect(supabase.channel).toHaveBeenCalledWith('presence:project-123')
  })

  it('should track user presence on subscription', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        // Simulate successful subscription
        callback('SUBSCRIBED')
        return mockChannel
      }),
      track: vi.fn(),
      untrack: vi.fn(),
      presenceState: vi.fn().mockReturnValue({})
    }
    
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any)

    renderHook(() => usePresence('project-123'))
    
    expect(mockChannel.track).toHaveBeenCalledWith({
      user_id: 'user-123',
      display_name: 'test',
      email: 'test@example.com',
      last_seen: expect.any(String)
    })
  })

  it('should handle presence sync events', () => {
    const mockChannel = {
      on: vi.fn((event, options, callback) => {
        if (event === 'presence' && options.event === 'sync') {
          // Simulate sync event
          setTimeout(() => callback(), 0)
        }
        return mockChannel
      }),
      subscribe: vi.fn(),
      track: vi.fn(),
      untrack: vi.fn(),
      presenceState: vi.fn().mockReturnValue({
        'user-456': [{
          user_id: 'user-456',
          display_name: 'Other User',
          email: 'other@example.com',
          last_seen: '2024-01-01T12:00:00Z'
        }]
      })
    }
    
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any)

    const { result } = renderHook(() => usePresence('project-123'))
    
    expect(result.current.presenceUsers).toEqual([])
  })

  it('should cleanup on unmount', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      track: vi.fn(),
      untrack: vi.fn(),
      presenceState: vi.fn().mockReturnValue({})
    }
    
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any)

    const { unmount } = renderHook(() => usePresence('project-123'))
    
    unmount()
    
    expect(mockChannel.untrack).toHaveBeenCalled()
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
  })
})