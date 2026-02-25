import client from './client'



export interface CartItemPayload {
  product_id: number
  quantity: number
  user_id: number
}


const getUserId = (): number => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.id || 0
  } catch {
    return 0
  }
}


export const getCart = () =>
  client.get('/redis/cart', { params: { user_id: getUserId() } })


export const getCartSummary = () =>
  client.get('/redis/cart/summary', { params: { user_id: getUserId() } })


export const addToCart = (product_id: number, quantity: number) =>
  client.post('/redis/cart/add', {
    product_id,
    quantity,
    user_id: getUserId(),
  })


export const updateCartItem = (product_id: number, quantity: number) =>
  client.put('/redis/cart/quantity', {
    product_id,
    quantity,
    user_id: getUserId(),
  })


export const removeFromCart = (product_id: number) =>
  client.delete('/redis/cart/item', {
    data: {
      product_id,
      user_id: getUserId(),
    },
  })


export const clearCartApi = () =>
  client.delete('/redis/cart', {
    params: { user_id: getUserId() },
  })
