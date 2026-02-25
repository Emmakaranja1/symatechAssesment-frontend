import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <p className="font-display text-8xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Oops! Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}
