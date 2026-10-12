import { create } from 'zustand'
import { fetchAll, persistTickets, persistMessages, persistCustomers, persistAgents, resetDemoData as apiReset, mockSession, mockSignIn, mockSignUp, mockSignOut } from '../services/api.js'
import { uid } from '../lib/utils.js'

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else if (theme === 'light') root.classList.remove('dark')
  else root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
}

const savedTheme = (() => {
  try {
    return localStorage.getItem('relay.theme') || 'system'
  } catch {
    return 'system'
  }
})()

export const useStore = create((set, get) => ({
  // --- session ---
  user: mockSession(),
  authLoading: false,
  authError: null,
  signIn: async (email, password) => {
    set({ authLoading: true, authError: null })
    try {
      const user = await mockSignIn(email, password)
      set({ user, authLoading: false })
      return user
    } catch (e) {
      set({ authError: e.message, authLoading: false })
      throw e
    }
  },
  signUp: async (name, email, password) => {
    set({ authLoading: true, authError: null })
    try {
      const user = await mockSignUp(name, email, password)
      set({ user, authLoading: false })
      return user
    } catch (e) {
      set({ authError: e.message, authLoading: false })
      throw e
    }
  },
  signOut: () => {
    mockSignOut()
    set({ user: null })
  },

  // --- theme / ui ---
  theme: savedTheme,
  setTheme: (theme) => {
    try {
      localStorage.setItem('relay.theme', theme)
    } catch { /* ignore */ }
    applyTheme(theme)
    set({ theme })
  },
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toasts: [],
  pushToast: (toast) => {
    const id = uid('toast')
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }))
    setTimeout(() => get().dismissToast(id), toast.duration ?? 3600)
    return id
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // --- data ---
  loading: true,
  loadError: null,
  tickets: [],
  messages: [],
  customers: [],
  agents: [],
  settings: (() => {
    try {
      return { ...{ emailNotif: true, slackNotif: false, weeklyDigest: true, workspace: 'Acme Support' }, ...JSON.parse(localStorage.getItem('relay.settings') || '{}') }
    } catch {
      return { emailNotif: true, slackNotif: false, weeklyDigest: true, workspace: 'Acme Support' }
    }
  })(),
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch }
    try {
      localStorage.setItem('relay.settings', JSON.stringify(next))
    } catch { /* ignore */ }
    set({ settings: next })
  },

  loadData: async () => {
    set({ loading: true, loadError: null })
    try {
      const data = await fetchAll()
      set({ ...data, loading: false })
    } catch (e) {
      set({ loadError: e.message || 'Failed to load', loading: false })
    }
  },

  resetDemo: () => {
    const data = apiReset()
    set({ ...data })
    get().pushToast({ title: 'Demo data restored', description: 'All tickets, customers and messages were reset.', variant: 'success' })
  },

  // --- ticket mutations (persisted to localStorage) ---
  updateTicket: async (id, patch) => {
    const next = get().tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    set({ tickets: next })
    await persistTickets(next)
  },
  createTicket: async (input) => {
    const nums = get().tickets.map((t) => Number(String(t.id).split('-')[1]) || 0)
    const id = `RL-${(Math.max(...nums, 1100) + 1)}`
    const nowIso = new Date().toISOString()
    const ticket = { id, status: 'open', priority: 'medium', category: 'general', tags: [], channel: 'email', assigneeId: null, firstResponseAt: null, firstResponseMin: null, resolvedAt: null, satisfaction: null, slaDueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), createdAt: nowIso, updatedAt: nowIso, ...input }
    const next = [ticket, ...get().tickets]
    set({ tickets: next })
    await persistTickets(next)
    const msg = { id: uid('m'), ticketId: id, authorType: 'customer', authorId: input.customerId, body: input.description || input.subject, createdAt: nowIso, isNote: false }
    const msgs = [...get().messages, msg]
    set({ messages: msgs })
    await persistMessages(msgs)
    return ticket
  },
  sendReply: async (ticketId, body, { isNote = false, authorId } = {}) => {
    const ticket = get().tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    const me = get().user
    const msg = { id: uid('m'), ticketId, authorType: isNote ? 'note' : 'agent', authorId: authorId || me?.id || 'ag_ada', body, createdAt: new Date().toISOString(), isNote }
    const msgs = [...get().messages, msg]
    set({ messages: msgs })
    await persistMessages(msgs)
    const patch = { updatedAt: msg.createdAt }
    if (!isNote && !ticket.firstResponseAt) {
      patch.firstResponseAt = msg.createdAt
      patch.firstResponseMin = Math.max(1, Math.round((new Date(msg.createdAt) - new Date(ticket.createdAt)) / 60000))
      if (ticket.status === 'open') patch.status = 'pending'
    }
    await get().updateTicket(ticketId, patch)
    return msg
  },
  bulkUpdate: async (ids, patch) => {
    const next = get().tickets.map((t) => (ids.includes(t.id) ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    set({ tickets: next })
    await persistTickets(next)
  },

  updateCustomer: async (id, patch) => {
    const next = get().customers.map((c) => (c.id === id ? { ...c, ...patch } : c))
    set({ customers: next })
    await persistCustomers(next)
  },
  updateAgent: async (id, patch) => {
    const next = get().agents.map((a) => (a.id === id ? { ...a, ...patch } : a))
    set({ agents: next })
    await persistAgents(next)
  },
}))

export function initTheme() {
  applyTheme(savedTheme)
}

// Selectors
export const ticketById = (state, id) => state.tickets.find((t) => t.id === id)
export const messagesForTicket = (state, ticketId) => state.messages.filter((m) => m.ticketId === ticketId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
export const customerById = (state, id) => state.customers.find((c) => c.id === id)
export const agentById = (state, id) => state.agents.find((a) => a.id === id)
