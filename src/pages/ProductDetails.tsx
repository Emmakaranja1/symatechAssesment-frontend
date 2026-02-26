import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/context/CartContext'
import { ProductCard } from '@/components/products/ProductCard'
import { ShoppingCart, Star, ChevronLeft, Minus, Plus } from 'lucide-react'
import { getProduct, getProducts } from '@/api/products'
import { Product } from '@/lib/types'
import { products as mockProducts } from '@/lib/mock-data'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const pid = Number(id)
    setLoading(true)

    getProduct(pid)
      .then((res) => {
        const data = res.data?.data || res.data
        setProduct(data)
        // Fetch related
        return getProducts()
      })
      .then((res) => {
        const all = res.data?.data || res.data || []
        setRelated(Array.isArray(all) ? all.filter((p: Product) => p.id !== pid).slice(0, 4) : [])
      })
      .catch(() => {
        // Use mock data fallback
        const mock = mockProducts.find((p) => p.id === pid) || null
        setProduct(mock)
        setRelated(mockProducts.filter((p) => p.id !== pid && p.category === mock?.category).slice(0, 4))
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg mb-4">Product not found</p>
          <Link to="/"><Button>Back to Shop</Button></Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img
              src={product.image}
              alt={product.title || product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop'
              }}
            />
            {product.stock < 10 && product.stock > 0 && (
              <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground">
                Only {product.stock} left
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-3">{product.category}</Badge>
            <h1 className="font-display text-3xl font-bold mb-3">{product.title || product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-warning text-warning' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating || 0})</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

            <p className="font-display text-3xl font-bold text-primary mb-2">
              KES {product.price.toLocaleString()}
            </p>

            <p className={`text-sm font-medium mb-6 ${product.stock > 0 ? 'text-success' : 'text-destructive'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center gap-3 rounded-lg border border-border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 gap-2"
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  )
}
