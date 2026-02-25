import client from './client'

export interface ReportParams {
  start_date?: string
  end_date?: string
  group_by?: 'daily' | 'weekly' | 'monthly'
  user_id?: number
  activity_type?: string
  per_page?: number
  days?: number
}

// Dashboard stats
export const getDashboardStats = (params?: ReportParams) =>
  client.get('/admin/reports/dashboard', { params })

export const getRealtimeData = () =>
  client.get('/admin/reports/realtime-data')

// User registration trends
export const getUserRegistrationTrends = (params?: ReportParams) =>
  client.get('/admin/reports/user-registration-trends', { params })

export const exportUserTrendsExcel = (params?: ReportParams) =>
  client.get('/admin/reports/user-registration-trends/export/excel', { params, responseType: 'blob' })

export const exportUserTrendsPdf = (params?: ReportParams) =>
  client.get('/admin/reports/user-registration-trends/export/pdf', { params, responseType: 'blob' })

// Activity log (all users)
export const getActivityLog = (params?: ReportParams) =>
  client.get('/admin/reports/activity-log', { params })

export const exportActivityLogExcel = (params?: ReportParams) =>
  client.get('/admin/reports/activity-log/export/excel', { params, responseType: 'blob' })

export const exportActivityLogPdf = (params?: ReportParams) =>
  client.get('/admin/reports/activity-log/export/pdf', { params, responseType: 'blob' })

// Normal user activity only
export const getNormalUserActivity = (params?: ReportParams) =>
  client.get('/admin/reports/normal-user-activity', { params })

export const exportNormalUserActivityExcel = (params?: ReportParams) =>
  client.get('/admin/reports/normal-user-activity/export/excel', { params, responseType: 'blob' })

export const exportNormalUserActivityPdf = (params?: ReportParams) =>
  client.get('/admin/reports/normal-user-activity/export/pdf', { params, responseType: 'blob' })
