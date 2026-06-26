export type User = {
  id: number
  first_name: string
  last_name: string
  email: string 
  address: string
  age: number
  birth_day: string | null
  gender_id: number | null
  created_at: string
  updated_at: string
}

export type UpdateProfileRequest = {
  first_name?: string
  last_name?: string
  email?: string
  address?: string
  password?: string
  age?: number
  birth_day?: string
  gender_id?: number
}
