import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package } from 'lucide-react'

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
}


interface GenericOrder {
  id: string | number
  user?: unknown
  status: string
  date?: string
  created_at?: string
  items?: unknown[]
  products?: unknown[]
  total?: number
  payment_status?: string
  shipping_address?: unknown
}

interface OrderDetailModalProps {
  order: GenericOrder | null
  onOpenChange: (open: boolean) => void
}

export function OrderDetailModal({ order, onOpenChange }: OrderDetailModalProps) {
  if (!order) return null

  const getCustomerName = () => {
    if (!order.user) return 'Unknown'
    if (typeof order.user === 'string') return order.user
    if (typeof order.user === 'object' && order.user !== null) {
      const u = order.user as Record<string, string>
      return u.name || u.email || 'Unknown'
    }
    return 'Unknown'
  }

  const getCustomerEmail = () => {
    if (typeof order.user === 'object' && order.user !== null) {
      const u = order.user as Record<string, string>
      return u.email || ''
    }
    return ''
  }

  const getDate = () => {
    const d = order.created_at || order.date
    if (!d) return '—'
    return new Date(d).toLocaleString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // Normalize items from both shapes
  const rawItems = order.items || order.products || []
  const items = (rawItems as Record<string, unknown>[]).map(item => {
    // Mock shape: { product: { title, price, image }, quantity }
    // Backend shape: { product: {...}, quantity, price } or flat product object
    const product = (item.product as Record<string, unknown>) || item
    return {
      title: String(product.title || product.name || item.title || item.name || 'Product'),
      image: String(product.image || (product as Record<string, unknown[]>).images?.[0] || ''),
      price: Number(product.price || item.price || 0),
      quantity: Number(item.quantity || 1),
    }
  })

  const total = order.total || items.reduce((s, i) => s + i.price * i.quantity, 0)

  const shippingAddr = order.shipping_address as Record<string, string> | null

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Order #{String(order.id).padStart(4, '0')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge variant="outline" className={statusColor[order.status] || ''}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            {order.payment_status && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Payment</p>
                <Badge variant="outline" className={statusColor[order.payment_status] || 'border-border'}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Customer</p>
              <p className="font-medium text-sm">{getCustomerName()}</p>
              {getCustomerEmail() && (
                <p className="text-xs text-muted-foreground">{getCustomerEmail()}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="font-medium text-sm">{getDate()}</p>
            </div>
          </div>

          {/* Shipping address */}
          {shippingAddr && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Shipping Address</p>
                <p className="text-sm">{shippingAddr.address || shippingAddr.street}, {shippingAddr.city}, {shippingAddr.country}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Items */}
          <div>
            <p className="text-sm font-semibold mb-3">
              Order Items ({items.length})
            </p>
            {items.length > 0 ? (
              <div className="space-y-2.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium leading-tight truncate max-w-[160px]">{item.title}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold shrink-0 ml-2">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No item details available</p>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-primary text-lg">KES {Number(total).toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
