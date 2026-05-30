export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiErrorBody = {
  success: false
  error: {
    message: string
    detail: string
  }
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody

export type User = {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type UpdateProfileRequest = {
  name?: string
  email?: string
  password?: string
}
