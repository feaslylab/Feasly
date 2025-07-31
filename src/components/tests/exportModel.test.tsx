import { vi, describe, it, expect } from 'vitest'
import { exportModel } from '@/api/exportModel'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
          limit: vi.fn(() => ({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

describe('exportModel', () => {
  it('returns a blob for ZIP export', async () => {
    const result = await exportModel('project-1', 'scenario-1')
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/zip')
  })
})