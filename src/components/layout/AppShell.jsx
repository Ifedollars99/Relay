import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Sidebar } from './Sidebar.jsx'
import { Topbar } from './Topbar.jsx'
import { Page } from '../ui/motion.jsx'

export function AppShell({ title, subtitle, actions }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-[#f4f5f7] dark:bg-slate-950">
      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} title={title} subtitle={subtitle} actions={actions} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <Page key={location.pathname} className="min-w-0">
              <Outlet />
            </Page>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
