import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Send, StickyNote, Inbox as InboxIcon, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'motion/react'
import { useStore, customerById, agentById, messagesForTicket } from '../store/useStore.js'
import { filterTickets, sortTickets, isOverdue } from '../lib/filters.js'
import { useDebouncedValue } from '../hooks/hooks.js'
import { timeAgo, cn } from '../lib/utils.js'
import { Button, StatusBadge, PriorityBadge, Badge } from '../components/ui/primitives.jsx'
import { Avatar, EmptyState } from '../components/ui/display.jsx'

const STATUSES = ['all', 'open', 'pending', 'resolved', 'closed']
const PRIORITIES = ['all', 'urgent', 'high', 'medium', 'low']

export default function Inbox() {
  const tickets = useStore((s) => s.tickets)
  const customers = useStore((s) => s.customers)
  const agents = useStore((s) => s.agents)
  const updateTicket = useStore((s) => s.updateTicket)
  const sendReply = useStore((s) => s.sendReply)
  const pushToast = useStore((s) => s.pushToast)

  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 250)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')
  const [assignee, setAssignee] = useState('all')
  const [sort, setSort] = useState('recent')
  const [selectedId, setSelectedId] = useState(null)
  const [visible, setVisible] = useState(15)
  const [tab, setTab] = useState('reply')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [showDetail, setShowDetail] = useState(false) // mobile: show conversation
  const searchRef = useRef(null)
  const state = useStore.getState()

  const categories = useMemo(() => ['all', ...new Set(tickets.map((t) => t.category))], [tickets])

  const filtered = useMemo(() => {
    const f = filterTickets(tickets, { search: debounced, status, priority, category, assignee, customers })
    return sortTickets(f, sort)
  }, [tickets, debounced, status, priority, category, assignee, sort, customers])

  useEffect(() => {
    if (!selectedId || !filtered.some((t) => t.id === selectedId)) {
      setSelectedId(filtered[0]?.id || null)
    }
  }, [filtered, selectedId])

  // keyboard: "/" focuses search, j/k move selection
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if ((e.key === 'j' || e.key === 'k' || e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        if (!filtered.length) return
        const idx = filtered.findIndex((t) => t.id === selectedId)
        const next = e.key === 'j' || e.key === 'ArrowDown' ? Math.min(filtered.length - 1, idx + 1) : Math.max(0, idx - 1)
        setSelectedId(filtered[next].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered, selectedId])

  const selected = tickets.find((t) => t.id === selectedId) || null
  const msgs = useMemo(() => (selected ? messagesForTicket(state, selected.id) : []), [selected, state.messages])
  const customer = selected ? customerById(state, selected.customerId) : null

  const doSend = async () => {
    if (!draft.trim() || !selected) return
    setSending(true)
    await sendReply(selected.id, draft.trim(), { isNote: tab === 'note' })
    setDraft('')
    setSending(false)
    pushToast({ title: tab === 'note' ? 'Note added' : 'Reply sent', description: tab === 'note' ? 'Visible to your team only.' : `Delivered to ${customer?.email} in this demo.`, variant: 'success' })
  }

  const selectCls = 'input !w-auto text-xs font-medium py-1.5'

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_280px]">
      {/* List */}
      <section aria-label="Ticket list" className={cn('card flex max-h-[calc(100vh-140px)] min-h-[500px] flex-col overflow-hidden !p-0', showDetail && 'hidden lg:flex')}>
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={searchRef} value={search} onChange={(e) => { setSearch(e.target.value); setVisible(15) }} placeholder="Search subject, customer…" aria-label="Search tickets" className="input pl-9" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <select aria-label="Status filter" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
            </select>
            <select aria-label="Priority filter" className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p === 'all' ? 'All priorities' : p}</option>)}
            </select>
            <select aria-label="Sort tickets" className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Recently active</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="sla">SLA deadline</option>
            </select>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <select aria-label="Category filter" className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
            <select aria-label="Assignee filter" className={selectCls} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="all">All agents</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto" role="listbox" aria-label="Conversations">
          {filtered.slice(0, visible).map((t) => {
            const c = customerById(state, t.customerId)
            const active = t.id === selectedId
            return (
              <motion.button
                key={t.id}
                role="option"
                aria-selected={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setSelectedId(t.id); setShowDetail(true) }}
                className={cn('relative flex w-full items-start gap-2.5 border-b border-slate-100 px-3.5 py-3 text-left transition-colors duration-150 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/60', active && 'bg-brand-50/60 dark:bg-brand-500/10')}>
                {active && <motion.span layoutId="inbox-active" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" transition={{ duration: 0.2 }} />}
                <Avatar name={c?.name} id={c?.id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-bold tracking-tight">{t.subject}</span>
                    {isOverdue(t) && <Badge tone="rose">SLA</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{c?.name} · {t.id}</span>
                  <span className="mt-1.5 flex items-center gap-1.5"><StatusBadge status={t.status} /><PriorityBadge priority={t.priority} /><span className="ml-auto text-[11px] tabular-nums text-slate-400">{timeAgo(t.updatedAt)}</span></span>
                </span>
              </motion.button>
            )
          })}
          {filtered.length === 0 && <EmptyState icon={InboxIcon} title="Nothing matches those filters" description="Try a shorter search term or clear a filter." action={<Button size="sm" variant="secondary" onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); setCategory('all'); setAssignee('all') }}>Clear filters</Button>} />}
        </div>
        {visible < filtered.length && (
          <div className="border-t border-slate-200 p-2.5 dark:border-slate-800">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setVisible((v) => v + 15)}>Show more ({filtered.length - visible} remaining)</Button>
          </div>
        )}
      </section>

      {/* Conversation */}
      <section aria-label="Conversation" className={cn('card flex max-h-[calc(100vh-140px)] min-h-[500px] flex-col overflow-hidden !p-0', !showDetail && 'hidden lg:flex')}>
        {!selected ? (
          <EmptyState icon={InboxIcon} title="Select a conversation" description="Choose a ticket from the queue to read and reply." />
        ) : (
          <>
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowDetail(false)} aria-label="Back to list"><ChevronLeft size={18} /></Button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-bold">{selected.subject}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{selected.id} · {selected.category} · via {selected.channel} · opened {timeAgo(selected.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusBadge status={selected.status} /><PriorityBadge priority={selected.priority} />
                    {selected.tags.map((tg) => <Badge key={tg}>#{tg}</Badge>)}
                  </div>
                </div>
                <Link to={`/app/tickets/${selected.id}`} className="text-xs font-semibold text-brand-600 hover:underline">Full view</Link>
              </div>
            </div>
            <div className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/40">
              {msgs.map((m) => {
                const mine = m.authorType === 'agent'
                const note = m.authorType === 'note' || m.isNote
                if (note) {
                  const ag = agentById(state, m.authorId)
                  return (
                    <div key={m.id} className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-500/40 dark:bg-amber-500/10">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300"><StickyNote size={13} /> Internal note · {ag?.name} · {format(new Date(m.createdAt), 'MMM d, h:mm a')}</p>
                      <p className="text-slate-700 dark:text-slate-200">{m.body}</p>
                    </div>
                  )
                }
                const who = mine ? agentById(state, m.authorId)?.name || 'Agent' : customer?.name
                return (
                  <div key={m.id} className={cn('flex gap-2.5', mine && 'flex-row-reverse')}>
                    <Avatar name={who} id={m.authorId} size="sm" />
                    <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm', mine ? 'rounded-tr-md bg-brand-600 text-white' : 'rounded-tl-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900')}>
                      <p className={cn('mb-1 text-[11px] font-semibold', mine ? 'text-brand-100' : 'text-slate-500')}>{who} · {format(new Date(m.createdAt), 'MMM d, h:mm a')}</p>
                      <p className="leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
              <div className="mb-2 flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold dark:bg-slate-800">
                {[['reply', 'Reply'], ['note', 'Internal note']].map(([k, label]) => (
                  <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className={cn('relative flex-1 rounded-lg px-3 py-1.5 transition-colors', tab !== k && 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
                    {tab === k && <motion.span layoutId="composer-tab" className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-900" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} />}
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor="composer">{tab === 'note' ? 'Internal note' : 'Reply'}</label>
              <textarea id="composer" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') doSend() }}
                placeholder={tab === 'note' ? 'Add a note for your team… (Cmd + Enter to save)' : `Reply to ${customer?.name}… (Cmd + Enter to send)`} className="input resize-none" />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">{tab === 'note' ? 'Only your team can see this.' : 'Demo workspace — replies stay in your browser.'}</p>
                <Button size="sm" loading={sending} disabled={!draft.trim() || sending} onClick={doSend}><Send size={14} /> {sending ? 'Sending' : tab === 'note' ? 'Add note' : 'Send reply'}</Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Customer / ticket panel */}
      {selected && (
        <aside aria-label="Ticket details" className="card hidden max-h-[calc(100vh-140px)] overflow-y-auto scroll-thin xl:block">
          <h3 className="text-sm font-bold">Customer</h3>
          <Link to={`/app/customers/${customer?.id}`} className="mt-2 flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Avatar name={customer?.name} id={customer?.id} />
            <span><span className="block text-sm font-semibold">{customer?.name}</span><span className="block text-xs text-slate-500">{customer?.company} · {customer?.plan}</span></span>
          </Link>
          <p className="mt-1 text-xs text-slate-500">{customer?.email}<br />{customer?.location}</p>
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div>
              <label className="label" htmlFor="inbox-status">Status</label>
              <select id="inbox-status" className="input" value={selected.status} onChange={(e) => { updateTicket(selected.id, { status: e.target.value }); pushToast({ title: `Marked ${e.target.value}`, variant: 'success' }) }}>
                {['open', 'pending', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="inbox-priority">Priority</label>
              <select id="inbox-priority" className="input" value={selected.priority} onChange={(e) => updateTicket(selected.id, { priority: e.target.value })}>
                {['urgent', 'high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="inbox-assign">Assignee</label>
              <select id="inbox-assign" className="input" value={selected.assigneeId || ''} onChange={(e) => { updateTicket(selected.id, { assigneeId: e.target.value || null }); pushToast({ title: 'Ticket reassigned', variant: 'success' }) }}>
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
              <p className="font-semibold">SLA</p>
              <p className={cn('mt-0.5 font-bold', isOverdue(selected) ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300')}>Due {format(new Date(selected.slaDueAt), 'MMM d, h:mm a')}{isOverdue(selected) ? ' · overdue' : ''}</p>
              <p className="mt-1 text-slate-500">First response: {selected.firstResponseMin ? `${selected.firstResponseMin}m` : 'pending'}</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
