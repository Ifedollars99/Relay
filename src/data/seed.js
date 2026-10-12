// Centralized realistic demo dataset for Relay.
// All timestamps are generated relative to "now" so trends/SLAs always look live.

const now = Date.now()
const H = 3600 * 1000
const D = 24 * H

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(42)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

export const agents = [
  { id: 'ag_ada', name: 'Ada Okafor', email: 'ada@relay.app', role: 'Admin', status: 'online', team: 'Support', avgResponseMin: 22, resolved: 148, csat: 4.9 },
  { id: 'ag_marcus', name: 'Marcus Bell', email: 'marcus@relay.app', role: 'Lead', status: 'online', team: 'Support', avgResponseMin: 31, resolved: 132, csat: 4.7 },
  { id: 'ag_priya', name: 'Priya Nair', email: 'priya@relay.app', role: 'Agent', status: 'online', team: 'Billing', avgResponseMin: 28, resolved: 121, csat: 4.8 },
  { id: 'ag_tomas', name: 'Tomás Rivera', email: 'tomas@relay.app', role: 'Agent', status: 'away', team: 'Technical', avgResponseMin: 47, resolved: 98, csat: 4.6 },
  { id: 'ag_sofia', name: 'Sofia Lindqvist', email: 'sofia@relay.app', role: 'Agent', status: 'offline', team: 'Support', avgResponseMin: 55, resolved: 84, csat: 4.5 },
  { id: 'ag_kenji', name: 'Kenji Sato', email: 'kenji@relay.app', role: 'Viewer', status: 'offline', team: 'Success', avgResponseMin: 64, resolved: 41, csat: 4.4 },
]

export const customers = [
  { id: 'cu_acme', name: 'Lena Fischer', email: 'lena@acmeco.com', company: 'Acme Co', plan: 'Scale', status: 'vip', location: 'Berlin, DE', joinedAt: new Date(now - 420 * D).toISOString(), tags: ['enterprise', 'annual'], notes: 'Prefers concise updates. Renewal in Q1.' },
  { id: 'cu_north', name: 'James Whitfield', email: 'james@northwind.io', company: 'Northwind', plan: 'Starter', status: 'active', location: 'London, UK', joinedAt: new Date(now - 310 * D).toISOString(), tags: ['self-serve'], notes: '' },
  { id: 'cu_helix', name: 'Amara Diallo', email: 'amara@helixpay.com', company: 'HelixPay', plan: 'Scale', status: 'active', location: 'Lagos, NG', joinedAt: new Date(now - 260 * D).toISOString(), tags: ['fintech', 'priority-onboarding'], notes: 'Fintech — compliance questions route to Marcus.' },
  { id: 'cu_bright', name: 'Chloe Bennett', email: 'chloe@brightline.co', company: 'Brightline', plan: 'Pro', status: 'new', location: 'Austin, US', joinedAt: new Date(now - 18 * D).toISOString(), tags: ['trial'], notes: '' },
  { id: 'cu_koda', name: 'Ravi Kumar', email: 'ravi@koda.dev', company: 'Koda', plan: 'Pro', status: 'active', location: 'Bengaluru, IN', joinedAt: new Date(now - 190 * D).toISOString(), tags: ['api-heavy'], notes: 'Heavy API user, sends great repro steps.' },
  { id: 'cu_loom', name: 'Marta Silva', email: 'marta@loomly.app', company: 'Loomly', plan: 'Starter', status: 'churn-risk', location: 'Lisbon, PT', joinedAt: new Date(now - 340 * D).toISOString(), tags: ['at-risk'], notes: 'Frustrated with export limits. Handle with care.' },
  { id: 'cu_vertex', name: 'Daniel Osei', email: 'daniel@vertexlabs.com', company: 'Vertex Labs', plan: 'Enterprise', status: 'vip', location: 'Toronto, CA', joinedAt: new Date(now - 500 * D).toISOString(), tags: ['enterprise', 'sla-gold'], notes: 'Gold SLA — 1h first response.' },
  { id: 'cu_nimbus', name: 'Yuki Tanaka', email: 'yuki@nimbus.jp', company: 'Nimbus', plan: 'Pro', status: 'active', location: 'Osaka, JP', joinedAt: new Date(now - 150 * D).toISOString(), tags: [], notes: '' },
  { id: 'cu_frame', name: 'Olivia Grant', email: 'olivia@framecast.fm', company: 'Framecast', plan: 'Starter', status: 'new', location: 'New York, US', joinedAt: new Date(now - 9 * D).toISOString(), tags: ['trial'], notes: '' },
  { id: 'cu_polar', name: 'Henrik Dahl', email: 'henrik@polaris.no', company: 'Polaris', plan: 'Scale', status: 'active', location: 'Oslo, NO', joinedAt: new Date(now - 220 * D).toISOString(), tags: [], notes: '' },
  { id: 'cu_sable', name: 'Fatima Al-Hassan', email: 'fatima@sable.ai', company: 'Sable AI', plan: 'Pro', status: 'active', location: 'Dubai, AE', joinedAt: new Date(now - 95 * D).toISOString(), tags: ['ai-beta'], notes: 'Beta tester for AI summaries.' },
  { id: 'cu_copper', name: 'Leo Martins', email: 'leo@copperline.com', company: 'Copperline', plan: 'Starter', status: 'churn-risk', location: 'São Paulo, BR', joinedAt: new Date(now - 280 * D).toISOString(), tags: ['at-risk'], notes: '' },
  { id: 'cu_atlas', name: 'Grace Mensah', email: 'grace@atlasfreight.com', company: 'Atlas Freight', plan: 'Scale', status: 'active', location: 'Accra, GH', joinedAt: new Date(now - 175 * D).toISOString(), tags: [], notes: '' },
  { id: 'cu_juniper', name: 'Noah Kim', email: 'noah@juniperhealth.com', company: 'Juniper Health', plan: 'Enterprise', status: 'vip', location: 'Seattle, US', joinedAt: new Date(now - 390 * D).toISOString(), tags: ['hipaa'], notes: 'No PHI in tickets. Redact if shared.' },
]

