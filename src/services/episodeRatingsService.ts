import api from './api'

export type EpisodeRating = {
  user_id: number
  episode_id: number
  rating: number
  created_at: string
  updated_at: string
}

export async function getEpisodeRatings(): Promise<EpisodeRating[]> {
  const res = await api.get<EpisodeRating[]>('/episode-ratings')
  return res.data
}

export async function getEpisodeRating(episodeId: number): Promise<EpisodeRating> {
  const res = await api.get<EpisodeRating>(`/episode-ratings/${episodeId}`)
  return res.data
}

export async function createEpisodeRating(episodeId: number, rating: number): Promise<EpisodeRating> {
  const res = await api.post<EpisodeRating>('/episode-ratings', { episode_id: episodeId, rating })
  return res.data
}

export async function updateEpisodeRating(episodeId: number, rating: number): Promise<EpisodeRating> {
  const res = await api.put<EpisodeRating>(`/episode-ratings/${episodeId}`, { rating })
  return res.data
}

export async function deleteEpisodeRating(episodeId: number): Promise<void> {
  await api.delete(`/episode-ratings/${episodeId}`)
}
