import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, Search, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useStore } from '../../store/useStore.js'
import { Button } from '../ui/primitives.jsx'

function useEffectiveDark(theme) {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  )
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemDark(e.matches)
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
    else if (typeof mq.addListener === 'function') mq.addListener(onChange)
    setSystemDark(mq.matches)
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange)
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange)
    }
  }, [theme])
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}

export function Topbar({ onMenu, title, subtitle, actions }) {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const dark = useEffectiveDark(theme || 'system')

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-400">
            <Search size={13} />
            <span className="font-medium">Search tickets</span>
            <kbd className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"><Command size={10} />/</kbd>
          </span>
        </div>
        {actions}
        <Button
          variant="ghost"
          size="icon"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          className="relative overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={dark ? 'sun' : 'moon'}
              initial={{ opacity: 0, rotate: -60, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 60, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="grid place-items-center"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
    </header>
  )
}
