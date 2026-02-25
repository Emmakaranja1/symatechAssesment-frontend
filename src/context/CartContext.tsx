import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Product, CartItem } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import {
  addToCart as addToCartApi,
  removeFromCart as removeFromCartApi,
  updateCartItem as updateCartItemApi,
  getCart,
  clearCartApi,
} from '@/api/cart'


interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Sync cart from backend on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    setIsLoading(true)
    getCart()
      .then((res) => {
        const cartData = res.data?.data || []
        // Normalize backend cart items to our CartItem shape
        if (Array.isArray(cartData)) {
          const normalized: CartItem[] = cartData.map((item: {
            product?: Product;
            quantity?: number;
            product_id?: number;
            title?: string;
            price?: number;
            stock?: number;
            category?: string;
            description?: string;
            image?: string;
            rating?: number;
          }) => ({
            product: item.product || {
              id: item.product_id || 0,
              title: item.title || '',
              price: item.price || 0,
              stock: item.stock || 0,
              category: item.category || '',
              description: item.description || '',
              image: item.image || '',
              rating: item.rating || 0,
            },
            quantity: item.quantity || 1,
          }))
          setItems(normalized)
        }
      })
      .catch(() => {
        // Backend cart unavailable - use local state only
      })
      .finally(() => setIsLoading(false))
  }, [])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    // Optimistic update - update UI immediately
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })

    toast({ title: 'Added to cart', description: `${product.title} added to your cart.` })

    // Sync with backend (fire and forget)
    const token = localStorage.getItem('token')
    if (token) {
      addToCartApi(product.id, quantity).catch(() => {
        // Silently fail - local state is the source of truth for guests
      })
    }
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))

    const token = localStorage.getItem('token')
    if (token) {
      removeFromCartApi(productId).catch(() => {})
    }
  }, [])

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )

      const token = localStorage.getItem('token')
      if (token) {
        updateCartItemApi(productId, quantity).catch(() => {})
      }
    },
    [removeFromCart]
  )

  const clearCart = useCallback(() => {
    setItems([])
    const token = localStorage.getItem('token')
    if (token) {
      clearCartApi().catch(() => {})
    }
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isLoading }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
