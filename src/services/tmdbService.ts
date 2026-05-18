import type { Genre } from "../types/Movie";
import type { MovieCredits, MovieDetails } from "../types/MovieDetails";



const url: string = "https://api.themoviedb.org/3";
const apiKey: string = import.meta.env.VITE_API_KEY_TMDB;

type getAllGenresReposnsa = {
    genres : Genre[]
}


export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
    const urlPath = `${url}/movie/${movieId}`
    const urlPath1 = `${url}/movie/${movieId}/credits`
    
    const creditsResponse = await fetch(urlPath1, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    })

    if (!creditsResponse.ok) {
        throw new Error(`TMDB request failed: ${creditsResponse.status}`)
    }

    const dataCredits : MovieCredits = await creditsResponse.json()

    const response = await fetch(urlPath, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    
    const data: MovieDetails = await response.json()
    data.credits = dataCredits;
    return data
}

export async function searchMovies(query: string, page = 1) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: 'application/json',
      },
    }
  )
  if (!response.ok) {
    throw new Error('Failed to search movies')
  }
  return await response.json()
}

export async function getAllGenresMovies(): Promise<Genre[]> {
    const urlPath = `${url}/genre/movie/list`
    
    const response = await fetch(urlPath, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiKey}`,  
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`)
    }
    const data : getAllGenresReposnsa = await response.json();
    return data.genres
}

export async function getAllMovies(page = 1, genreId?: number) {
  const params = new URLSearchParams({
    page: String(page),
  })

  if (genreId) {
    params.append('with_genres', String(genreId))
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch movies')
  }

  return await response.json()
}