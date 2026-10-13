import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Inbox, Ticket, Users, BarChart3, UsersRound, Settings, ChevronsLeft, ChevronsRight, Zap, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
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
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 lg:flex"
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-brand-600 text-[15px] font-extrabold text-white shadow-sm">R</span>
          {!collapsed && (
            <span className="overflow-hidden whitespace-nowrap text-[15px] font-extrabold tracking-tight">
              Relay
              <span className="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">Demo</span>
            </span>
          )}
          <button onClick={toggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="ml-auto rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
        <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Primary">
          {links.map(({ to, end, label, icon: Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <span className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                  collapsed && 'justify-center px-2'
                )}>
                  {isActive && !collapsed && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 dark:bg-brand-400"
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <Icon size={18} className="shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  {!collapsed && badgeKey && awaiting > 0 && (
                    <span className="min-w-[20px] rounded-full bg-brand-600 px-1.5 py-0.5 text-center text-[11px] font-bold leading-4 text-white dark:bg-brand-500">{awaiting > 99 ? '99+' : awaiting}</span>
                  )}
                  {collapsed && badgeKey && awaiting > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
          {!collapsed && (
            <div className="mb-2.5 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-400">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 dark:text-slate-100"><Zap size={13} className="text-brand-500" /> Demo workspace</p>
              <p className="mt-1">Local mock data. Reset it anytime in Settings.</p>
            </div>
          )}
          <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
            <Avatar name={user?.name || 'Demo'} id={user?.id} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            )}
            <button aria-label="Sign out" title="Sign out" onClick={() => { signOut(); navigate('/login') }} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
              onClick={onNavigate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-pop dark:bg-slate-900"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 items-center gap-2 border-b border-slate-200/80 px-4 dark:border-slate-800">
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand-600 text-[15px] font-extrabold text-white">R</span>
                <span className="text-[15px] font-extrabold tracking-tight">Relay</span>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {links.map(({ to, end, label, icon: Icon }, i) => (
                  <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.03, duration: 0.2 }}>
                    <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}>
                      <Icon size={18} /> {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