const subjects = [
  ['Invoice shows double charge for March', 'billing'],
  ['Cannot export report larger than 5k rows', 'technical'],
  ['SSO login loops back to sign-in page', 'account'],
  ['Webhook deliveries delayed by ~20 minutes', 'technical'],
  ['How do I add a teammate to my workspace?', 'general'],
  ['Refund request for downgraded plan', 'billing'],
  ['API returns 429 earlier than documented limits', 'technical'],
  ['Request: audit log for compliance review', 'feature'],
  ['Password reset email never arrives', 'account'],
  ['Dashboard loads slowly for large date ranges', 'technical'],
  ['Can we get a DPA signed?', 'general'],
  ['Slack notifications stopped working', 'technical'],
  ['Seat count wrong after removing a member', 'billing'],
  ['Feature request: saved views in inbox', 'feature'],
  ['Mobile app crashes on ticket detail', 'technical'],
  ['Need to change workspace owner', 'account'],
  ['CSAT survey link returns 404', 'technical'],
  ['Question about data retention policy', 'general'],
  ['Priority support hours over holidays?', 'general'],
  ['CSV import fails on special characters', 'technical'],
]

const bodies = {
  billing: [
    'Hi team, we noticed a duplicate charge on our latest invoice. Could you take a look and reverse one of them? Happy to share the invoice IDs.',
    'We downgraded last week but were still billed at the higher tier. Can you confirm the refund amount and timeline?',
  ],
  technical: [
    'Hitting an issue consistently since yesterday morning. Steps to reproduce: 1) open reports 2) set range to 90 days 3) export. It fails at ~60%. Screenshot attached in original thread.',
    'Our integration started receiving delayed webhooks. Nothing changed on our side — could you check the delivery queue on your end?',
  ],
  account: [
    'One of our admins left and we need to transfer workspace ownership. What verification do you need from us?',
    'SSO via Okta loops back to the login screen. Tried incognito + different browser. Other SAML apps work fine.',
  ],
  feature: [
    'Would love saved views in the inbox so our billing queue can share filters. Happy to beta test.',
    'For our SOC 2 review we need an export of the audit log for the last 6 months. Is that self-serve?',
  ],
  general: [
    'Quick question about your data retention policy — how long are closed conversations stored?',
    'What are support hours over the holidays? We have a launch and want to plan coverage.',
  ],
}

const agentReplies = [
  'Thanks for flagging this — I can see what happened. I’ve applied a fix on our side and I’m monitoring it now. I’ll follow up within the hour with confirmation.',
  'Good catch, and sorry for the trouble. I reproduced this in a test workspace. We’re shipping a fix — in the meantime here’s a workaround you can use today.',
  'I’ve checked your workspace settings and the logs. Everything points to a configuration issue, which is good news — here’s exactly how to resolve it in two steps.',
  'Looping in the right person on our side. I’ve marked this as high priority and set an SLA reminder so it doesn’t slip. Expect an update from me today.',
  'Thanks for the detail — those repro steps helped a lot. I’ve filed this with engineering (ref ENG-2314) and applied a temporary workaround to unblock you.',
]

const customerFollowups = [
  'Thanks — that worked. Appreciate the quick turnaround.',
  'Still seeing the issue on our end after trying those steps. Happy to jump on a quick call if that helps.',
  'Any update on this? It’s blocking our month-end close.',
  'That unblocked us for now. Let me know when the permanent fix ships.',
]

const STATUS = ['open', 'open', 'pending', 'pending', 'resolved', 'resolved', 'resolved', 'closed']
const PRIORITY = ['urgent', 'high', 'high', 'medium', 'medium', 'medium', 'low']
const CHANNEL = ['email', 'chat', 'chat', 'email', 'phone', 'chat']

