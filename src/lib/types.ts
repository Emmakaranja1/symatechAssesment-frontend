export interface Product {
  id: number
  name: string
  title?: string
  sku: string
  category: string
  price: number
  cost_price?: number
  stock: number
  weight?: number
  dimensions?: string
  description: string
  image: string
  images?: string[]
  rating?: number
  active: boolean
  featured?: boolean
  status: 'active' | 'low_stock' | 'out_of_stock' | 'inactive'
  formatted_price?: string
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderProduct {
  product_id: number
  quantity: number
  price: number
}

export interface OrderItem {
  product: Product
  quantity: number
}

export interface Order {
  id: number
  user_id: number
  product_id: number
  quantity: number
  total_price: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  updated_at: string
  product?: Product
  latest_payment?: Payment
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  joined?: string
  active?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  total: number
  per_page?: number
  last_page?: number
}

export interface Payment {
  id: number
  order_id: number
  payment_method: 'mpesa' | 'flutterwave'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transaction_id?: string
  phone_number?: string
  paid_at?: string
  created_at: string
  order?: Order
}

export interface OrderStatusResponse {
  success: boolean
  order_id: number
  order_status: string
  payment_status: string
  total_amount: number
  formatted_amount: string
  payment?: Payment
  next_actions: Array<{
    action: string
    description: string
    endpoints: {
      mpesa?: string
      flutterwave?: string
    }
  }>
}

export interface StockCheckResponse {
  success: boolean
  available: boolean
  product: Product
  requested_quantity: number
  can_purchase: boolean
  message: string
}

export interface MpesaInitiateResponse {
  message: string
  payment_id: number
  checkout_request_id: string
  merchant_request_id: string
  customer_message: string
}

export interface FlutterwaveInitiateResponse {
  message: string
  payment_id: number
  payment_link: string
  transaction_reference: string
}

export interface PaymentVerifyResponse {
  message: string
  payment_status: string
  order_status: string
  response?: {
    ResultCode: number
    ResultDesc: string
  }
}
