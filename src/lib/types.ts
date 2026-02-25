export interface Product {
  id: number
  title: string
  category: string
  price: number
  stock: number
  description: string
  image: string
  rating: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total: number
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'customer'
  joined: string
  active: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
