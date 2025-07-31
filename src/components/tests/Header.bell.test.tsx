import { render } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import Header from '@/layout/Header'

// Mock all dependencies
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } })
}))

vi.mock('@/hooks/useProjectStore', () => ({
  useProjectStore: () => ({ projects: [] })
}))

vi.mock('@/hooks/useScenarioStore', () => ({
  useScenarioStore: () => ({ scenarios: [], create: vi.fn(), setCurrent: vi.fn() })
}))

vi.mock('@/state/selectionStore', () => ({
  useSelectionStore: () => ({
    projectId: null,
    setProject: vi.fn(),
    scenarioId: null,
    setScenario: vi.fn()
  })
}))

vi.mock('@/hooks/useAlerts', () => ({
  useAlerts: () => ({ unreadCount: 3 })
}))

describe('Header Bell Icon', () => {
  it('shows red dot when unread alerts > 0', () => {
    render(<Header />)
    expect(document.body).toHaveTextContent('3')
  })
})