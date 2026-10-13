import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export const EASE = [0.22, 1, 0.36, 1]

export function Page({ children, className }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className, delay = 0 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className, y = 10 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({ value, format }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const target = Number(value) || 0
  useEffect(() => {
    if (reduce) {
      setDisplay(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 600
    const from = 0
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (target - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduce])
  const text = format ? format(display) : Math.round(display).toLocaleString()
  return <span>{text}</span>
}

export { motion, AnimatePresence }
