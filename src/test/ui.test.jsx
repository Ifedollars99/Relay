import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from '../components/ui/primitives.jsx'
import { EmptyState } from '../components/ui/display.jsx'
import { Inbox as InboxIcon } from 'lucide-react'

describe('badges', () => {
  it('renders status and priority labels', () => {
    render(<><StatusBadge status="open" /><PriorityBadge priority="urgent" /></>)
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })
})

describe('empty state', () => {
  it('renders title and action inside a router', () => {
    render(
      <MemoryRouter>
        <EmptyState icon={InboxIcon} title="Nothing here" description="All clear." action={<button>Do it</button>} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Do it')).toBeInTheDocument()
  })
})
