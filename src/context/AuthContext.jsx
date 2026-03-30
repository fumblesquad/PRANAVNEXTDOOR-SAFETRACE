import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { signOut } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    // Seed initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { ...session.user, uid: session.user.id } : null)
    }).catch(err => {
      console.error('Failed to get session:', err)
      setUser(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user, uid: session.user.id } : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  // Return safe defaults if used outside provider (should not happen, but prevents crashes)
  if (context === null) {
    return { user: null, logout: () => {} }
  }
  return context
}
