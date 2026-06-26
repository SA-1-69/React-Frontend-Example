import type { User } from './IUserInterface'

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
  image_url?: string
  gender_id?: number
}

export type LoginRequest = {
  email: string
  password: string
}
