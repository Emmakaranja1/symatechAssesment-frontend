import client from './client'
import type { ApiResponse, PaginatedResponse, Payment } from '@/lib/types'

export interface AdminPaymentsParams {
  page?: number
  per_page?: number
  payment_method?: 'mpesa' | 'flutterwave'
  status?: 'pending' | 'completed' | 'failed' | 'refunded'
  start_date?: string
  end_date?: string
}

export interface AdminPaymentOrder {
  id: number
  user_name: string
  product_name: string
}

export interface AdminPayment {
  id: number
  order_id: number
  payment_method: 'mpesa' | 'flutterwave'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  transaction_id?: string
  phone_number?: string
  paid_at?: string
  created_at: string
  order?: AdminPaymentOrder
  formatted_amount?: string
  email?: string | null
  response_data?: Record<string, any>
  failure_reason?: string | null
}

export interface AdminPaymentsResponse {
  data: AdminPayment[]
  pagination: {
    current_page: number
    total_pages: number
    total_payments: number
    per_page: number
  }
  statistics: {
    total_payments: number
    total_amount: number
    completed_payments: number
    pending_payments: number
    failed_payments: number
    refunded_payments: number
    payment_methods: {
      mpesa: { count: number; amount: number }
      flutterwave: { count: number; amount: number }
    }
  }
}

export interface ProcessRefundPayload {
  payment_id: number
  amount: number
  reason: string
}

export interface RefundResponse {
  payment_id: number
  refund_amount: number
  refund_id: string
  status: string
  processed_at: string
}

export const getAdminPayments = (params?: AdminPaymentsParams) =>
  client.get<ApiResponse<AdminPaymentsResponse>>('/admin/payments', { params })

export const processRefund = (data: ProcessRefundPayload) =>
  client.post<ApiResponse<RefundResponse>>('/api/payments/refund', data)
