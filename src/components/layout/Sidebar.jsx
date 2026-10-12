import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Inbox, Ticket, Users, BarChart3, UsersRound, Settings, ChevronsLeft, ChevronsRight, Zap, LogOut } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { cn } from '../../lib/utils.js'
import { Avatar } from '../ui/display.jsx'

const links = [
  { to: '/app', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/inbox', label: 'Inbox', icon: Inbox, badgeKey: 'awaiting' },
  { to: '/app/tickets', label: 'Tickets', icon: Ticket },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/team', label: 'Team', icon: UsersRound },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ mobileOpen, onNavigate }) {
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const toggle = useStore((s) => s.toggleSidebar)
  const tickets = useStore((s) => s.tickets)
  const user = useStore((s) => s.user)
  const signOut = useStore((s) => s.signOut)
  const navigate = useNavigate()

  const awaiting = tickets.filter((t) => t.status === 'open' || t.status === 'pending').length

  return (
    <>
      {/* desktop */}
      <aside className={cn('sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 lg:flex', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className="flex h-16 items-center gap-2 px-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">R</span>
          {!collapsed && <span className="text-[15px] font-bold tracking-tight">Relay</span>}
          <button onClick={toggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
          {links.map(({ to, end, label, icon: Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', collapsed && 'justify-center px-2')}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badgeKey && awaiting > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{awaiting}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          {!collapsed && (
            <div className="mb-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white"><Zap size={13} className="text-brand-500" /> Demo workspace</p>
              <p className="mt-1 leading-relaxed">Mock data stored locally. Reset anytime in Settings.</p>
            </div>
          )}
          <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
            <Avatar name={user?.name || 'Demo'} id={user?.id} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            )}
            <button aria-label="Sign out" title="Sign out" onClick={() => { signOut(); navigate('/login') }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={onNavigate} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-slate-900">
            <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">R</span>
              <span className="font-bold">Relay</span>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {links.map(({ to, end, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 dark:text-slate-300')}>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
