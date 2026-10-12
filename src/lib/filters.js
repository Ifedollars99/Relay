export function filterTickets(tickets, { search = '', status = 'all', priority = 'all', category = 'all', assignee = 'all', customers = null } = {}) {
  const q = search.trim().toLowerCase()
  return tickets.filter((t) => {
    if (status !== 'all' && t.status !== status) return false
    if (priority !== 'all' && t.priority !== priority) return false
    if (category !== 'all' && t.category !== category) return false
    if (assignee === 'unassigned' && t.assigneeId) return false
    if (assignee !== 'all' && assignee !== 'unassigned' && t.assigneeId !== assignee) return false
    if (q) {
      const hay = `${t.id} ${t.subject} ${t.tags?.join(' ') || ''}`.toLowerCase()
      let hit = hay.includes(q)
      if (!hit && customers) {
        const c = customers.find((c) => c.id === t.customerId)
        if (c && `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q)) hit = true
      }
      if (!hit) return false
    }
    return true
  })
}

export const sortTickets = (tickets, sort = 'newest') => {
  const arr = [...tickets]
  const prioRank = { urgent: 0, high: 1, medium: 2, low: 3 }
  switch (sort) {
    case 'oldest':
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'priority':
      return arr.sort((a, b) => prioRank[a.priority] - prioRank[b.priority] || new Date(b.createdAt) - new Date(a.createdAt))
    case 'sla':
      return arr.sort((a, b) => new Date(a.slaDueAt) - new Date(b.slaDueAt))
    case 'recent':
      return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    default:
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

export function ticketStats(tickets, since = null) {
  const inRange = since ? tickets.filter((t) => new Date(t.createdAt) >= since) : tickets
  const open = inRange.filter((t) => t.status === 'open').length
  const pending = inRange.filter((t) => t.status === 'pending').length
  const resolved = inRange.filter((t) => t.status === 'resolved' || t.status === 'closed').length
  const awaiting = open + pending
  const withFr = inRange.filter((t) => t.firstResponseMin != null)
  const avgFr = withFr.length ? withFr.reduce((s, t) => s + t.firstResponseMin, 0) / withFr.length : null
  const withCsat = inRange.filter((t) => t.satisfaction != null)
  const csat = withCsat.length ? withCsat.reduce((s, t) => s + t.satisfaction, 0) / withCsat.length : null
  return { total: inRange.length, open, pending, awaiting, resolved, avgFr, csat }
}

export function isOverdue(ticket) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false
  return new Date(ticket.slaDueAt) < new Date()
}
