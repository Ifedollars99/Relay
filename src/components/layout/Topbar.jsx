import { Menu, Moon, Sun, Search } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { Button } from '../ui/primitives.jsx'

export function Topbar({ onMenu, title, subtitle, actions }) {
  const setTheme = useStore((s) => s.setTheme)
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold text-slate-900 dark:text-white sm:text-base">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Search size={13} /> Press <kbd className="rounded border border-slate-300 bg-white px-1 font-semibold dark:border-slate-600 dark:bg-slate-800">/</kbd> to search tickets
          </span>
        </div>
        {actions}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          title="Toggle light / dark"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  )
}
