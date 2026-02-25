import client from './client'


export interface MpesaInitiatePayload {
  amount: number
  phone_number: string   
  order_id: number       
}

export interface MpesaVerifyPayload {
  checkout_request_id: string
}

export interface FlutterwaveInitiatePayload {
  amount: number
  currency: string         
  payment_method: string   
  order_id: number
}

export interface FlutterwaveVerifyPayload {
  transaction_id: string
}

export const initiateMpesa = (data: MpesaInitiatePayload) =>
  client.post('/payments/mpesa/initiate', data)


export const verifyMpesa = (data: MpesaVerifyPayload) =>
  client.post('/payments/mpesa/verify', data)


export const initiateFlutterwave = (data: FlutterwaveInitiatePayload) =>
  client.post('/payments/flutterwave/initiate', data)


export const verifyFlutterwave = (data: FlutterwaveVerifyPayload) =>
  client.post('/payments/flutterwave/verify', data)


export const getUserPayments = () =>
  client.get('/payments')
