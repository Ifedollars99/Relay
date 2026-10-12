import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Inbox, BarChart3, Zap, ShieldCheck, Star, Check, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button, Badge } from '../components/ui/primitives.jsx'

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">R</span>
          <span className="text-lg font-bold tracking-tight">Relay</span>
        </Link>
        <div className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white">How it works</a>
          <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white">Customers</a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">Pricing</a>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/signup"><Button>Start free <ArrowRight size={16} /></Button></Link>
        </div>
        <button className="ml-auto md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-slate-200 p-4 dark:border-slate-800 md:hidden">
          {['features', 'workflow', 'testimonials', 'pricing'].map((a) => <a key={a} href={`#${a}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium capitalize hover:bg-slate-100 dark:hover:bg-slate-800">{a}</a>)}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="flex-1"><Button variant="secondary" className="w-full">Sign in</Button></Link>
            <Link to="/signup" className="flex-1"><Button className="w-full">Start free</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function DashboardPreview() {
  const rows = [
    ['RL-1089', 'Invoice shows double charge', 'High', 'Pending', 'bg-amber-100 text-amber-700'],
    ['RL-1086', 'SSO login loops back', 'Urgent', 'Open', 'bg-sky-100 text-sky-700'],
    ['RL-1082', 'Webhook delays ~20 min', 'High', 'Open', 'bg-sky-100 text-sky-700'],
    ['RL-1079', 'Saved views in inbox', 'Medium', 'Resolved', 'bg-emerald-100 text-emerald-700'],
  ]
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800">app.relay.io/inbox</span>
      </div>
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="hidden border-r border-slate-200 p-3 dark:border-slate-800 md:block">
          {['Dashboard', 'Inbox', 'Tickets', 'Customers', 'Analytics'].map((n, i) => (
            <div key={n} className={`mb-1 rounded-lg px-3 py-2 text-xs font-medium ${i === 1 ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10' : 'text-slate-500'}`}>{n}</div>
          ))}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {[['Open tickets', '128'], ['Avg. first response', '31m'], ['CSAT', '4.8']].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-[11px] text-slate-500">{k}</p>
                <p className="text-lg font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            {rows.map(([id, s, p, st, cls]) => (
              <div key={id} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-xs last:border-0 dark:border-slate-800">
                <span className="font-mono text-slate-400">{id}</span>
                <span className="flex-1 truncate font-medium">{s}</span>
                <span className="hidden sm:inline text-slate-500">{p}</span>
                <span className={`rounded-full px-2 py-0.5 font-semibold ${cls}`}>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Nav />
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Badge className="mb-4 border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">New · AI-assisted triage in beta</Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Customer support, <span className="text-brand-600 dark:text-brand-400">minus the chaos.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Relay brings every conversation, ticket, customer and SLA into one fast inbox — so small teams can reply in minutes, not days.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <Link to="/signup"><Button size="lg" className="w-full sm:w-auto">Start free trial <ArrowRight size={16} /></Button></Link>
              <Link to="/login"><Button size="lg" variant="secondary" className="w-full sm:w-auto">View live demo</Button></Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">Free 14-day trial · No credit card · Cancel anytime</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mx-auto mt-12 max-w-4xl">
          <DashboardPreview />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Everything a support team needs</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600 dark:text-slate-400">One workspace for conversations, ownership, SLAs and performance — designed for speed.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Inbox, 'Shared inbox', 'Every channel in one queue with collision detection, saved views and keyboard-first triage.'],
              [Zap, 'SLAs that enforce themselves', 'Per-priority deadlines, breach warnings and escalation rules before customers chase you.'],
              [BarChart3, 'Analytics that matter', 'Volume, first response, resolution time and CSAT — sliced by agent, category and priority.'],
              [ShieldCheck, 'Customer context', 'Full history, plan, tags and notes beside every reply. No more tab-hopping.'],
              [Star, 'CSAT built in', 'Satisfaction captured on resolve and trended over time, not buried in a spreadsheet.'],
              [Check, 'Bulk ops', 'Select, assign, reprioritize and close in seconds when Monday morning hits.'],
            ].map(([Icon, t, d]) => (
              <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Icon size={20} /></span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">From ping to resolved in three steps</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[['01 · Triage', 'Auto-prioritized queue with SLA countdowns. Urgent billing issues surface before they breach.'], ['02 · Reply with context', 'Customer plan, history and internal notes sit next to the composer. Assign in one click.'], ['03 · Learn & improve', 'Weekly digest shows response trends, busiest categories and agents who need backup.']].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Loved by lean support teams</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['“We cut first-response time from 6 hours to 40 minutes in a month. The SLA view alone paid for it.”', 'Maya Chen', 'Head of Support, HelixPay'],
              ['“Relay is the first helpdesk our engineers don’t hate. The inbox is fast and the context panel is perfect.”', 'Jonas Weber', 'CTO, Koda'],
              ['“CSAT went from 4.1 to 4.7. Bulk triage on Monday mornings saves us hours every week.”', 'Sofia Almeida', 'CX Lead, Brightline'],
            ].map(([q, n, r]) => (
              <figure key={n} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed">{q}</blockquote>
                <figcaption className="mt-4 text-xs text-slate-500"><span className="font-semibold text-slate-800 dark:text-slate-200">{n}</span> · {r}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Simple pricing that scales</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['Starter', '$15', 'For tiny teams getting organized.', ['Up to 3 agents', 'Shared inbox', 'Basic analytics'], false],
            ['Pro', '$29', 'For growing teams with SLAs.', ['Unlimited tickets', 'SLA management', 'CSAT + advanced analytics', 'Bulk actions'], true],
            ['Enterprise', 'Custom', 'For compliance & scale.', ['SSO / SAML', 'Audit log', 'Gold SLA + dedicated CSM'], false],
          ].map(([name, price, desc, feats, hot]) => (
            <div key={name} className={`rounded-2xl border p-6 ${hot ? 'border-brand-500 shadow-pop dark:border-brand-400' : 'border-slate-200 dark:border-slate-700'}`}>
              {hot && <Badge className="mb-2 bg-brand-600 text-white">Most popular</Badge>}
              <h3 className="font-bold">{name}</h3>
              <p className="mt-1 text-3xl font-extrabold">{price}<span className="text-sm font-normal text-slate-500">{price.startsWith('$') ? ' /agent/mo' : ''}</span></p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {feats.map((f) => <li key={f} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> {f}</li>)}
              </ul>
              <Link to="/signup" className="mt-5 block"><Button variant={hot ? 'primary' : 'secondary'} className="w-full">Choose {name}</Button></Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-md bg-brand-600 text-xs font-bold text-white">R</span> © 2026 Relay Labs, Inc. — portfolio demo</span>
          <span className="flex gap-5"><Link to="/login" className="hover:text-slate-800 dark:hover:text-white">Sign in</Link><Link to="/signup" className="hover:text-slate-800 dark:hover:text-white">Sign up</Link><a href="#features" className="hover:text-slate-800 dark:hover:text-white">Features</a></span>
        </div>
      </footer>
    </div>
  )
}
