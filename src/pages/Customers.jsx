import { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Save } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { useDebouncedValue } from '../hooks/hooks.js'
import { timeAgo } from '../lib/utils.js'
import { Button, Card, Badge, StatusBadge, SectionTitle } from '../components/ui/primitives.jsx'
import { Avatar, EmptyState } from '../components/ui/display.jsx'

export function Customers() {
  const customers = useStore((s) => s.customers)
  const tickets = useStore((s) => s.tickets)
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 250)

  const rows = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    const list = customers.filter((c) => !q || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q))
    return list.map((c) => {
      const ct = tickets.filter((t) => t.customerId === c.id)
      return { ...c, open: ct.filter((t) => t.status === 'open' || t.status === 'pending').length, resolved: ct.filter((t) => t.status === 'resolved' || t.status === 'closed').length, total: ct.length }
    })
  }, [customers, tickets, debounced])

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, company…" aria-label="Search customers" className="input pl-9" />
      </div>
      {rows.length === 0 && <Card><EmptyState title="No customers match" description="Try a different search." /></Card>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <Link key={c.id} to={`/app/customers/${c.id}`} className="card p-4 transition-shadow hover:shadow-pop">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} id={c.id} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c.name}</p>
                <p className="truncate text-xs text-slate-500">{c.company} · {c.plan}</p>
              </div>
              <Badge tone={c.status === 'vip' ? 'indigo' : c.status === 'churn-risk' ? 'rose' : c.status === 'new' ? 'sky' : 'slate'} className="capitalize">{c.status}</Badge>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span><strong className="text-slate-900 dark:text-white">{c.open}</strong> open</span>
              <span><strong className="text-slate-900 dark:text-white">{c.resolved}</strong> resolved</span>
              <span className="ml-auto">{c.total} total</span>
            </div>
            {c.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{c.tags.map((t) => <Badge key={t}>#{t}</Badge>)}</div>}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customer = useStore((s) => s.customers.find((c) => c.id === id))
  const tickets = useStore((s) => s.tickets.filter((t) => t.customerId === id))
  const messages = useStore((s) => s.messages)
  const updateCustomer = useStore((s) => s.updateCustomer)
  const pushToast = useStore((s) => s.pushToast)
  const [notes, setNotes] = useState(null)
  const [tagInput, setTagInput] = useState('')

  if (!customer) return <Card><EmptyState title="Customer not found" action={<Button size="sm" onClick={() => navigate('/app/customers')}>Back</Button>} /></Card>
  const draft = notes ?? customer.notes ?? ''

  const saveNotes = async () => {
    await updateCustomer(customer.id, { notes: draft })
    setNotes(null)
    pushToast({ title: 'Notes saved', variant: 'success' })
  }
  const addTag = async () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || customer.tags.includes(t)) return
    await updateCustomer(customer.id, { tags: [...customer.tags, t] })
    setTagInput('')
  }

  const recent = [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const lastTouch = recent[0]?.updatedAt

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</Button>
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={customer.name} id={customer.id} size="lg" className="!h-14 !w-14 !text-base" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-sm text-slate-500">{customer.email} · {customer.company}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge className="capitalize" tone={customer.status === 'vip' ? 'indigo' : customer.status === 'churn-risk' ? 'rose' : 'slate'}>{customer.status}</Badge>
                <Badge>{customer.plan} plan</Badge>
                <Badge>{customer.location}</Badge>
              </div>
            </div>
            <select aria-label="Customer status" className="input !w-auto" value={customer.status} onChange={(e) => updateCustomer(customer.id, { status: e.target.value })}>
              {['active', 'vip', 'new', 'churn-risk'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Card>
        <Card>
          <SectionTitle title={`Ticket history (${tickets.length})`} subtitle={lastTouch ? `Last activity ${timeAgo(lastTouch)}` : 'No tickets yet'} />
          {recent.length === 0 && <p className="text-sm text-slate-500">No tickets for this customer.</p>}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t) => (
              <Link key={t.id} to={`/app/tickets/${t.id}`} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium hover:underline">{t.subject}</span><span className="text-xs text-slate-500">{t.id} · {timeAgo(t.createdAt)} · {messages.filter((m) => m.ticketId === t.id).length} messages</span></span>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <aside className="space-y-4">
        <Card>
          <h3 className="text-sm font-bold">Notes</h3>
          <textarea aria-label="Customer notes" rows={4} className="input mt-2 resize-none" value={draft} onChange={(e) => setNotes(e.target.value)} placeholder="Context the next agent should know…" />
          <Button size="sm" className="mt-2" disabled={draft === (customer.notes ?? '')} onClick={saveNotes}><Save size={14} /> Save notes</Button>
        </Card>
        <Card>
          <h3 className="text-sm font-bold">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customer.tags.map((t) => (
              <button key={t} title="Remove tag" aria-label={`Remove tag ${t}`} onClick={() => updateCustomer(customer.id, { tags: customer.tags.filter((x) => x !== t) })} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800">#{t} ×</button>
            ))}
            {customer.tags.length === 0 && <p className="text-xs text-slate-500">No tags yet.</p>}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} placeholder="Add tag…" aria-label="Add tag" className="input" />
            <Button size="sm" variant="secondary" onClick={addTag}>Add</Button>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold">Facts</h3>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Open</dt><dd className="font-bold">{tickets.filter((t) => t.status === 'open' || t.status === 'pending').length}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Resolved</dt><dd className="font-bold">{tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Customer since</dt><dd className="font-semibold">{new Date(customer.joinedAt).toLocaleDateString()}</dd></div>
          </dl>
        </Card>
      </aside>
    </div>
  )
}
