'use client'

import { useState, useEffect } from 'react'
import { getUser, isAuthenticated, logout as authLogout, type User } from '@/utils/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUser()
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    authLogout()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}