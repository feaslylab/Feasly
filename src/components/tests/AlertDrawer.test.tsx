import { render } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AlertDrawer from '@/components/dashboard/AlertDrawer'

// Mock the useAlerts hook
vi.mock('@/hooks/useAlerts', () => ({
  useAlerts: () => ({
    alerts: [
      {
        id: '1',
        project_id: 'proj-1',
        alert_type: 'kpi_breach',
        title: 'IRR Below Threshold',
        body: 'IRR: 6.5% (threshold: 8%)',
        severity: 'high',
        triggered_at: '2024-01-01T00:00:00Z',
        resolved: false,
        resolved_at: null,
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    loading: false,
    markAllAsRead: vi.fn()
  })
}))

describe('AlertDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders alert drawer with alerts', () => {
    render(<AlertDrawer {...defaultProps} />)
    
    expect(document.body).toHaveTextContent('Alerts')
    expect(document.body).toHaveTextContent('IRR Below Threshold')
    expect(document.body).toHaveTextContent('IRR: 6.5% (threshold: 8%)')
    expect(document.body).toHaveTextContent('Mark all as read')
  })

  it('shows loading state when loading', () => {
    vi.mocked(require('@/hooks/useAlerts').useAlerts).mockReturnValue({
      alerts: [],
      loading: true,
      markAllAsRead: vi.fn()
    })

    render(<AlertDrawer {...defaultProps} />)
    
    expect(document.body).toHaveTextContent('Loading alerts...')
  })

  it('shows no alerts message when empty', () => {
    vi.mocked(require('@/hooks/useAlerts').useAlerts).mockReturnValue({
      alerts: [],
      loading: false,
      markAllAsRead: vi.fn()
    })

    render(<AlertDrawer {...defaultProps} />)
    
    expect(document.body).toHaveTextContent('No alerts')
  })
})