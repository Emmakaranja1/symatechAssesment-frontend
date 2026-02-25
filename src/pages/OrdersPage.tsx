import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { getOrders } from '@/api/orders'
import { Order } from '@/lib/types'
import { orders as mockOrders } from '@/lib/mock-data'

const statusColor: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  shipped: 'bg-secondary/10 text-secondary border-secondary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders()
      .then((res) => {
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data)
        } else {
          setOrders(mockOrders)
        }
      })
      .catch(() => setOrders(mockOrders))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-muted h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={statusColor[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <p className="font-bold text-primary">KES {order.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">
                      <span>{item.product.title}</span>
                      <span className="font-medium">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
