import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNewComments } from '@/hooks/useNewComments'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'

// Mock dependencies
vi.mock('@/components/auth/AuthProvider')
vi.mock('@/integrations/supabase/client')
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z'
} as any

const mockComments = [
  {
    id: 'comment-1',
    project_id: 'project-123',
    user_id: 'user-123',
    target: 'construction_item:456',
    message: 'Test comment',
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z'
  }
]

describe('useNewComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      signOut: vi.fn()
    } as any)

    // Mock Supabase query chain
    const mockSelect = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockIs = vi.fn().mockResolvedValue({ data: mockComments, error: null })
    
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      is: mockIs,
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockComments[0], error: null })
    } as any)

    // Mock realtime channel
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any)
    vi.mocked(supabase.removeChannel).mockImplementation(vi.fn())
  })

  it('should initialize with empty comments', () => {
    const { result } = renderHook(() => useNewComments('construction_item:456'))
    
    expect(result.current.comments).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should fetch comments for target', () => {
    const { result } = renderHook(() => useNewComments('construction_item:456'))
    
    expect(supabase.from).toHaveBeenCalledWith('comment')
  })

  it('should add new comment', () => {
    const { result } = renderHook(() => useNewComments('construction_item:456'))
    
    const newComment = {
      project_id: 'project-123',
      target: 'construction_item:456',
      message: 'New test comment'
    }

    result.current.addComment(newComment)

    expect(supabase.from).toHaveBeenCalledWith('comment')
  })

  it('should handle project-level comments', () => {
    renderHook(() => useNewComments('project-123'))
    
    expect(supabase.channel).toHaveBeenCalledWith('comments:project:project-123')
  })

  it('should handle target-specific comments', () => {
    renderHook(() => useNewComments('construction_item:456'))
    
    expect(supabase.channel).toHaveBeenCalledWith('comments:construction_item:456')
  })
})