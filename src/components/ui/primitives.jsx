import { cn } from '../../lib/utils.js'

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs font-medium rounded-lg gap-1.5',
    md: 'h-9 px-4 text-sm font-medium rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2',
    icon: 'h-9 w-9 rounded-lg grid place-items-center',
  }
  return <button className={cn('inline-flex items-center justify-center transition-colors focus-visible:outline-none disabled:cursor-not-allowed', variants[variant], sizes[size], className)} {...props} />
}

export function Badge({ tone = 'slate', className, children, ...props }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
    indigo: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-600/10 dark:ring-white/10', tones[tone], className)} {...props}>
      {children}
    </span>
  )
}

export const statusTone = (s) => ({ open: 'sky', pending: 'amber', resolved: 'green', closed: 'slate' }[s] || 'slate')
export const priorityTone = (p) => ({ urgent: 'rose', high: 'amber', medium: 'indigo', low: 'slate' }[p] || 'slate')

export function StatusBadge({ status }) {
  return <Badge tone={statusTone(status)} className="capitalize">{status}</Badge>
}
export function PriorityBadge({ priority }) {
  return <Badge tone={priorityTone(priority)} className="capitalize">{priority}</Badge>
}

export function Field({ label, error, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Card({ className, children, ...props }) {
  return <div className={cn('card p-5', className)} {...props}>{children}</div>
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
