import { createContext } from 'react'
import type { LoginRequest, RegisterRequest } from '../interface/IAuthInterface'
import type { UpdateProfileRequest, User } from '../interface/IUserInterface'

export type AuthState = {
  token: string | null
  user: User | null
  isLoading: boolean
}

export type AuthContextValue = AuthState & {
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>
  deleteAccount: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
