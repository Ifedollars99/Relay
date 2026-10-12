import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useStore } from '../store/useStore.js'
import { volumeSeries } from '../data/seed.js'
import { downloadCSV } from '../lib/csv.js'
import { cn } from '../lib/utils.js'
import { Button, Card, SectionTitle } from '../components/ui/primitives.jsx'

const RANGES = [{ k: '7d', days: 7 }, { k: '30d', days: 30 }, { k: '90d', days: 90 }]

export default function Analytics() {
  const tickets = useStore((s) => s.tickets)
  const agents = useStore((s) => s.agents)
  const pushToast = useStore((s) => s.pushToast)
  const [range, setRange] = useState('30d')
  const days = RANGES.find((r) => r.k === range).days
  const since = useMemo(() => new Date(Date.now() - days * 86400000), [days])

  const inRange = useMemo(() => tickets.filter((t) => new Date(t.createdAt) >= since), [tickets, since])
  const series = useMemo(() => volumeSeries(90).slice(-days), [days])

  const byCategory = useMemo(() => {
    const m = {}
    inRange.forEach((t) => { m[t.category] = (m[t.category] || 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [inRange])
  const byPriority = useMemo(() => {
    const m = { urgent: 0, high: 0, medium: 0, low: 0 }
    inRange.forEach((t) => { if (m[t.priority] != null) m[t.priority] += 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [inRange])
  const agentPerf = useMemo(() => agents.map((a) => {
    const mine = inRange.filter((t) => t.assigneeId === a.id)
    const fr = mine.filter((t) => t.firstResponseMin != null)
    return { name: a.name.split(' ')[0], tickets: mine.length, resolved: mine.filter((t) => t.status === 'resolved' || t.status === 'closed').length, avgFr: fr.length ? Math.round(fr.reduce((s, t) => s + t.firstResponseMin, 0) / fr.length) : 0 }
  }), [agents, inRange])
  const resolution = useMemo(() => {
    const done = inRange.filter((t) => t.resolvedAt).map((t) => ({ date: t.resolvedAt.slice(0, 10), hours: (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000 }))
    const m = {}
    done.forEach((d) => { (m[d.date] = m[d.date] || []).push(d.hours) })
    return Object.entries(m).sort().slice(-14).map(([date, arr]) => ({ date: date.slice(5), avgHours: Number((arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(1)) }))
  }, [inRange])

  const exportCSV = () => {
    const rows = inRange.map((t) => ({ id: t.id, subject: t.subject, status: t.status, priority: t.priority, category: t.category, assignee: agents.find((a) => a.id === t.assigneeId)?.name || 'Unassigned', created: t.createdAt, first_response_min: t.firstResponseMin ?? '', satisfaction: t.satisfaction ?? '' }))
    downloadCSV(`relay-tickets-${range}.csv`, rows.length ? rows : [{ note: 'no rows in range' }])
    pushToast({ title: 'CSV exported', description: `${rows.length} ticket(s) from the last ${days} days.`, variant: 'success' })
  }

  const chartH = 'h-60'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {RANGES.map((r) => <button key={r.k} onClick={() => setRange(r.k)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', range === r.k ? 'bg-brand-600 text-white' : 'text-slate-500')}>{r.k}</button>)}
        </div>
        <span className="text-xs text-slate-500">{inRange.length} tickets in range</span>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={exportCSV}><Download size={15} /> Export CSV</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Ticket volume" subtitle="New tickets per day" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}><XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="tickets" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <SectionTitle title="First response trend" subtitle="Average minutes to first reply" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><BarChart data={series} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}><XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="avgFirstResponseMin" name="Avg min" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <SectionTitle title="Resolution time" subtitle="Avg hours from open to resolved" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><LineChart data={resolution.length ? resolution : [{ date: '—', avgHours: 0 }]} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}><XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="avgHours" name="Avg hours" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <SectionTitle title="CSAT trend" subtitle="Satisfaction score over time" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}><XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis domain={[3.5, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="csat" name="CSAT" stroke="#f59e0b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <SectionTitle title="By category" subtitle="Where the work comes from" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><BarChart data={byCategory} layout="vertical" margin={{ left: 10, right: 20 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <SectionTitle title="By priority" subtitle="Urgency mix in range" />
          <div className={chartH}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byPriority} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>{byPriority.map((d, i) => <Cell key={d.name} fill={['#f43f5e', '#f59e0b', '#6366f1', '#94a3b8'][i % 4]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </Card>
      </div>

      <Card>
        <SectionTitle title="Agent performance" subtitle="Assigned vs resolved in range, plus avg first response" />
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={agentPerf} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip /><Legend /><Bar dataKey="tickets" name="Assigned" fill="#6366f1" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  )
}
