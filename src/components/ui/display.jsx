import { avatarColor, cn, initials } from '../../lib/utils.js'

export function Avatar({ name, id, size = 'md', className, ring }) {
  const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' }
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white ring-2 ring-white dark:ring-slate-900',
        avatarColor(id || name),
        sizes[size],
        ring && 'ring-brand-500/40',
        className
      )}
    >
      {initials(name)}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description, action, compact }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-6 py-8' : 'px-6 py-14')}>
      {Icon && (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500">
          <Icon size={22} strokeWidth={1.75} />
        </span>
      )}
      <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('shimmer animate-pulse rounded-lg', className)} aria-hidden />
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-52 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
