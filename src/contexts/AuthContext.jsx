import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { authService } from '../services/auth.service'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const profileData = await authService.getUserProfile(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn: authService.signIn,
    signOut: authService.signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
