import client from './client'


export interface ProductParams {
  category?: string
  search?: string
  page?: number
  per_page?: number
}

export interface CreateProductPayload {
  name: string          
  description: string
  price: number
  category: string
  stock: number
  image?: string
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  price?: number
  category?: string
  stock?: number
  image?: string
}


export const getProducts = (params?: ProductParams) =>
  client.get('/products', { params })


export const getProduct = (id: number) =>
  client.get(`/products/${id}`)


export const getAdminProducts = () =>
  client.get('/admin/products')


export const createProduct = (data: CreateProductPayload) =>
  client.post('/admin/products', data)


export const updateProduct = (id: number, data: UpdateProductPayload) =>
  client.put(`/admin/products/${id}`, data)


export const deleteProduct = (id: number) =>
  client.delete(`/admin/products/${id}`)
