import client from './client'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Payment, 
  MpesaInitiateResponse, 
  FlutterwaveInitiateResponse, 
  PaymentVerifyResponse 
} from '@/lib/types'

export interface MpesaInitiatePayload {
  order_id: number
  phone_number: string   
}

export interface MpesaVerifyPayload {
  checkout_request_id: string
}

export interface FlutterwaveInitiatePayload {
  order_id: number
  email: string
  name: string
}

export interface FlutterwaveVerifyPayload {
  transaction_id: string
}

export const initiateMpesa = (data: MpesaInitiatePayload) =>
  client.post<ApiResponse<MpesaInitiateResponse>>('/payments/mpesa/initiate', data)

export const verifyMpesa = (data: MpesaVerifyPayload) =>
  client.post<ApiResponse<PaymentVerifyResponse>>('/payments/mpesa/verify', data)

export const initiateFlutterwave = (data: FlutterwaveInitiatePayload) =>
  client.post<ApiResponse<FlutterwaveInitiateResponse>>('/payments/flutterwave/initiate', data)

export const verifyFlutterwave = (data: FlutterwaveVerifyPayload) =>
  client.post<ApiResponse<PaymentVerifyResponse>>('/payments/flutterwave/verify', data)

export const getUserPayments = () =>
  client.get<PaginatedResponse<Payment>>('/payments')
