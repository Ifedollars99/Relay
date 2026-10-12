import { describe, it, expect } from 'vitest'
import { filterTickets, sortTickets, ticketStats } from '../lib/filters.js'

const tickets = [
  { id: 'RL-1', subject: 'Double charge on invoice', status: 'open', priority: 'high', category: 'billing', tags: ['billing'], assigneeId: 'ag_ada', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date(Date.now() + 86400000).toISOString(), firstResponseMin: null, satisfaction: null },
  { id: 'RL-2', subject: 'SSO login loops', status: 'resolved', priority: 'urgent', category: 'account', tags: ['sso'], assigneeId: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date().toISOString(), firstResponseMin: 22, satisfaction: 5 },
  { id: 'RL-3', subject: 'Export fails on big reports', status: 'pending', priority: 'medium', category: 'technical', tags: ['export'], assigneeId: 'ag_marcus', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), slaDueAt: new Date().toISOString(), firstResponseMin: 40, satisfaction: null },
]
const customers = [{ id: 'c1', name: 'Lena Fischer', email: 'lena@acme.com', company: 'Acme' }]

describe('filterTickets', () => {
  it('filters by status', () => {
    expect(filterTickets(tickets, { status: 'open' })).toHaveLength(1)
    expect(filterTickets(tickets, { status: 'all' })).toHaveLength(3)
  })
  it('filters by priority and assignee', () => {
    expect(filterTickets(tickets, { priority: 'urgent' })[0].id).toBe('RL-2')
    expect(filterTickets(tickets, { assignee: 'unassigned' })[0].id).toBe('RL-2')
  })
  it('searches subject and tags', () => {
    expect(filterTickets(tickets, { search: 'invoice' })[0].id).toBe('RL-1')
    expect(filterTickets(tickets, { search: 'SSO' })[0].id).toBe('RL-2')
  })
})

describe('sortTickets', () => {
  it('sorts urgent first with priority sort', () => {
    expect(sortTickets(tickets, 'priority')[0].id).toBe('RL-2')
  })
  it('does not mutate the input', () => {
    const copy = [...tickets]
    sortTickets(tickets, 'oldest')
    expect(tickets.map((t) => t.id)).toEqual(copy.map((t) => t.id))
  })
})

describe('ticketStats', () => {
  it('computes counts and averages', () => {
    const s = ticketStats(tickets)
    expect(s.total).toBe(3)
    expect(s.open).toBe(1)
    expect(s.awaiting).toBe(2)
    expect(s.resolved).toBe(1)
    expect(s.avgFr).toBeCloseTo(31)
    expect(s.csat).toBe(5)
  })
})