function buildTickets() {
  const tickets = []
  const messages = []
  let n = 1040
  for (let i = 0; i < 34; i++) {
    n += 1 + Math.floor(rand() * 3)
    const [subject, category] = subjects[i % subjects.length]
    const customer = customers[Math.floor(rand() * customers.length)]
    const status = STATUS[Math.floor(rand() * STATUS.length)]
    const priority = category === 'billing' && rand() > 0.6 ? 'high' : pick(PRIORITY)
    const channel = pick(CHANNEL)
    const createdDaysAgo = [0, 0, 1, 1, 2, 3, 4, 5, 7, 9, 12, 15, 20, 28, 35, 45, 60][Math.floor(rand() * 17)]
    const createdAt = new Date(now - createdDaysAgo * D - Math.floor(rand() * 20) * H).toISOString()
    const updatedAt = new Date(new Date(createdAt).getTime() + (2 + rand() * 40) * H).toISOString()
    const assignee = rand() > 0.18 ? pick(agents).id : null
    const slaHours = priority === 'urgent' ? 4 : priority === 'high' ? 8 : priority === 'medium' ? 24 : 72
    const slaDueAt = new Date(new Date(createdAt).getTime() + slaHours * H).toISOString()
    const firstResponseMin = status === 'open' && rand() > 0.5 ? null : Math.round(12 + rand() * 180)
    const firstResponseAt = firstResponseMin ? new Date(new Date(createdAt).getTime() + firstResponseMin * 60000).toISOString() : null
    const resolvedAt = status === 'resolved' || status === 'closed' ? new Date(new Date(createdAt).getTime() + (4 + rand() * 60) * H).toISOString() : null
    const satisfaction = resolvedAt && rand() > 0.3 ? [5, 5, 5, 4, 4, 3][Math.floor(rand() * 6)] : null
    const tagsPool = ['billing', 'api', 'sso', 'export', 'onboarding', 'mobile', 'sla-gold', 'follow-up']
    const tags = [category, ...(rand() > 0.6 ? [pick(tagsPool)] : [])].filter((v, idx, a) => a.indexOf(v) === idx)
    const id = `RL-${n}`
    tickets.push({
      id, subject, customerId: customer.id, assigneeId: assignee, status, priority,
      category, tags, channel, createdAt, updatedAt, slaDueAt,
      firstResponseAt, firstResponseMin, resolvedAt, satisfaction,
    })
    // messages
    const catBodies = bodies[category] || bodies.general
    const mCount = 2 + Math.floor(rand() * 4)
    let t = new Date(createdAt).getTime()
    messages.push({ id: `${id}-m1`, ticketId: id, authorType: 'customer', authorId: customer.id, body: catBodies[Math.floor(rand() * catBodies.length)], createdAt: new Date(t).toISOString(), isNote: false })
    for (let k = 2; k <= mCount; k++) {
      t += (1 + rand() * 18) * H
      if (t > now) break
      const isNote = rand() > 0.82
      if (isNote) {
        const noteAgent = agents[Math.floor(rand() * agents.length)]
        messages.push({ id: `${id}-m${k}`, ticketId: id, authorType: 'note', authorId: noteAgent.id, body: 'Internal note: checked logs, looks like a config drift after deploy. Keeping an eye on it.', createdAt: new Date(t).toISOString(), isNote: true })
      } else if (k % 2 === 0) {
        const ag = agents[Math.floor(rand() * agents.length)]
        messages.push({ id: `${id}-m${k}`, ticketId: id, authorType: 'agent', authorId: assignee || ag.id, body: agentReplies[Math.floor(rand() * agentReplies.length)], createdAt: new Date(t).toISOString(), isNote: false })
      } else {
        messages.push({ id: `${id}-m${k}`, ticketId: id, authorType: 'customer', authorId: customer.id, body: customerFollowups[Math.floor(rand() * customerFollowups.length)], createdAt: new Date(t).toISOString(), isNote: false })
      }
    }
  }
  // Ensure a few guaranteed states for demo: unread urgent open, overdue SLA
  tickets[0].status = 'open'
  tickets[0].priority = 'urgent'
  tickets[0].firstResponseMin = null
  tickets[0].firstResponseAt = null
  tickets[0].createdAt = new Date(now - 3 * H).toISOString()
  tickets[1].status = 'pending'
  tickets[1].priority = 'high'
  return { tickets, messages }
}

const built = buildTickets()

export const seedTickets = built.tickets
export const seedMessages = built.messages

export function volumeSeries(days = 30) {
  const r = mulberry32(7)
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * D)
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      tickets: Math.round(6 + r() * 14 + 4 * Math.sin(i / 3)),
      resolved: Math.round(5 + r() * 12),
      avgFirstResponseMin: Math.round(24 + r() * 40),
      csat: Number((4.2 + r() * 0.7).toFixed(2)),
    })
  }
  return out
}

export const DEMO_USER = { id: 'demo', name: 'Demo Agent', email: 'demo@relay.app', role: 'Admin' }
export const DEMO_CREDENTIALS = { email: 'demo@relay.app', password: 'password123' }
