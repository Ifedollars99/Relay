import { useMemo, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { useDebouncedValue } from '../hooks/hooks.js'
import { cn } from '../lib/utils.js'
import { Button, Card, Badge, SectionTitle } from '../components/ui/primitives.jsx'
import { Avatar, EmptyState } from '../components/ui/display.jsx'
import { Modal } from '../components/ui/Modal.jsx'

export default function Team() {
  const agents = useStore((s) => s.agents)
  const tickets = useStore((s) => s.tickets)
  const pushToast = useStore((s) => s.pushToast)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [active, setActive] = useState(null)
  const debounced = useDebouncedValue(search, 250)

  const rows = useMemo(() => agents
    .filter((a) => (role === 'all' || a.role === role) && (status === 'all' || a.status === status))
    .filter((a) => !debounced.trim() || `${a.name} ${a.email}`.toLowerCase().includes(debounced.toLowerCase()))
    .map((a) => ({ ...a, active: tickets.filter((t) => t.assigneeId === a.id && (t.status === 'open' || t.status === 'pending')).length })),
  [agents, tickets, role, status, debounced])

  const detail = active ? rows.find((r) => r.id === active) || agents.find((a) => a.id === active) : null

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 !p-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents…" aria-label="Search agents" className="input pl-9" />
        </div>
        <div className="flex gap-1.5">
          <select aria-label="Role filter" className="input !w-auto text-sm" value={role} onChange={(e) => setRole(e.target.value)}>{['all', 'Admin', 'Lead', 'Agent', 'Viewer'].map((r) => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}</select>
          <select aria-label="Status filter" className="input !w-auto text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>{['all', 'online', 'away', 'offline'].map((s) => <option key={s} value={s}>{s === 'all' ? 'Any status' : s}</option>)}</select>
          <Button size="sm" variant="secondary" onClick={() => pushToast({ title: 'Invite is disabled in demo', description: 'Admin invites would send an email via the backend. Wire up Supabase to enable.', variant: 'warning' })}><UserPlus size={15} /> Invite</Button>
        </div>
      </div>

      {rows.length === 0 && <Card><EmptyState title="No agents match" description="Clear the search or filters." /></Card>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((a) => (
          <button key={a.id} onClick={() => setActive(a.id)} className="card p-4 text-left transition-shadow hover:shadow-pop">
            <div className="flex items-center gap-3">
              <span className="relative"><Avatar name={a.name} id={a.id} size="lg" /><span title={a.status} className={cn('absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900', a.status === 'online' ? 'bg-emerald-500' : a.status === 'away' ? 'bg-amber-400' : 'bg-slate-400')} /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-bold">{a.name}</p><p className="truncate text-xs text-slate-500">{a.email}</p></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Badge tone={a.role === 'Admin' ? 'indigo' : 'slate'}>{a.role}</Badge>
              <Badge tone={a.status === 'online' ? 'green' : a.status === 'away' ? 'amber' : 'slate'} className="capitalize">{a.status}</Badge>
              <span className="ml-auto font-semibold text-slate-600 dark:text-slate-300">{a.active} active</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {[['Resolved', a.resolved], ['Avg resp', `${a.avgResponseMin}m`], ['CSAT', `★ ${a.csat}`]].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"><p className="font-bold">{v}</p><p className="text-slate-500">{k}</p></div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <Card>
        <SectionTitle title="Team settings (demo)" subtitle="Simulated admin controls" />
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">Role changes, deactivations and invites are <strong>simulated</strong> in this portfolio build — they persist to your browser only. A production backend would enforce these server-side with an audit log. Connect Supabase or your API in <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">src/services/api.js</code> to make them real.</p>
      </Card>

      <Modal open={!!detail} onClose={() => setActive(null)} title={detail?.name} description={detail ? `${detail.role} · ${detail.team} · ${detail.email}` : ''}>
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Avatar name={detail.name} id={detail.id} size="lg" />
              <div><p className="font-semibold capitalize">{detail.status}</p><p className="text-slate-500">{detail.active ?? 0} active tickets · {detail.resolved} resolved all-time</p></div>
            </div>
            <div>
              <label className="label" htmlFor="role-change">Role (demo only)</label>
              <select id="role-change" className="input" value={detail.role} onChange={async (e) => { await useStore.getState().updateAgent(detail.id, { role: e.target.value }); pushToast({ title: `Role set to ${e.target.value} (demo)`, variant: 'success' }) }}>
                {['Admin', 'Lead', 'Agent', 'Viewer'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex justify-end"><Button variant="secondary" onClick={() => setActive(null)}>Close</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
