import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import { Login, Signup, ForgotPassword } from './pages/Auth.jsx'
import NotFound from './pages/NotFound.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inbox from './pages/Inbox.jsx'
import { Tickets, TicketDetail } from './pages/Tickets.jsx'
import { Customers, CustomerDetail } from './pages/Customers.jsx'
import Analytics from './pages/Analytics.jsx'
import Team from './pages/Team.jsx'
import Settings from './pages/Settings.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { Toasts } from './components/feedback/Toasts.jsx'
import { useStore } from './store/useStore.js'

function RequireAuth({ children }) {
  const user = useStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function Shell() {
  const location = useLocation()
  const map = [
    [/^\/app\/?$/, 'Dashboard', 'Team performance at a glance.'],
    [/inbox/, 'Inbox', 'Triage every conversation in one queue.'],
    [/\/tickets\/.+/, 'Ticket detail', 'Full history, ownership and replies.'],
    [/tickets/, 'Tickets', 'Search, sort, assign and resolve at scale.'],
    [/\/customers\/.+/, 'Customer profile', 'History, notes and open work.'],
    [/customers/, 'Customers', 'Everyone you support, in one place.'],
    [/analytics/, 'Analytics', 'Volume, response times and satisfaction.'],
    [/team/, 'Team', 'Agents, roles and workload.'],
    [/settings/, 'Settings', 'Profile, appearance and workspace.'],
  ]
  const found = map.find(([re]) => re.test(location.pathname))
  return <AppShell title={found?.[1] || 'Relay'} subtitle={found?.[2]} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/app" element={<RequireAuth><Shell /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toasts />
    </BrowserRouter>
  )
}
