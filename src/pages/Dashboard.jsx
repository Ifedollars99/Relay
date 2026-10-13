import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, Ticket as TicketIcon, CircleCheck, Hourglass, Star, ArrowRight, ShieldAlert } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts'
import { useStore, customerById } from '../store/useStore.js'
import { ticketStats, isOverdue } from '../lib/filters.js'
import { volumeSeries } from '../data/seed.js'
import { formatMinutes, timeAgo, cn } from '../lib/utils.js'
import { Card, SectionTitle, StatusBadge, PriorityBadge } from '../components/ui/primitives.jsx'
import { Avatar, PageSkeleton } from '../components/ui/display.jsx'
import { Stagger, Item, CountUp } from '../components/ui/motion.jsx'

const RANGES = [{ k: '7d', days: 7, label: '7 days' }, { k: '30d', days: 30, label: '30 days' }, { k: '90d', days: 90, label: '90 days' }]

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <p className="mb-1 font-mono text-[11px] font-semibold text-slate-500">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full" style={{ background: p.stroke || p.fill || p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, delta, invert, hint, format }) {
  const up = delta != null && delta >= 0
  const good = invert ? !up : up
  return (
    <Card className="group relative overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-300"><Icon size={18} strokeWidth={2} /></span>
        {delta != null && (
          <span className={cn('flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums', good ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300')}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight">
        {format ? format(value) : <CountUp value={value} />}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </Card>
  )
}

export default function Dashboard() {
  const loading = useStore((s) => s.loading)
  const tickets = useStore((s) => s.tickets)
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
  const openCount = sla.length
  const maxAssigned = Math.max(1, ...agentRows.map((a) => a.resolved))

  if (loading) return <PageSkeleton />

  const COLORS = { open: '#0ea5e9', pending: '#f59e0b', resolved: '#10b981', closed: '#94a3b8' }

  return (
    <Stagger className="space-y-5">
      <Item className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm dark:border-slate-700/70 dark:bg-slate-900" role="tablist" aria-label="Date range">
            {RANGES.map((r) => (
              <button key={r.k} role="tab" aria-selected={range === r.k} onClick={() => setRange(r.k)} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150', range === r.k ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200')}>{r.label}</button>
            ))}
          </div>
          {openCount > 0 && (
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 sm:flex dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldAlert size={13} /> {openCount} need a reply
            </span>
          )}
        </div>
        <Link to="/app/tickets" className="group flex items-center gap-1 text-[13px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">View all tickets <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
      </Item>

      <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" delay={0.05}>
        <Item><StatCard icon={TicketIcon} label="Total tickets" value={stats.cur.total} delta={stats.deltas.total} hint={`Last ${days} days`} /></Item>
        <Item><StatCard icon={Hourglass} label="Open now" value={stats.cur.open} delta={stats.deltas.awaiting} invert hint="Needs triage" /></Item>
        <Item><StatCard icon={Clock} label="Awaiting reply" value={stats.cur.awaiting} delta={stats.deltas.awaiting} invert hint="Customer waiting" /></Item>
        <Item><StatCard icon={CircleCheck} label="Resolved" value={stats.cur.resolved} delta={stats.deltas.resolved} hint={`Last ${days} days`} /></Item>
        <Item>
          <Card className="p-4">
            <p className="text-xs font-medium text-slate-500">Median first response</p>
            <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight">{formatMinutes(stats.cur.avgFr)}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Across selected range</p>
          </Card>
        </Item>
        <Item>
          <Card className="p-4">
            <p className="flex items-center gap-1 text-xs font-medium text-slate-500"><Star size={12} className="fill-amber-400 text-amber-400" /> CSAT</p>
            <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight">{stats.cur.csat ? stats.cur.csat.toFixed(1) : '—'}<span className="text-sm font-bold text-slate-400">/5</span></p>
            <p className="mt-0.5 text-[11px] text-slate-400">Post-resolution surveys</p>
          </Card>
        </Item>
      </Stagger>

      <Item className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="min-w-0 overflow-hidden xl:col-span-2">
          <SectionTitle kicker="Trends" title="Ticket volume" subtitle={`Opened vs resolved · last ${days} days`} />
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="tickets" name="Opened" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.16} strokeWidth={2.25} dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-semibold dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-brand-600" /> Opened</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved</span>
          </div>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <SectionTitle kicker="Queue" title="By status" subtitle="Where every ticket sits" />
          <div className="h-44 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3} strokeWidth={0} cornerRadius={4}>
                  {statusData.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs font-medium capitalize"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.name] }} /> <span className="text-slate-600 dark:text-slate-300">{d.name}</span> <span className="ml-auto font-bold tabular-nums">{d.value}</span></div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">By priority</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prioData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={58} tick={{ fontSize: 11, textTransform: 'capitalize' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={13} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </Item>

      <Item className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="min-w-0 overflow-hidden !p-3 xl:col-span-2 sm:!p-4">
          <div className="px-1 pt-1"><SectionTitle kicker="Activity" title="Recent conversations" subtitle="Jump back in where you left off" action={<Link to="/app/inbox" className="group flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">Open inbox <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></Link>} /></div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recent.map((t) => {
              const c = customerById(state, t.customerId)
              return (
                <Link key={t.id} to={`/app/tickets/${t.id}`} className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-slate-50 sm:gap-3 dark:hover:bg-slate-800/50">
                  <span className="shrink-0"><Avatar name={c?.name} id={c?.id} size="sm" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-tight">{t.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{c?.name} · {c?.company} · {timeAgo(t.updatedAt)}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={t.status} />
                    <span className="hidden sm:inline-flex"><PriorityBadge priority={t.priority} /></span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-slate-600" />
                </Link>
              )
            })}
          </div>
        </Card>
        <div className="min-w-0 space-y-4">
          <Card className="min-w-0 overflow-hidden">
            <SectionTitle kicker="Deadlines" title="Upcoming SLAs" subtitle="Most urgent first" />
            <div className="space-y-2">
              {sla.map((t) => {
                const overdue = isOverdue(t)
                return (
                  <Link key={t.id} to={`/app/tickets/${t.id}`} className={cn('group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all hover:-translate-y-px hover:shadow-card', overdue ? 'border-rose-200 bg-rose-50/50 dark:border-rose-500/25 dark:bg-rose-500/5' : 'border-slate-200/90 hover:border-slate-300 dark:border-slate-700/70 dark:hover:border-slate-600')}>
                    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', overdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
                      {overdue ? <AlertTriangle size={14} /> : <Clock size={14} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight">{t.subject}</span>
                    <span className={cn('shrink-0 whitespace-nowrap text-[11px] font-bold tabular-nums', overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500')}>{overdue ? 'Overdue' : timeAgo(t.slaDueAt).replace(' ago', ' left')}</span>
                  </Link>
                )
              })}
              {sla.length === 0 && <p className="rounded-xl bg-emerald-50 p-3 text-[13px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Queue is clear. Nothing breaches in the next 24 hours.</p>}
            </div>
          </Card>
          <Card className="min-w-0 overflow-hidden">
            <SectionTitle kicker="Team" title="Top agents" subtitle="Resolved all-time" action={<Link to="/app/team" className="text-xs font-bold text-brand-600 hover:underline">Team</Link>} />
            <div className="space-y-3">
              {agentRows.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <Avatar name={a.name} id={a.id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{a.name}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${Math.round((a.resolved / maxAssigned) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right"><p className="text-sm font-extrabold tabular-nums">{a.resolved}</p><p className="text-[10px] font-medium text-slate-400">resolved</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Item>
    </Stagger>
  )
}
