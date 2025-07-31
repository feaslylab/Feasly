import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PresenceDots } from '@/components/collaboration/PresenceDots'
import SaleTable from '@/components/SaleTable'
import RentalTable from '@/components/RentalTable'
import { useSelectionStore } from '@/state/selectionStore'
import { usePresence } from '@/hooks/usePresence'

// Mock dependencies
vi.mock('@/state/selectionStore')
vi.mock('@/hooks/usePresence')
vi.mock('@/hooks/useTableStores', () => ({
  useSaleStore: () => ({ items: [], save: vi.fn(), reload: vi.fn() }),
  useRentalStore: () => ({ items: [], save: vi.fn(), reload: vi.fn() })
}))

describe('PresenceDots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useSelectionStore).mockReturnValue({
      projectId: 'project-123',
      scenarioId: 'scenario-123',
      setProject: vi.fn(),
      setScenario: vi.fn()
    })

    vi.mocked(usePresence).mockReturnValue({
      presenceUsers: [],
      updatePresence: vi.fn()
    })
  })

  it('renders in SaleTable', () => {
    const { container } = render(<SaleTable />)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders in RentalTable', () => {
    const { container } = render(<RentalTable />)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders standalone PresenceDots', () => {
    const { container } = render(<PresenceDots />)
    // Should have MessageCircle icon when no presence users
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })
})