import client from './client'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'

// Dashboard & Analytics
export interface DashboardStatsParams {
  period?: 'today' | 'week' | 'month' | 'year'
  start_date?: string
  end_date?: string
}

export interface RealtimeData {
  total_orders: number
  total_revenue: number
  total_users: number
  total_products: number
  pending_orders: number
  processing_orders: number
  completed_orders: number
  failed_payments: number
  today_orders: number
  today_revenue: number
  monthly_growth: {
    orders_growth: number
    revenue_growth: number
    users_growth: number
  }
  top_products: Array<{
    id: number
    name: string
    total_sales: number
    revenue: number
  }>
  recent_orders: Array<{
    id: number
    user_name: string
    total: number
    status: string
    created_at: string
  }>
}

export interface DashboardStats {
  period: string
  orders: {
    total: number
    completed: number
    pending: number
    failed: number
    daily_breakdown: Array<{
      date: string
      orders: number
      revenue: number
    }>
  }
  revenue: {
    total: number
    average_order_value: number
    growth_rate: number
  }
  products: {
    total_sold: number
    top_performing: Array<{
      id: number
      name: string
      sales: number
      revenue: number
    }>
    low_stock: Array<{
      id: number
      name: string
      stock: number
      status: string
    }>
  }
  users: {
    new_users: number
    active_users: number
    total_users: number
  }
}

export const getRealtimeData = () =>
  client.get<ApiResponse<RealtimeData>>('/admin/reports/realtime-data')

export const getDashboardStats = (params?: DashboardStatsParams) =>
  client.get<ApiResponse<DashboardStats>>('/admin/reports/dashboard', { params })

// Health Check
export interface HealthCheck {
  success: boolean
  status: string
  timestamp: string
  services: {
    database: {
      status: string
      connections: number
      max_connections: number
    }
    redis: {
      status: string
      memory_usage: string
      connected_clients: number
    }
    storage: {
      status: string
      disk_usage: string
      free_space: string
    }
  }
  version: string
  environment: string
}

export const getHealthCheck = () =>
  client.get<HealthCheck>('/health')

export const resetDatabase = () =>
  client.get<ApiResponse<{ message: string }>>('/database-reset')
