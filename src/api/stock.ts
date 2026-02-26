import client from './client'
import type { ApiResponse, StockCheckResponse } from '@/lib/types'

export interface StockCheckPayload {
  product_id?: number
  product_sku?: string
  quantity: number
}

export const checkStock = (data: StockCheckPayload) =>
  client.post<ApiResponse<StockCheckResponse>>('/stock/check', data)
