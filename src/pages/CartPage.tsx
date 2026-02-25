import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse products and add them to your cart.</p>
            <Link to="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-border bg-card divide-y divide-border px-6">
                {items.map((item) => (
                  <CartItemRow key={item.product.id} {...item} />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="mt-3 text-destructive hover:text-destructive gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">KES {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-success">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">KES {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" className="block mt-6">
                  <Button className="w-full gap-2">
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full mt-2 text-sm">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
