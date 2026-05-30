import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, User } from '../api/types'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'
import { AuthContext, type AuthContextValue } from './AuthContext'

const TOKEN_STORAGE_KEY = 'auth_token'

function applyAuthResponse(res: AuthResponse): { token: string; user: User } {
  return { token: res.token, user: res.user }
}

function dateOnlyToRfc3339Utc(dateOnly: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly)
  if (!match) return null

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) return
    const profile = await authApi.getProfile(token)
    setUser(profile)
  }, [token])

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authApi.login(payload)
    const next = applyAuthResponse(res)
    localStorage.setItem(TOKEN_STORAGE_KEY, next.token)
    setToken(next.token)
    setUser(next.user)
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await authApi.register(payload)
    const next = applyAuthResponse(res)
    localStorage.setItem(TOKEN_STORAGE_KEY, next.token)
    setToken(next.token)

    let finalUser = next.user
    if (payload.birth_day) {
      const rfc3339 = dateOnlyToRfc3339Utc(payload.birth_day)
      if (rfc3339) {
        try {
          finalUser = await usersApi.updateProfile(next.token, { birth_day: rfc3339 })
        } catch {
          // Best-effort: keep account created + logged in even if birthday save fails.
        }
      }
    }

    setUser(finalUser)
  }, [])

  const updateProfile = useCallback(
    async (payload: UpdateProfileRequest) => {
      if (!token) return
      const updated = await usersApi.updateProfile(token, payload)
      setUser(updated)
    },
    [token],
  )

  const deleteAccount = useCallback(async () => {
    if (!token) return
    await usersApi.deleteAccount(token)
    logout()
  }, [token, logout])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!token) {
        if (!cancelled) setIsLoading(false)
        return
      }

      try {
        const profile = await authApi.getProfile(token)
        if (!cancelled) setUser(profile)
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [token, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      deleteAccount,
    }),
    [token, user, isLoading, login, register, logout, refreshProfile, updateProfile, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
