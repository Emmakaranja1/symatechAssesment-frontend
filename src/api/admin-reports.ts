import client from './client'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'

export interface UserRegistrationTrendsParams {
  period?: 'week' | 'month' | 'quarter' | 'year'
  start_date?: string
  end_date?: string
}

export interface UserRegistrationTrends {
  period: string
  total_registrations: number
  daily_breakdown: Array<{
    date: string
    registrations: number
    cumulative: number
  }>
  growth_metrics: {
    current_period: number
    previous_period: number
    growth_rate: number
    projection: number
  }
  demographics: {
    by_role: { user: number; admin: number }
    by_verification: { verified: number; unverified: number }
  }
}

export interface ActivityLogParams {
  page?: number
  per_page?: number
  subject_type?: 'user' | 'product' | 'order' | 'payment'
  action?: 'created' | 'updated' | 'deleted'
  causer_id?: number
  start_date?: string
  end_date?: string
}

export interface ActivityLogCauser {
  id: number
  name: string
  email?: string
}

export interface ActivityLogEntry {
  id: number
  log_name: string
  description: string
  subject_type: string
  subject_id: number
  causer_type: string
  causer_id: number
  causer?: ActivityLogCauser
  properties?: Record<string, any>
  created_at: string
}

export interface ActivityLogResponse {
  data: ActivityLogEntry[]
  pagination: {
    current_page: number
    total_pages: number
    total_activities: number
    per_page: number
  }
  filters: {
    log_names: string[]
    actions: string[]
    subject_types: string[]
  }
}

export interface NormalUserActivityResponse {
  summary: {
    total_normal_users: number
    active_today: number
    active_this_week: number
    active_this_month: number
  }
  top_active_users: Array<{
    user: {
      id: number
      name: string
      email: string
    }
    activities_count: number
    last_activity: string
  }>
  activity_breakdown: {
    orders: number
    payments: number
    profile_updates: number
    logins: number
  }
}

export const getUserRegistrationTrends = (params?: UserRegistrationTrendsParams) =>
  client.get<ApiResponse<UserRegistrationTrends>>('/admin/reports/user-registration-trends', { params })

export const exportUserRegistrationTrendsExcel = (params?: UserRegistrationTrendsParams) =>
  client.get('/admin/reports/user-registration-trends/export/excel', { 
    params,
    responseType: 'blob' 
  })

export const exportUserRegistrationTrendsPdf = (params?: UserRegistrationTrendsParams) =>
  client.get('/admin/reports/user-registration-trends/export/pdf', { 
    params,
    responseType: 'blob' 
  })

export const getActivityLog = (params?: ActivityLogParams) =>
  client.get<ApiResponse<ActivityLogResponse>>('/admin/reports/activity-log', { params })

export const exportActivityLogExcel = (params?: ActivityLogParams) =>
  client.get('/admin/reports/activity-log/export/excel', { 
    params,
    responseType: 'blob' 
  })

export const exportActivityLogPdf = (params?: ActivityLogParams) =>
  client.get('/admin/reports/activity-log/export/pdf', { 
    params,
    responseType: 'blob' 
  })

export const getNormalUserActivity = () =>
  client.get<ApiResponse<NormalUserActivityResponse>>('/admin/reports/normal-user-activity')
