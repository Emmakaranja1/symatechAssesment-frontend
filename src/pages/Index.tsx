import { useState, useEffect } from 'react'
import ProductCard from '@/components/products/ProductCard'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getProducts } from '@/api/products'
import client from '@/api/client'
import { Product } from '@/lib/types'
import { products as mockProducts, categories } from '@/lib/mock-data'

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try multiple endpoints to find products
    const fetchProducts = async () => {
      try {
        // First try public products endpoint
        const res = await client.get('/products')
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
          return
        }
      } catch (error) {
        // Public products failed, trying admin endpoint
      }

      try {
        // Try admin products (might work with token)
        const res = await client.get('/admin/products')
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
          return
        }
      } catch (error) {
        // Admin products failed, using mock data
      }

      // Ensure we always have products to display
      setProducts(mockProducts)
    }

    fetchProducts()
      .catch((error) => {
        setProducts(mockProducts)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
    const title = p.title || p.name || ''
    const matchSearch = title.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  // Derive categories from actual product data
  const dynamicCategories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))]

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl text-balance mb-4">
            Discover Quality Products
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Shop the latest electronics, fashion, home essentials and more — all in one place.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-10 h-12 text-base shadow-sm"
            />
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap gap-2">
          {dynamicCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full"
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} products</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-muted aspect-[3/4]" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-muted-foreground text-lg">No products found.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory('All') }}>
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default Index
