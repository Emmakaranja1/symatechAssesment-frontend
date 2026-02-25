import client from './client'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}


export const register = (data: RegisterPayload) =>
  client.post('/register', data)


export const login = (data: LoginPayload) =>
  client.post('/login', data)


export const getMe = () =>
  client.get('/auth/me')


export const logout = () =>
  client.post('/auth/logout')

export const refreshToken = () =>
  client.post('/auth/refresh')


export const changePassword = (data: ChangePasswordPayload) =>
  client.post('/auth/change-password', data)


export const registerAdmin = (data: RegisterPayload) =>
  client.post('/auth/register-admin', data)
