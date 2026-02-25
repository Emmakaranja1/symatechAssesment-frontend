import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { updateProduct } from '@/api/products'

interface AdminProduct {
  id: number
  name: string
  title?: string
  sku?: string
  category?: string
  price: number | string
  costPrice?: string
  stock: number
  description?: string
  active?: boolean
  status?: string
  images?: string[]
  image?: string
  rating?: number
}

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct | null
  onSuccess?: () => void
}

export function EditProductModal({ open, onOpenChange, product, onSuccess }: EditProductModalProps) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: '',
  })
  const [loading, setLoading] = useState(false)

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || product.title || '',
        category: product.category || '',
        price: String(product.price || ''),
        stock: String(product.stock || ''),
        description: product.description || '',
        image: product.images?.[0] || product.image || '',
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    try {
      await updateProduct(product.id, {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        image: form.image,
      })
      toast({ title: 'Product updated', description: `${form.name} has been updated successfully.` })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast({ title: 'Failed to update product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price (KES)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
