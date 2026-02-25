import client from './client'


export interface OrderProduct {
  product_id: number
  quantity: number
  price: number         
}

export interface ShippingAddress {
  address: string       // FIX: was "street" — backend expects "address"
  city: string
  country: string
}

export interface CreateOrderPayload {
  products: OrderProduct[]   // FIX: was "items" — backend expects "products"
  shipping_address: ShippingAddress
}


export const createOrder = (data: CreateOrderPayload) =>
  client.post('/orders', data)


export const getOrders = () =>
  client.get('/orders')


export const getOrder = (id: string | number) =>
  client.get(`/orders/${id}`)


export const cancelOrder = (id: string | number) =>
  client.delete(`/orders/${id}`)


export const getAllOrders = () =>
  client.get('/admin/orders')


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
