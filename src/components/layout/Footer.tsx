import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
              <Package className="h-5 w-5" />
              EcommerceApp
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your trusted online store for quality products at competitive prices.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/?category=Electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link to="/?category=Clothing" className="hover:text-foreground transition-colors">Clothing</Link></li>
              <li><Link to="/?category=Home+%26+Kitchen" className="hover:text-foreground transition-colors">Home & Kitchen</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-foreground transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Shipping Info</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Returns</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 EcommerceApp. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
