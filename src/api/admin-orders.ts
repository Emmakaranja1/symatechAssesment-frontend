import client from './client'
import type { ApiResponse, PaginatedResponse, Order, Product, Payment } from '@/lib/types'

export interface AdminOrdersParams {
  page?: number
  per_page?: number
  search?: string
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'failed'
  user_id?: number
  start_date?: string
  end_date?: string
}

export interface AdminOrderUser {
  id: number
  name: string
  email: string
  phone?: string
}

export interface AdminOrderProduct {
  id: number
  name: string
  sku: string
  image: string
}

export interface AdminOrder {
  id: number
  user_id: number
  product_id: number
  quantity: number
  total_price: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid'
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  updated_at: string
  user?: AdminOrderUser
  product?: AdminOrderProduct
  formatted_total?: string
  latest_payment?: Payment
  shipping_address?: {
    address: string
    city: string
    country: string
    postal_code?: string
  }
  tracking_number?: string | null
  notes?: string
}

export interface AdminOrderDetails extends AdminOrder {
  user: AdminOrderUser
  product: AdminOrderProduct
  payments: Payment[]
  activity_logs: Array<{
    id: number
    description: string
    causer: {
      name: string
      email?: string
    }
    created_at: string
  }>
}

export interface AdminOrdersResponse {
  data: AdminOrder[]
  pagination: {
    current_page: number
    total_pages: number
    total_orders: number
    per_page: number
  }
  statistics: {
    total_orders: number
    pending_orders: number
    processing_orders: number
    shipped_orders: number
    delivered_orders: number
    cancelled_orders: number
    total_revenue: number
    revenue_breakdown: {
      paid: number
      pending: number
    }
  }
}

export interface UpdateOrderStatusPayload {
  status: string
  tracking_number?: string
  notes?: string
}

export const getAdminOrders = (params?: AdminOrdersParams) =>
  client.get<ApiResponse<AdminOrdersResponse>>('/admin/orders', { params })

export const getAdminOrder = (id: number) =>
  client.get<ApiResponse<AdminOrderDetails>>(`/admin/orders/${id}`)

export const updateAdminOrderStatus = (id: number, data: UpdateOrderStatusPayload) =>
  client.patch<ApiResponse<AdminOrder>>(`/admin/orders/${id}/status`, data)

export const exportAdminOrdersExcel = (params?: { start_date?: string; end_date?: string }) =>
  client.get('/admin/orders/export/excel', { 
    params,
    responseType: 'blob' 
  })

export const exportAdminOrdersPdf = (params?: { start_date?: string; end_date?: string }) =>
  client.get('/admin/orders/export/pdf', { 
    params,
    responseType: 'blob' 
  })
