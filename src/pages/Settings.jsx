import { useState } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useStore } from '../store/useStore.js'
import { Button, Card, Field, SectionTitle } from '../components/ui/primitives.jsx'
import { ConfirmDialog } from '../components/ui/Modal.jsx'
import { Avatar } from '../components/ui/display.jsx'
import { cn } from '../lib/utils.js'

const THEMES = [
  { k: 'light', label: 'Light', desc: 'Bright surfaces', icon: Sun },
  { k: 'dark', label: 'Dark', desc: 'Easy on the eyes', icon: Moon },
  { k: 'system', label: 'System', desc: 'Follows your OS', icon: Monitor },
]

export default function Settings() {
  const user = useStore((s) => s.user)
  const signOut = useStore((s) => s.signOut)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const resetDemo = useStore((s) => s.resetDemo)
  const pushToast = useStore((s) => s.pushToast)
  const [name, setName] = useState(user?.name || '')
  const [confirmReset, setConfirmReset] = useState(false)

  const saveProfile = () => {
    const updated = { ...user, name: name.trim() || user.name }
    try {
      localStorage.setItem('relay.user.v1', JSON.stringify(updated))
    } catch { /* ignore */ }
    useStore.setState({ user: updated })
    pushToast({ title: 'Profile saved', variant: 'success' })
  }

  const Toggle = ({ k, label, desc }) => {
    const on = !!settings[k]
    return (
      <button role="switch" aria-checked={on} onClick={() => { updateSettings({ [k]: !on }); pushToast({ title: on ? `${label} off` : `${label} on`, variant: 'success' }) }}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/90 p-3.5 text-left transition-colors hover:border-slate-300 dark:border-slate-700/70 dark:hover:border-slate-600">
        <span><span className="block text-sm font-bold tracking-tight">{label}</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{desc}</span></span>
        <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', on ? 'bg-brand-600 dark:bg-brand-500' : 'bg-slate-200 dark:bg-slate-700')}>
          <motion.span
            animate={{ x: on ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 32 }}
            className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow"
          />
        </span>
      </button>
    )
  }

  return (
    <div className="grid max-w-4xl gap-4">
      <Card>
        <SectionTitle title="Profile" subtitle="How you appear to teammates and customers." />
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={name || user?.name} id={user?.id} size="lg" className="!h-14 !w-14 !text-base" />
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            <Field label="Full name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></Field>
            <Field label="Email" hint="Demo accounts use a fixed email."><input className="input" value={user?.email || ''} disabled title="Email is fixed in this demo" /></Field>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={saveProfile}>Save changes</Button>
          <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Appearance" subtitle="Applies instantly and syncs across reloads." />
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
          {THEMES.map(({ k, label, desc, icon: Icon }) => {
            const selected = (theme || 'system') === k
            return (
              <button key={k} role="radio" aria-checked={selected} onClick={() => { setTheme(k); pushToast({ title: `${label} theme on`, variant: 'success' }) }}
                className={cn('relative rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-px', selected ? 'border-brand-500 shadow-[0_0_0_3px_rgb(99_102_241/0.15)]' : 'border-slate-200/90 hover:border-slate-300 dark:border-slate-700/70 dark:hover:border-slate-600')}>
                <span className={cn('grid h-8 w-8 place-items-center rounded-lg', selected ? 'bg-brand-600 text-white dark:bg-brand-500' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}><Icon size={16} /></span>
                <span className="mt-2.5 flex items-center gap-1.5 text-sm font-bold tracking-tight">{label} {selected && <Check size={14} className="text-brand-600" />}</span>
                <span className="text-xs text-slate-500">{desc}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Notifications" subtitle="Saved to this browser." />
        <div className="space-y-2">
          <Toggle k="emailNotif" label="Email notifications" desc="Assignments and tickets about to breach SLA." />
          <Toggle k="slackNotif" label="Slack alerts" desc="Urgent tickets posted to #support." />
          <Toggle k="weeklyDigest" label="Monday digest" desc="Volume, response times and CSAT in one email." />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Workspace" subtitle="Used across navigation and exports." />
        <Field label="Workspace name">
          <input className="input max-w-sm" value={settings.workspace} onChange={(e) => updateSettings({ workspace: e.target.value })} />
        </Field>
      </Card>

      <Card className="!border-rose-200 dark:!border-rose-500/30">
        <SectionTitle title="Reset workspace" subtitle="Bring back the original demo tickets and messages." />
        <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>Restore demo data</Button>
      </Card>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Restore demo data?" description="Your edits to tickets, notes and replies will be replaced with the original demo set." confirmLabel="Restore" danger onConfirm={resetDemo} />
    </div>
  )
}
