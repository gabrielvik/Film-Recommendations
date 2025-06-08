import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Mock authentication functions (will be replaced with real API calls)
  const login = async (email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      }
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
      
      // Store auth token in localStorage (mock)
      localStorage.setItem('cinematiq_auth_token', 'mock_jwt_token')
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw new Error('Login failed')
    }
  }

  const register = async (name: string, email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration
      const mockUser: User = {
        id: '1',
        name,
        email,
        role: 'user',
      }
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
      
      localStorage.setItem('cinematiq_auth_token', 'mock_jwt_token')
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw new Error('Registration failed')
    }
  }

  const logout = async (): Promise<void> => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    
    localStorage.removeItem('cinematiq_auth_token')
  }

  const refreshAuth = async (): Promise<void> => {
    const token = localStorage.getItem('cinematiq_auth_token')
    
    if (token) {
      // Mock token validation
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      }
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  // Check auth status on mount
  useEffect(() => {
    refreshAuth()
  }, [])

  const value: AuthContextValue = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
