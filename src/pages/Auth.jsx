import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { Button, Field } from '../components/ui/primitives.jsx'

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold">R</span>
          <span className="text-lg font-bold">Relay</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-extrabold leading-tight">The inbox your support team will actually enjoy.</h2>
          <p className="mt-3 max-w-md text-sm text-slate-400">SLAs, customer context and analytics in one fast workspace. This demo runs entirely on local mock data.</p>
          <div className="mt-6 flex gap-8 text-sm">
            {[['40m', 'median first response'], ['4.8/5', 'demo CSAT'], ['-62%', 'breaches after Relay']].map(([v, k]) => (
              <div key={k}><p className="text-xl font-bold">{v}</p><p className="text-slate-400">{k}</p></div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">Portfolio implementation — mock auth, no real credentials leave your browser.</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><ArrowLeft size={15} /> Back home</Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  )
}

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function Login() {
  const navigate = useNavigate()
  const signIn = useStore((s) => s.signIn)
  const [show, setShow] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const [serverError, setServerError] = useState(null)

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      await signIn(data.email, data.password)
      navigate('/app')
    } catch (e) {
      setServerError(e.message)
    }
  }
  const demoLogin = async () => {
    setDemoLoading(true)
    setValue('email', 'demo@relay.app')
    setValue('password', 'password123')
    try {
      await signIn('demo@relay.app', 'password123')
      navigate('/app')
    } catch (e) {
      setServerError(e.message)
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <Shell title="Welcome back" subtitle="Sign in to your Relay workspace." footer={<p className="mt-6 text-center text-sm text-slate-500">No account? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create one</Link></p>}>
      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm dark:border-brand-500/30 dark:bg-brand-500/10">
        <p className="font-semibold text-brand-800 dark:text-brand-200">Try the live demo</p>
        <p className="text-brand-700 dark:text-brand-300">Email <code className="font-mono">demo@relay.app</code> · Password <code className="font-mono">password123</code></p>
        <Button size="sm" variant="subtle" className="mt-2" onClick={demoLogin} disabled={demoLoading}>{demoLoading ? 'Signing in…' : 'One-click demo login'}</Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Work email" error={errors.email?.message}>
          <input className="input" type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <input className="input pr-10" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" {...register('password')} />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" role="alert">{serverError}</p>}
        <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">Forgot password?</Link></div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </Shell>
  )
}

const signupSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters').regex(/[0-9]/, 'Include at least one number'),
})

export function Signup() {
  const navigate = useNavigate()
  const signUp = useStore((s) => s.signUp)
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signupSchema) })
  const [serverError, setServerError] = useState(null)

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      await signUp(data.name, data.email, data.password)
      navigate('/app')
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <Shell title="Create your workspace" subtitle="Free 14-day trial. Demo auth — stored only in your browser." footer={<p className="mt-6 text-center text-sm text-slate-500">Have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></p>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name?.message}>
          <input className="input" placeholder="Ada Lovelace" autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Work email" error={errors.email?.message}>
          <input className="input" type="email" placeholder="you@company.com" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters with a number.">
          <div className="relative">
            <input className="input pr-10" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" {...register('password')} />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" role="alert">{serverError}</p>}
        <Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</Button>
      </form>
    </Shell>
  )
}

const resetSchema = z.object({ email: z.string().email('Enter a valid email address') })

export function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm({ resolver: zodResolver(resetSchema) })
  return (
    <Shell title="Reset password" subtitle="We'll email you a reset link if the account exists." footer={<p className="mt-6 text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link></p>}>
      {isSubmitSuccessful ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Check your inbox — if an account matches, a reset link is on its way. (Demo: no email is actually sent.)
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => {})} className="space-y-4">
          <Field label="Work email" error={errors.email?.message}>
            <input className="input" type="email" placeholder="you@company.com" {...register('email')} />
          </Field>
          <Button className="w-full" size="lg">Send reset link</Button>
        </form>
      )}
    </Shell>
  )
}
