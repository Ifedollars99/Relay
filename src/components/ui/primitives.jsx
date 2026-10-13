import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white shadow-[0_1px_2px_rgb(79_70_229/0.24),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-brand-700 hover:shadow-[0_4px_12px_-2px_rgb(79_70_229/0.4)] active:bg-brand-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:bg-brand-500 dark:hover:bg-brand-400 dark:active:bg-brand-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500',
    secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:active:bg-slate-800/80',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:active:bg-slate-700/60',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50',
    subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 active:bg-brand-200/60 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 dark:active:bg-brand-500/25',
  }
  const sizes = {
    sm: 'h-8 px-3 text-[13px] font-semibold rounded-lg gap-1.5',
    md: 'h-9 px-4 text-sm font-semibold rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2',
    icon: 'h-9 w-9 rounded-lg grid place-items-center',
  }
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-150 ease-out',
        'hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function Badge({ tone = 'slate', className, children, ...props }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
    indigo: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-4 ring-1 ring-inset dark:ring-white/10', tones[tone], className)} {...props}>
      {children}
    </span>
  )
}

export const statusTone = (s) => ({ open: 'sky', pending: 'amber', resolved: 'green', closed: 'slate' }[s] || 'slate')
export const priorityTone = (p) => ({ urgent: 'rose', high: 'amber', medium: 'indigo', low: 'slate' }[p] || 'slate')

export function StatusBadge({ status }) {
  const dot = { open: 'bg-sky-500', pending: 'bg-amber-500', resolved: 'bg-emerald-500', closed: 'bg-slate-400' }[status] || 'bg-slate-400'
  return (
    <Badge tone={statusTone(status)} className="gap-1.5 capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {status}
    </Badge>
  )
}
export function PriorityBadge({ priority }) {
  return <Badge tone={priorityTone(priority)} className="capitalize">{priority}</Badge>
}

export function Field({ label, error, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  )
}

export function Card({ className, interactive, children, ...props }) {
  return (
    <div
      className={cn(
        'card p-5',
        interactive && 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-pop hover:border-slate-300 dark:hover:border-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action, kicker }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-600 dark:text-brand-400">{kicker}</p>}
        <h2 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  )
}
