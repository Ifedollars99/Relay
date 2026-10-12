// Mock service layer that simulates async fetch/mutations and persists to localStorage.
// To connect a real backend later: replace the functions in this file with fetch()
// calls to your API (or Supabase client) keeping the same signatures.

import { agents as seedAgents, customers as seedCustomers, seedTickets, seedMessages } from '../data/seed.js'

const K = {
  tickets: 'relay.tickets.v1',
  messages: 'relay.messages.v1',
  customers: 'relay.customers.v1',
  agents: 'relay.agents.v1',
  user: 'relay.user.v1',
}

const delay = (ms = 220) => new Promise((r) => setTimeout(r, Math.min(ms, 600)))

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return structuredClone(fallback)
    return JSON.parse(raw)
  } catch {
    return structuredClone(fallback)
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota — ignore for demo */
  }
}

export function ensureSeeded() {
  if (!localStorage.getItem(K.tickets)) write(K.tickets, seedTickets)
  if (!localStorage.getItem(K.messages)) write(K.messages, seedMessages)
  if (!localStorage.getItem(K.customers)) write(K.customers, seedCustomers)
  if (!localStorage.getItem(K.agents)) write(K.agents, seedAgents)
}

export async function fetchAll() {
  ensureSeeded()
  await delay(350)
  return {
    tickets: read(K.tickets, seedTickets),
    messages: read(K.messages, seedMessages),
    customers: read(K.customers, seedCustomers),
    agents: read(K.agents, seedAgents),
  }
}

export async function persistTickets(tickets) {
  await delay(120)
  write(K.tickets, tickets)
  return tickets
}
export async function persistMessages(messages) {
  await delay(120)
  write(K.messages, messages)
  return messages
}
export async function persistCustomers(customers) {
  await delay(120)
  write(K.customers, customers)
  return customers
}
export async function persistAgents(agents) {
  await delay(120)
  write(K.agents, agents)
  return agents
}

export function resetDemoData() {
  localStorage.removeItem(K.tickets)
  localStorage.removeItem(K.messages)
  localStorage.removeItem(K.customers)
  localStorage.removeItem(K.agents)
  ensureSeeded()
  return {
    tickets: read(K.tickets, seedTickets),
    messages: read(K.messages, seedMessages),
    customers: read(K.customers, seedCustomers),
    agents: read(K.agents, seedAgents),
  }
}

// --- Mock auth (portfolio implementation, NOT production security) ---
import { DEMO_CREDENTIALS, DEMO_USER } from '../data/seed.js'

export async function mockSignIn(email, password) {
  await delay(500)
  const norm = String(email).trim().toLowerCase()
  if (norm === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    write(K.user, DEMO_USER)
    return DEMO_USER
  }
  const users = JSON.parse(localStorage.getItem('relay.extraUsers.v1') || '[]')
  const found = users.find((u) => u.email.toLowerCase() === norm && u.password === password)
  if (found) {
    const { password: _p, ...safe } = found
    write(K.user, safe)
    return safe
  }
  throw new Error('Invalid email or password. Try the demo login.')
}

export async function mockSignUp(name, email, password) {
  await delay(500)
  const users = JSON.parse(localStorage.getItem('relay.extraUsers.v1') || '[]')
  const norm = String(email).trim().toLowerCase()
  if (norm === DEMO_CREDENTIALS.email || users.some((u) => u.email.toLowerCase() === norm)) {
    throw new Error('An account with this email already exists. Try signing in.')
  }
  const user = { id: `u_${Date.now()}`, name, email: norm, role: 'Agent' }
  users.push({ ...user, password })
  localStorage.setItem('relay.extraUsers.v1', JSON.stringify(users))
  write(K.user, user)
  return user
}

export function mockSignOut() {
  localStorage.removeItem(K.user)
}

export function mockSession() {
  try {
    const raw = localStorage.getItem(K.user)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
