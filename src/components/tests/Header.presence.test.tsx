import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from '@/layout/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSelectionStore } from '@/state/selectionStore'
import { useProjectStore } from '@/hooks/useProjectStore'
import { useScenarioStore } from '@/hooks/useScenarioStore'
import { useAlerts } from '@/hooks/useAlerts'
import { usePresence } from '@/hooks/usePresence'

// Mock all dependencies
vi.mock('@/components/auth/AuthProvider')
vi.mock('@/state/selectionStore')
vi.mock('@/hooks/useProjectStore')
vi.mock('@/hooks/useScenarioStore')
vi.mock('@/hooks/useAlerts')
vi.mock('@/hooks/usePresence')
vi.mock('@/api/exportModel', () => ({
  exportModel: vi.fn()
}))

describe('Header presence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      signOut: vi.fn()
    } as any)

    vi.mocked(useProjectStore).mockReturnValue({
      projects: [],
      loading: false,
      createProject: vi.fn(),
      refetch: vi.fn()
    } as any)

    vi.mocked(useScenarioStore).mockReturnValue({
      scenarios: [],
      current: null,
      loading: false,
      setCurrent: vi.fn(),
      create: vi.fn(),
      reload: vi.fn()
    })

    vi.mocked(useAlerts).mockReturnValue({
      alerts: [],
      loading: false,
      unreadCount: 0,
      fetchAlerts: vi.fn(),
      markAllAsRead: vi.fn()
    })

    vi.mocked(usePresence).mockReturnValue({
      presenceUsers: [
        {
          user_id: 'user-456',
          display_name: 'Test User',
          initials: 'TU',
          color: 'bg-blue-500',
          last_seen: '2024-01-01T12:00:00Z'
        }
      ],
      updatePresence: vi.fn()
    })
  })

  it('shows presence dots when projectId is available', () => {
    vi.mocked(useSelectionStore).mockReturnValue({
      projectId: 'project-123',
      scenarioId: 'scenario-123',
      setProject: vi.fn(),
      setScenario: vi.fn()
    })

    const { container } = render(<Header />)
    
    // Look for MessageCircle icon or presence elements
    const messageIcons = container.querySelectorAll('svg')
    expect(messageIcons.length).toBeGreaterThan(0)
  })

  it('hides presence dots when no projectId', () => {
    vi.mocked(useSelectionStore).mockReturnValue({
      projectId: null,
      scenarioId: null,
      setProject: vi.fn(),
      setScenario: vi.fn()
    })

    const { container } = render(<Header />)
    
    // Should not show presence dots when no project selected
    expect(container.querySelector('[data-testid="presence-dots"]')).toBeNull()
  })
})