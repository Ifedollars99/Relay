import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, Ticket as TicketIcon, CircleCheck, Hourglass, Star } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { useStore, customerById, agentById } from '../store/useStore.js'
import { ticketStats, isOverdue } from '../lib/filters.js'
import { volumeSeries } from '../data/seed.js'
import { formatMinutes, timeAgo, cn } from '../lib/utils.js'
import { Card, SectionTitle, StatusBadge, PriorityBadge } from '../components/ui/primitives.jsx'
import { Avatar, PageSkeleton } from '../components/ui/display.jsx'

const RANGES = [{ k: '7d', days: 7, label: '7 days' }, { k: '30d', days: 30, label: '30 days' }, { k: '90d', days: 90, label: '90 days' }]

function StatCard({ icon: Icon, label, value, delta, invert }) {
  const up = delta != null && delta >= 0
  const good = invert ? !up : up
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Icon size={18} /></span>
        {delta != null && (
          <span className={cn('flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold', good ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300')}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  )
}

export default function Dashboard() {
  const loading = useStore((s) => s.loading)
  const tickets = useStore((s) => s.tickets)
  const customers = useStore((s) => s.customers)
  const agents = useStore((s) => s.agents)
  const [range, setRange] = useState('30d')
  const days = RANGES.find((r) => r.k === range).days

  const stats = useMemo(() => {
    const since = new Date(Date.now() - days * 86400000)
    const cur = ticketStats(tickets, since)
    const prev = ticketStats(tickets.filter((t) => new Date(t.createdAt) < since))
    const pct = (c, p) => (p === 0 ? null : Math.round(((c - p) / Math.max(p, 1)) * 100))
    return { cur, deltas: { total: pct(cur.total, prev.total), awaiting: pct(cur.awaiting, prev.open + prev.pending), resolved: pct(cur.resolved, prev.resolved) } }
  }, [tickets, days])

  const series = useMemo(() => volumeSeries(90).slice(-days), [days])
  const statusData = useMemo(() => {
    const counts = { open: 0, pending: 0, resolved: 0, closed: 0 }
    tickets.forEach((t) => { if (counts[t.status] != null) counts[t.status] += 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tickets])
  const prioData = useMemo(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 }
    tickets.forEach((t) => { if (counts[t.priority] != null) counts[t.priority] += 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tickets])

  const recent = useMemo(() => [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5), [tickets])
  const sla = useMemo(() => tickets.filter((t) => t.status === 'open' || t.status === 'pending').sort((a, b) => new Date(a.slaDueAt) - new Date(b.slaDueAt)).slice(0, 5), [tickets])
  const agentRows = useMemo(() => agents.map((a) => ({ ...a, assigned: tickets.filter((t) => t.assigneeId === a.id && (t.status === 'open' || t.status === 'pending')).length })).sort((a, b) => b.resolved - a.resolved).slice(0, 5), [agents, tickets])
  const state = useStore.getState()

  if (loading) return <PageSkeleton />

  const COLORS = { open: '#0ea5e9', pending: '#f59e0b', resolved: '#10b981', closed: '#94a3b8' }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="tablist" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r.k} role="tab" aria-selected={range === r.k} onClick={() => setRange(r.k)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', range === r.k ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200')}>{r.label}</button>
          ))}
        </div>
        <Link to="/app/tickets" className="text-sm font-semibold text-brand-600 hover:underline">View all tickets →</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={TicketIcon} label="Total tickets" value={stats.cur.total} delta={stats.deltas.total} />
        <StatCard icon={Hourglass} label="Open" value={stats.cur.open} delta={stats.deltas.awaiting} invert />
        <StatCard icon={Clock} label="Awaiting response" value={stats.cur.awaiting} delta={stats.deltas.awaiting} invert />
        <StatCard icon={CircleCheck} label="Resolved" value={stats.cur.resolved} delta={stats.deltas.resolved} />
        <Card className="p-4"><p className="text-xs text-slate-500">Avg. first response</p><p className="mt-1 text-2xl font-extrabold">{formatMinutes(stats.cur.avgFr)}</p><p className="text-xs text-slate-500">across {range}</p></Card>
        <Card className="p-4"><p className="flex items-center gap-1 text-xs text-slate-500"><Star size={12} className="text-amber-400" /> CSAT</p><p className="mt-1 text-2xl font-extrabold">{stats.cur.csat ? stats.cur.csat.toFixed(1) : '—'}</p><p className="text-xs text-slate-500">customer satisfaction</p></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle title="Ticket volume" subtitle={`New vs resolved · last ${days} days`} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="tickets" name="New" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle title="By status" subtitle="Current queue mix" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={2}>
                  {statusData.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs capitalize"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.name] }} /> {d.name} <span className="ml-auto font-bold">{d.value}</span></div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By priority</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prioData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11, textTransform: 'capitalize' }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle title="Recent conversations" subtitle="Latest activity" action={<Link to="/app/inbox" className="text-xs font-semibold text-brand-600 hover:underline">Open inbox</Link>} />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t) => {
              const c = customerById(state, t.customerId)
              return (
                <Link key={t.id} to={`/app/tickets/${t.id}`} className="flex items-center gap-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2">
                  <Avatar name={c?.name} id={c?.id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="truncate text-xs text-slate-500">{c?.name} · {c?.company} · {timeAgo(t.updatedAt)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </Link>
              )
            })}
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Upcoming SLAs" subtitle="Sorted by deadline" />
            <div className="space-y-2">
              {sla.map((t) => {
                const overdue = isOverdue(t)
                return (
                  <Link key={t.id} to={`/app/tickets/${t.id}`} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-300 dark:border-slate-700">
                    {overdue ? <AlertTriangle size={15} className="text-rose-500" /> : <Clock size={15} className="text-slate-400" />}
                    <span className="min-w-0 flex-1 truncate font-medium">{t.subject}</span>
                    <span className={cn('text-xs font-semibold', overdue ? 'text-rose-600' : 'text-slate-500')}>{overdue ? 'Overdue' : timeAgo(t.slaDueAt).replace(' ago', ' left')}</span>
                  </Link>
                )
              })}
              {sla.length === 0 && <p className="text-sm text-slate-500">Queue is clear. Nice work.</p>}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Agent performance" subtitle="Resolved all-time" action={<Link to="/app/team" className="text-xs font-semibold text-brand-600 hover:underline">Team</Link>} />
            <div className="space-y-2.5">
              {agentRows.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <Avatar name={a.name} id={a.id} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{a.name}</p><p className="text-xs text-slate-500">{a.assigned} active · ★ {a.csat}</p></div>
                  <span className="text-sm font-bold">{a.resolved}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
