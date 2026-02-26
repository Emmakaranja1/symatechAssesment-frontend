import client from './client'
import type { ApiResponse, PaginatedResponse, Product } from '@/lib/types'

export interface AdminProductsParams {
  page?: number
  per_page?: number
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'out_of_stock' | 'low_stock'
  featured?: boolean
}

export interface AdminProduct extends Product {
  cost_price?: number
  formatted_cost_price?: string
  statistics?: {
    total_sold: number
    total_revenue: number
    orders_count: number
    views_count: number
    wishlist_count: number
  }
  sales_history?: Array<{
    date: string
    quantity_sold: number
    revenue: number
  }>
  stock_history?: Array<{
    date: string
    stock_level: number
    change: number
    reason: string
  }>
  recent_orders?: Array<{
    id: number
    user_name: string
    quantity: number
    total: number
    status: string
    created_at: string
  }>
}

export interface AdminProductDetails extends AdminProduct {
  sales_history: Array<{
    date: string
    quantity_sold: number
    revenue: number
  }>
  stock_history: Array<{
    date: string
    stock_level: number
    change: number
    reason: string
  }>
  recent_orders: Array<{
    id: number
    user_name: string
    quantity: number
    total: number
    status: string
    created_at: string
  }>
}

export interface AdminProductsResponse {
  data: AdminProduct[]
  pagination: {
    current_page: number
    total_pages: number
    total_products: number
    per_page: number
  }
  filters: {
    categories: string[]
    statuses: string[]
    featured_counts: {
      featured: number
      not_featured: number
    }
  }
}

export const getAdminProducts = (params?: AdminProductsParams) =>
  client.get<ApiResponse<AdminProductsResponse>>('/admin/products', { params })

export const getAdminProduct = (id: number) =>
  client.get<ApiResponse<AdminProductDetails>>(`/admin/products/${id}`)

export const createAdminProduct = (data: Omit<AdminProduct, 'id' | 'created_at' | 'updated_at' | 'statistics' | 'sales_history' | 'stock_history' | 'recent_orders' | 'formatted_price' | 'formatted_cost_price'>) =>
  client.post<ApiResponse<AdminProduct>>('/admin/products', data)

export const updateAdminProduct = (id: number, data: Partial<AdminProduct>) =>
  client.put<ApiResponse<AdminProduct>>(`/admin/products/${id}`, data)

export const deleteAdminProduct = (id: number) =>
  client.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`)
