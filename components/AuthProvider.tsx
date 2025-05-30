'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDispatch } from 'react-redux'
import { setAuth, clearAuth } from '@/lib/redux/slices/user-slice'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const dispatch = useDispatch()

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      dispatch(setAuth({
        token: session.accessToken,
        user: session.user
      }))
    } else if (status === 'unauthenticated') {
      dispatch(clearAuth())
    }
  }, [session, status, dispatch])

  return <>{children}</>
}
