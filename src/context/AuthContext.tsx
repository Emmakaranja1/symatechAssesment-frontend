import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/api/auth'

import { toast } from '@/hooks/use-toast'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'customer'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore user session on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginApi({ email, password })
      // Backend returns { success, data: { token, user }, message }
      const responseData = res.data?.data || res.data
      const jwt = responseData?.token || responseData?.access_token
      const userData = responseData?.user

      if (!jwt) throw new Error('No token received')

      localStorage.setItem('token', jwt)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(jwt)
      setUser(userData)
      toast({ title: 'Welcome back!', description: `Hello, ${userData?.name}` })
      
      // Redirect admin to dashboard, regular users to home
      if (userData?.role === 'admin') {
        window.location.href = '/admin'
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast({
        title: 'Login failed',
        description: error?.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      })
      throw err
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      await registerApi({ name, email, password, password_confirmation: password })
      await login(email, password)
      toast({ title: 'Account created!', description: 'Welcome to Symatech Labs' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast({
        title: 'Registration failed',
        description: error?.response?.data?.message || 'Could not create account',
        variant: 'destructive',
      })
      throw err
    }
  }, [login])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore logout API errors - clear locally anyway
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast({ title: 'Signed out', description: 'See you next time!' })
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
