import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { Button, Card, Field, SectionTitle } from '../components/ui/primitives.jsx'
import { ConfirmDialog } from '../components/ui/Modal.jsx'
import { Avatar } from '../components/ui/display.jsx'
import { cn } from '../lib/utils.js'

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

  const Toggle = ({ k, label, desc }) => (
    <button role="switch" aria-checked={!!settings[k]} onClick={() => { updateSettings({ [k]: !settings[k] }); pushToast({ title: 'Preference saved', variant: 'success' }) }}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 text-left dark:border-slate-700">
      <span><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-slate-500">{desc}</span></span>
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', settings[k] ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', settings[k] ? 'left-[22px]' : 'left-0.5')} />
      </span>
    </button>
  )

  return (
    <div className="grid max-w-4xl gap-4">
      <Card>
        <SectionTitle title="Profile" subtitle="Shown across the workspace." />
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={name || user?.name} id={user?.id} size="lg" className="!h-14 !w-14 !text-base" />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Field label="Full name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><input className="input" value={user?.email || ''} disabled title="Email is fixed in the demo" /></Field>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={saveProfile}>Save profile</Button>
          <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Appearance" subtitle="Persisted across reloads." />
        <div className="grid gap-2 sm:grid-cols-3">
          {['light', 'dark', 'system'].map((t) => (
            <button key={t} onClick={() => { setTheme(t); pushToast({ title: `Theme: ${t}`, variant: 'success' }) }} aria-pressed={theme === t}
              className={cn('rounded-xl border p-3.5 text-left capitalize', theme === t ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 dark:border-slate-700')}>
              <span className="block text-sm font-bold">{t}</span>
              <span className="text-xs text-slate-500">{t === 'system' ? 'Follow OS setting' : `Always ${t}`}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Notifications" subtitle="Demo preferences — stored locally." />
        <div className="space-y-2">
          <Toggle k="emailNotif" label="Email notifications" desc="New assignments and SLA warnings." />
          <Toggle k="slackNotif" label="Slack alerts" desc="Post urgent tickets to #support." />
          <Toggle k="weeklyDigest" label="Weekly digest" desc="Volume, response and CSAT summary on Mondays." />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Workspace" subtitle="Demo workspace settings." />
        <Field label="Workspace name">
          <input className="input max-w-sm" value={settings.workspace} onChange={(e) => updateSettings({ workspace: e.target.value })} />
        </Field>
      </Card>

      <Card className="!border-rose-200 dark:!border-rose-500/30">
        <SectionTitle title="Demo data" subtitle="Restore the original tickets, customers and messages." />
        <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>Restore default demo data</Button>
      </Card>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Restore demo data?" description="Your local changes to tickets, notes and replies will be replaced with the defaults." confirmLabel="Restore" danger onConfirm={resetDemo} />
    </div>
  )
}
