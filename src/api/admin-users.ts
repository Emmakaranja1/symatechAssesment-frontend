import client from './client'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'

export interface AdminUsersParams {
  page?: number
  per_page?: number
  search?: string
  status?: 'active' | 'inactive'
  role?: 'admin' | 'user'
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  active: boolean
  email_verified_at?: string
  created_at: string
  last_login?: string
  orders_count?: number
  total_spent?: number
  profile?: {
    phone?: string
    address?: string
  }
}

export interface AdminUserDetails extends AdminUser {
  profile: {
    phone?: string
    address?: string
    city?: string
    country?: string
  }
  statistics: {
    orders_count: number
    total_spent: number
    average_order_value: number
    first_order_date?: string
    last_order_date?: string
  }
  recent_orders: Array<{
    id: number
    total: number
    status: string
    payment_status: string
    created_at: string
  }>
}

export interface UserStatusResponse {
  success: boolean
  message: string
  data: {
    id: number
    active: boolean
    activated_at?: string
    deactivated_at?: string
  }
}

export interface RegisterAdminPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const getAllUsers = (params?: AdminUsersParams) =>
  client.get<PaginatedResponse<AdminUser>>('/admin/users', { params })

export const getUser = (id: number) =>
  client.get<ApiResponse<AdminUserDetails>>(`/admin/users/${id}`)

export const activateUser = (id: number) =>
  client.patch<ApiResponse<UserStatusResponse>>(`/admin/users/${id}/activate`)

export const deactivateUser = (id: number) =>
  client.patch<ApiResponse<UserStatusResponse>>(`/admin/users/${id}/deactivate`)

export const registerAdmin = (data: RegisterAdminPayload) =>
  client.post<ApiResponse<AdminUser>>('/admin/register', data)
