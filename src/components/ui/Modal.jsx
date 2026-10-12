import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button } from './primitives.jsx'

export function Modal({ open, onClose, title, description, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close dialog" className="absolute inset-0 bg-slate-950/50" onClick={onClose} />
      <div className={cn('relative w-full animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-pop dark:border-slate-800 dark:bg-slate-900', wide ? 'max-w-2xl' : 'max-w-lg')}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X size={18} /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm?.(); onClose?.() }}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
