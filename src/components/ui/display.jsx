import { avatarColor, cn, initials } from '../../lib/utils.js'

export function Avatar({ name, id, size = 'md', className }) {
  const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' }
  return (
    <span title={name} className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', avatarColor(id || name), sizes[size], className)}>
      {initials(name)}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon size={20} />
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-80" />
    </div>
  )
}
