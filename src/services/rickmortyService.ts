const RM_BASE = 'https://rickandmortyapi.com/api'

export type RMEpisode = {
  id: number
  name: string
  air_date: string
  episode: string       // e.g. "S01E01"
  characters: string[]  // array of character URLs
  url: string
  created: string
}

export type RMEpisodesResponse = {
  info: {
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
  results: RMEpisode[]
}

export type RMCharacter = {
  id: number
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  type: string
  gender: string
  origin: { name: string; url: string }
  location: { name: string; url: string }
  image: string
  episode: string[]
  url: string
  created: string
}

export async function getEpisodes(page = 1, name = ''): Promise<RMEpisodesResponse> {
  const params = new URLSearchParams({ page: String(page) })
  if (name.trim()) params.set('name', name.trim())
  const res = await fetch(`${RM_BASE}/episode?${params}`)
  if (!res.ok) throw new Error('Failed to fetch episodes')
  return res.json()
}

export async function getEpisode(id: number): Promise<RMEpisode> {
  const res = await fetch(`${RM_BASE}/episode/${id}`)
  if (!res.ok) throw new Error('Episode not found')
  return res.json()
}

export async function getCharactersByUrls(urls: string[]): Promise<RMCharacter[]> {
  if (urls.length === 0) return []
  // R&M API supports batch: /character/1,2,3
  const ids = urls.map((u) => u.split('/').pop()).join(',')
  const res = await fetch(`${RM_BASE}/character/${ids}`)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : [data]
}
