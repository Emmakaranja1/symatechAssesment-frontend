import { ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { useCart } from '@/context/CartContext'
import { Link } from 'react-router-dom'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title || product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop'
          }}
        />
        {product.stock < 10 && (
          <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground text-xs">
            Low Stock
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {product.rating}
          </div>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.title || product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">KES {product.price.toLocaleString()}</span>
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="h-8 gap-1 text-xs"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
