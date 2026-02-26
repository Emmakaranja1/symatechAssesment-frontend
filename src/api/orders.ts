import client from './client'
import type { ApiResponse, PaginatedResponse, Order, OrderStatusResponse } from '@/lib/types'

export interface CreateOrderPayload {
  product_id?: number
  product_sku?: string
  quantity: number
}

export interface UpdateOrderStatusPayload {
  status: string
  notes?: string
}

export const createOrder = (data: CreateOrderPayload) =>
  client.post<ApiResponse<{ 
    message: string
    order_id: number
    product_name: string
    quantity: number
    total: number
    payment_status: string
    next_step: string
  }>>('/orders', data)

export const getOrders = () =>
  client.get<ApiResponse<Order[]>>('/orders')

export const getOrder = (id: string | number) =>
  client.get<ApiResponse<Order>>(`/orders/${id}`)

export const getOrderPaymentStatus = (id: string | number) =>
  client.get<OrderStatusResponse>(`/orders/${id}/payment-status`)

export const deleteOrder = (id: string | number) =>
  client.delete<ApiResponse<{ message: string }>>(`/orders/${id}`)

export const updateOrderStatus = (id: string | number, data: UpdateOrderStatusPayload) =>
  client.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, data)

export const getAllOrders = () =>
  client.get<PaginatedResponse<Order>>('/admin/orders')

export const exportOrdersExcel = () =>
  client.get('/admin/orders/export/excel', { responseType: 'blob' })

export const exportOrdersPdf = () =>
  client.get('/admin/orders/export/pdf', { responseType: 'blob' })

export const downloadFile = (response: { data: BlobPart }, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
