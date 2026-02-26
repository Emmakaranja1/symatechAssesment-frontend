import client from './client'
import type { ApiResponse, PaginatedResponse, Product } from '@/lib/types'

export interface ProductParams {
  category?: string
  search?: string
  page?: number
  per_page?: number
}

export interface CreateProductPayload {
  name: string          
  title?: string
  sku: string
  description: string
  price: number
  cost_price?: number
  category: string
  stock: number
  weight?: number
  dimensions?: string
  image: string
  images?: string[]
  rating?: number
  active?: boolean
  featured?: boolean
}

export interface UpdateProductPayload {
  name?: string
  title?: string
  sku?: string
  description?: string
  price?: number
  cost_price?: number
  category?: string
  stock?: number
  weight?: number
  dimensions?: string
  image?: string
  images?: string[]
  rating?: number
  active?: boolean
  featured?: boolean
}

export const getProducts = (params?: ProductParams) =>
  client.get<ApiResponse<Product[]>>('/products', { params })

export const getProduct = (id: number) =>
  client.get<ApiResponse<Product>>(`/products/${id}`)

export const getAdminProducts = () =>
  client.get<PaginatedResponse<Product>>('/admin/products')

export const createProduct = (data: CreateProductPayload) =>
  client.post<ApiResponse<Product>>('/admin/products', data)

export const updateProduct = (id: number, data: UpdateProductPayload) =>
  client.put<ApiResponse<Product>>(`/admin/products/${id}`, data)

export const deleteProduct = (id: number) =>
  client.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`)
