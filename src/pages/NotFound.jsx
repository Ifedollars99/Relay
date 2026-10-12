import { Link } from 'react-router-dom'
import { Button } from '../components/ui/primitives.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <p className="text-sm font-bold text-brand-600">404</p>
        <h1 className="mt-1 text-2xl font-bold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">The link may be broken or the ticket was closed.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link to="/app"><Button>Go to dashboard</Button></Link>
          <Link to="/"><Button variant="secondary">Home</Button></Link>
        </div>
      </div>
    </div>
  )
}
