import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { cn } from '../../lib/utils.js'

const icons = { success: CheckCircle2, info: Info, warning: AlertTriangle }

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.variant] || Info
        return (
          <div key={t.id} className="pointer-events-auto flex animate-slide-up items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-pop dark:border-slate-700 dark:bg-slate-900">
            <span className={cn('mt-0.5', t.variant === 'success' ? 'text-emerald-500' : t.variant === 'warning' ? 'text-amber-500' : 'text-brand-500')}>
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
