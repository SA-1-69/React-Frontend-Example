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
  first_name: string
  last_name: string
  email: string
  age: number
  birth_day: string | null
  gender_id: number | null
  created_at: string
  updated_at: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type RegisterRequest = {
  first_name: string
  last_name: string
  email: string
  password: string
  age?: number
  birth_day?: string
  gender_id?: number
}

export type LoginRequest = {
  email: string
  password: string
}

export type UpdateProfileRequest = {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  age?: number
  birth_day?: string
  gender_id?: number
}
