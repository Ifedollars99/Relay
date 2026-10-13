import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, ArrowLeft, Send } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import { useStore, customerById, agentById, messagesForTicket } from '../store/useStore.js'
import { filterTickets, sortTickets, isOverdue } from '../lib/filters.js'
import { useDebouncedValue } from '../hooks/hooks.js'
import { timeAgo, cn } from '../lib/utils.js'
import { Button, Field, StatusBadge, PriorityBadge, Card, Badge } from '../components/ui/primitives.jsx'
import { Avatar, EmptyState, PageSkeleton } from '../components/ui/display.jsx'
import { Modal, ConfirmDialog } from '../components/ui/Modal.jsx'

  const ticketSchema = z.object({
  subject: z.string().min(5, 'Use a clear subject, at least 5 characters'),
  customerId: z.string().min(1, 'Select a customer'),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  category: z.enum(['billing', 'technical', 'account', 'feature', 'general']),
  assigneeId: z.string().optional(),
  description: z.string().min(10, 'Add a little detail, at least 10 characters'),
})

function TicketFormModal({ open, onClose, initial }) {
  const customers = useStore((s) => s.customers)
  const agents = useStore((s) => s.agents)
  const createTicket = useStore((s) => s.createTicket)
  const updateTicket = useStore((s) => s.updateTicket)
  const pushToast = useStore((s) => s.pushToast)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: initial || { subject: '', customerId: customers[0]?.id || '', priority: 'medium', category: 'general', assigneeId: '', description: '' },
  })

  const onSubmit = async (data) => {
    const payload = { ...data, assigneeId: data.assigneeId || null }
    if (initial?.id) {
      await updateTicket(initial.id, { subject: payload.subject, priority: payload.priority, category: payload.category, assigneeId: payload.assigneeId })
      pushToast({ title: 'Ticket updated', variant: 'success' })
    } else {
      await createTicket(payload)
      pushToast({ title: 'Ticket created', description: 'Pinned to the top of the queue.', variant: 'success' })
    }
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? `Edit ${initial.id}` : 'New ticket'} description="Saved to this demo workspace." wide>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Subject" error={errors.subject?.message}><input className="input" placeholder="e.g. Invoice shows a double charge" {...register('subject')} /></Field>
        </div>
        <Field label="Customer" error={errors.customerId?.message}>
          <select className="input" {...register('customerId')}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}</select>
        </Field>
        <Field label="Assignee">
          <select className="input" {...register('assigneeId')}><option value="">Unassigned</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        </Field>
        <Field label="Priority" error={errors.priority?.message}>
          <select className="input" {...register('priority')}>{['urgent', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p}</option>)}</select>
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select className="input" {...register('category')}>{['billing', 'technical', 'account', 'feature', 'general'].map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors.description?.message}><textarea className="input" rows={4} placeholder="What is the customer seeing? Steps to reproduce…" {...register('description')} /></Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={isSubmitting}>{isSubmitting ? 'Saving…' : initial?.id ? 'Save changes' : 'Create ticket'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function Tickets() {
  const tickets = useStore((s) => s.tickets)
  const customers = useStore((s) => s.customers)
  const agents = useStore((s) => s.agents)
  const bulkUpdate = useStore((s) => s.bulkUpdate)
  const pushToast = useStore((s) => s.pushToast)
  const state = useStore.getState()

  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 250)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [assignee, setAssignee] = useState('all')
  const [sort, setSort] = useState('newest')
  const [checked, setChecked] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const filtered = useMemo(() => sortTickets(filterTickets(tickets, { search: debounced, status, priority, assignee, customers }), sort), [tickets, debounced, status, priority, assignee, sort, customers])
  const allChecked = filtered.length > 0 && checked.length === filtered.length

  const toggleAll = () => setChecked(allChecked ? [] : filtered.map((t) => t.id))
  const toggleOne = (id) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  const bulk = async (patch, label) => {
    await bulkUpdate(checked, patch)
    pushToast({ title: label, description: `${checked.length} ${checked.length === 1 ? 'ticket' : 'tickets'} updated.`, variant: 'success' })
    setChecked([])
  }

  const f = 'input !w-auto text-xs py-1.5'

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 !p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets, tags, customers…" aria-label="Search tickets" className="input pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <select aria-label="Status" className={f} value={status} onChange={(e) => setStatus(e.target.value)}>{['all', 'open', 'pending', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s === 'all' ? 'Status: all' : s}</option>)}</select>
          <select aria-label="Priority" className={f} value={priority} onChange={(e) => setPriority(e.target.value)}>{['all', 'urgent', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p === 'all' ? 'Priority: all' : p}</option>)}</select>
          <select aria-label="Assignee" className={f} value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="all">Assignee: all</option><option value="unassigned">Unassigned</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select aria-label="Sort" className={f} value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Priority</option><option value="sla">SLA</option><option value="recent">Recently active</option></select>
          <Button size="sm" onClick={() => setModalOpen(true)}><Plus size={15} /> New ticket</Button>
        </div>
      </div>

      {checked.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="card flex flex-wrap items-center gap-2 border-brand-200 !p-3 text-sm dark:!border-brand-500/30"
        >
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{checked.length}</span>
          <span className="text-[13px] font-bold">selected</span>
          <span className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <Button size="sm" variant="secondary" onClick={() => bulk({ status: 'resolved' }, 'Tickets resolved')}>Resolve</Button>
          <Button size="sm" variant="secondary" onClick={() => bulk({ status: 'closed' }, 'Tickets closed')}>Close</Button>
          <Button size="sm" variant="secondary" onClick={() => bulk({ priority: 'high' }, 'Priority set to high')}>Mark urgent</Button>
          <Button size="sm" variant="ghost" onClick={() => setChecked([])}>Clear</Button>
          <Button size="sm" variant="ghost" className="ml-auto text-rose-600 hover:text-rose-700" onClick={() => setConfirmClose(true)}>Close all</Button>
        </motion.div>
      )}

      <div className="card overflow-hidden !p-0">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="table-th w-10"><input type="checkbox" aria-label="Select all tickets" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-indigo-600" /></th>
                <th className="table-th">Ticket</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Status</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Assignee</th>
                <th className="table-th">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((t) => {
                const c = customerById(state, t.customerId)
                const a = agentById(state, t.assigneeId)
                const isChecked = checked.includes(t.id)
                return (
                  <tr key={t.id} className={cn('transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50', isChecked && 'bg-brand-50/50 dark:bg-brand-500/5')}>
                    <td className="table-td"><input type="checkbox" aria-label={`Select ${t.id}`} checked={isChecked} onChange={() => toggleOne(t.id)} className="h-4 w-4 cursor-pointer accent-indigo-600" /></td>
                    <td className="table-td">
                      <Link to={`/app/tickets/${t.id}`} className="font-bold tracking-tight hover:text-brand-600 hover:underline">{t.subject}</Link>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">{t.id} · {timeAgo(t.createdAt)}</p>
                    </td>
                    <td className="table-td"><span className="flex items-center gap-2"><Avatar name={c?.name} id={c?.id} size="xs" /><span className="whitespace-nowrap font-medium">{c?.name}</span></span></td>
                    <td className="table-td"><StatusBadge status={t.status} /></td>
                    <td className="table-td"><PriorityBadge priority={t.priority} /></td>
                    <td className="table-td text-slate-500">{a?.name || <span className="italic text-slate-400">Unassigned</span>}</td>
                    <td className={cn('table-td text-xs font-bold tabular-nums', isOverdue(t) ? 'text-rose-600' : 'text-slate-500')}>{isOverdue(t) ? 'Overdue' : timeAgo(t.slaDueAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState title="No tickets found" description="Adjust filters or create a new ticket." action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus size={15} /> New ticket</Button>} />}
      </div>
      <p className="text-xs text-slate-500">{filtered.length} of {tickets.length} tickets</p>

      <TicketFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ConfirmDialog open={confirmClose} onClose={() => setConfirmClose(false)} title={`Close ${checked.length} tickets?`} description="They will be marked closed. You can reopen them later." confirmLabel="Close all" danger onConfirm={() => bulk({ status: 'closed' }, 'Tickets closed')} />
    </div>
  )
}

export function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ticket = useStore((s) => s.tickets.find((t) => t.id === id))
  const updateTicket = useStore((s) => s.updateTicket)
  const sendReply = useStore((s) => s.sendReply)
  const pushToast = useStore((s) => s.pushToast)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const state = useStore.getState()

  if (!ticket) {
    return <Card><EmptyState title="Ticket not found" description="It may have been removed in another session." action={<Button size="sm" onClick={() => navigate('/app/tickets')}>Back to tickets</Button>} /></Card>
  }
  const customer = customerById(state, ticket.customerId)
  const msgs = messagesForTicket(state, ticket.id)

  const reply = async () => {
    if (!draft.trim()) return
    await sendReply(ticket.id, draft.trim(), {})
    setDraft('')
    pushToast({ title: 'Reply sent', variant: 'success' })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</Button>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-slate-400">{ticket.id} · {ticket.category} · via {ticket.channel}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{ticket.subject}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} />{ticket.tags.map((t) => <Badge key={t}>#{t}</Badge>)}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[['Opened', format(new Date(ticket.createdAt), 'MMM d, yyyy')], ['SLA due', format(new Date(ticket.slaDueAt), 'MMM d, h:mm a')], ['First response', ticket.firstResponseMin ? `${ticket.firstResponseMin}m` : 'Pending'], ['CSAT', ticket.satisfaction ? `${ticket.satisfaction}/5` : '—']].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><dt className="text-[11px] uppercase tracking-wide text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
          </dl>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-bold">Conversation ({msgs.length})</h3>
          <div className="space-y-3">
            {msgs.map((m) => {
              const mine = m.authorType === 'agent'
              const who = mine ? agentById(state, m.authorId)?.name || 'Agent' : customer?.name
              if (m.authorType === 'note' || m.isNote) return <div key={m.id} className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-500/40 dark:bg-amber-500/10"><span className="text-xs font-semibold text-amber-700">Internal note · {format(new Date(m.createdAt), 'MMM d, h:mm a')}</span><p className="mt-1">{m.body}</p></div>
              return <div key={m.id} className="flex gap-2.5"><Avatar name={who} id={m.authorId} size="sm" /><div className="flex-1 rounded-2xl rounded-tl-md border border-slate-200 p-3 text-sm dark:border-slate-700"><p className="mb-1 text-xs font-semibold text-slate-500">{who} · {format(new Date(m.createdAt), 'MMM d, h:mm a')}</p>{m.body}</div></div>
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && reply()} placeholder="Write a reply…" aria-label="Write a reply" className="input flex-1" />
            <Button size="sm" onClick={reply} disabled={!draft.trim()}><Send size={14} /> Send</Button>
          </div>
        </Card>
      </div>
      <aside className="card h-fit space-y-3">
        <h3 className="text-sm font-bold">Manage</h3>
        <Field label="Status"><select className="input" value={ticket.status} onChange={(e) => updateTicket(ticket.id, { status: e.target.value })}>{['open', 'pending', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
        <Field label="Priority"><select className="input" value={ticket.priority} onChange={(e) => updateTicket(ticket.id, { priority: e.target.value })}>{['urgent', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p}</option>)}</select></Field>
        <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
          <p className="font-semibold">Customer</p>
          <Link to={`/app/customers/${customer?.id}`} className="mt-1 flex items-center gap-2 hover:underline"><Avatar name={customer?.name} id={customer?.id} size="sm" /> {customer?.name}<br /></Link>
          <p className="mt-1 text-xs text-slate-500">{customer?.email}<br />{customer?.company}</p>
        </div>
      </aside>
      <TicketFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={ticket} />
    </div>
  )
}
