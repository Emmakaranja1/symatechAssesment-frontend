import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/lib/types'
import { useCart } from '@/context/CartContext'

export function CartItemRow({ product, quantity }: CartItem) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="flex gap-4 py-4">
      <img
        src={product.image}
        alt={product.title}
        className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=80&h=80&fit=crop'
        }}
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm leading-tight">{product.title}</h3>
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <p className="text-sm font-medium text-primary mt-1">KES {product.price.toLocaleString()}</p>
          </div>
          <p className="font-bold text-sm whitespace-nowrap">
            KES {(product.price * quantity).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(product.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
