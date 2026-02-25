import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Package, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'

const navLinks = [
  { label: 'Shop', path: '/' },
  { label: 'Categories', path: '/#categories' },
  { label: 'Orders', path: '/orders' },
]

export function Header() {
  const { totalItems } = useCart()
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Package className="h-6 w-6" />
          <span className="hidden sm:block">Symatech Labs</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs ml-auto">
          {searchOpen && (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" autoFocus onBlur={() => setSearchOpen(false)} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" title="Admin Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Admin Dashboard
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setMobileOpen(false) }}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left text-destructive"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
