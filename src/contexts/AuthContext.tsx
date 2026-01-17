import React, { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'traveller' | 'admin'
  vehicleNumber?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    vehicleNumber?: string
  ) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ✅ DEMO USERS
const mockUsers: Record<string, { password: string; user: User }> = {
  'traveller@nhms.gov': {
    password: 'password123',
    user: {
      id: '1',
      name: 'Demo Traveller',
      email: 'traveller@nhms.gov',
      role: 'traveller',
      vehicleNumber: 'MH-01-AB-1234',
    },
  },
  'admin@nhms.gov': {
    password: 'password123',
    user: {
      id: '2',
      name: 'Demo Admin',
      email: 'admin@nhms.gov',
      role: 'admin',
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nhms_user')
    return saved ? JSON.parse(saved) : null
  })

  // ✅ DEMO LOGIN
  const login = async (email: string, password: string) => {
    const record = mockUsers[email]

    if (record && record.password === password) {
      setUser(record.user)
      localStorage.setItem('nhms_user', JSON.stringify(record.user))
      return true
    }

    return false
  }

  // ✅ DEMO REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    vehicleNumber?: string
  ) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'traveller',
      vehicleNumber,
    }

    setUser(newUser)
    localStorage.setItem('nhms_user', JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('nhms_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
