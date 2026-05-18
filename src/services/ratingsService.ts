import api from './api'

export type Rating = {
  user_id: number
  movie_id: number
  rating: number
  created_at: string
  updated_at: string
}

export async function getRatings() {
  const response = await api.get<Rating[]>('/ratings')
  return response.data
}

export async function getRating(movieId: number) {
  const response = await api.get<Rating>(`/ratings/${movieId}`)
  return response.data
}

export async function createRating(movieId: number, rating: number) {
  const response = await api.post<Rating>('/ratings', {
    movie_id: movieId,
    rating,
  })

  return response.data
}

export async function updateRating(movieId: number, rating: number) {
  const response = await api.put<Rating>(`/ratings/${movieId}`, {
    rating,
  })

  return response.data
}

export async function deleteRating(movieId: number) {
  const response = await api.delete<{ message: string }>(`/ratings/${movieId}`)
  return response.data
}