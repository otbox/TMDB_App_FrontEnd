import api from './api'

export type User = {
  id: number
  username: string
}

export type LoginResponse = {
  access_token: string
  user: User
}

export async function registerUser(username: string, password: string) {
  const response = await api.post<User>('/users', {
    username,
    password,
  })

  return response.data
}

export async function loginUser(username: string, password: string) {
  const response = await api.post<LoginResponse>('/login', {
    username,
    password,
  })

  return response.data
}