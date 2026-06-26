export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  age: number
  birth_day: string | null
  image_url: string
  gender_id: number | null
  created_at: string
  updated_at: string
}

export type UpdateProfileRequest = {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  age?: number
  birth_day?: string
  image_url?: string
  gender_id?: number
}
