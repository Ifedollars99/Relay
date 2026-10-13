import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../store/useStore.js'
import { cn } from '../../lib/utils.js'

const icons = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: AlertTriangle }

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.variant] || Info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-pop dark:border-slate-700/80 dark:bg-slate-900"
            >
              <span className={cn(
                'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full',
                t.variant === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : t.variant === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
              )}>
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
