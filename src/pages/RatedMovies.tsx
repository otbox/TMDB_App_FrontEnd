import { useEffect, useState } from 'react'
import { getRatings, type Rating } from '../services/ratingsService'
import { getMovieDetails } from '../services/tmdbService'
import type { MovieDetails } from '../types/MovieDetails'
import { MovieModal } from '../components/MovieGrid/MovieModal/MovieModal'
import type { Movie } from '../types/Movie'
import './RatedMovies.css'

type RatedMovieEntry = {
  details: MovieDetails
  rating: number
}

export default function RatedMovies() {
  const [entries, setEntries] = useState<RatedMovieEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const ratings: Rating[] = await getRatings()

        const settled = await Promise.allSettled(
          ratings.map(async (r) => {
            const details = await getMovieDetails(r.movie_id)
            return { details, rating: r.rating }
          })
        )

        const loaded: RatedMovieEntry[] = settled
          .filter((r): r is PromiseFulfilledResult<RatedMovieEntry> => r.status === 'fulfilled')
          .map((r) => r.value)

        setEntries(loaded)
      } catch {
        setError('Failed to load rated movies.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function handleSelect(entry: RatedMovieEntry) {
    // convert MovieDetails → Movie shape for the modal
    setSelectedMovie({
      id: entry.details.id,
      title: entry.details.title,
      poster_path: entry.details.poster_path || "",
      backdrop_path: entry.details.backdrop_path || "",
      overview: entry.details.overview,
      release_date: entry.details.release_date as unknown as Date,
      vote_average: entry.details.vote_average,
      vote_count: 0,
      popularity: entry.details.popularity,
      original_language: entry.details.original_language ?? '',
      original_title: entry.details.original_title ?? '',
      video: false,
      adult: false,
      genre_ids: entry.details.genres?.map((g) => g.id) ?? [],
    })
  }

  if (loading) {
    return (
      <div className="rated-state">
        <p>Loading your rated movies...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rated-state rated-state--error">
        <p>{error}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rated-empty">
        <div className="rated-empty__icon">🎬</div>
        <h2>No rated movies yet</h2>
        <p>Go to the home page, find a movie you like and give it a rating.</p>
      </div>
    )
  }

  return (
    <div className="rated-page">
      <h1 className="rated-page__title">Rated Movies</h1>
      <p className="rated-page__count">{entries.length} movie{entries.length !== 1 ? 's' : ''} rated</p>

      <div className="rated-grid">
        {entries.map((entry) => {
          const { details, rating } = entry
          const poster = details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : 'https://placehold.co/500x750/141414/ffffff?text=No+Image'
          const year = details.release_date
            ? new Date(details.release_date).getFullYear()
            : 'N/A'

          return (
            <div
              key={details.id}
              className="rated-card"
              onClick={() => handleSelect(entry)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${details.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(entry)
                }
              }}
            >
              <div className="rated-card__poster-wrap">
                <img
                  className="rated-card__poster"
                  src={poster}
                  alt={details.title}
                  loading="lazy"
                  width={500}
                  height={750}
                />
              </div>

              <div className="rated-card__info">
                <h3 className="rated-card__title">{details.title}</h3>
                <span className="rated-card__year">{year}</span>

                <div className="rated-card__score">
                  <span className="rated-card__stars">
                    {'★'.repeat(Math.floor(rating))}
                    {rating % 1 !== 0 ? '½' : ''}
                    {'☆'.repeat(5 - Math.ceil(rating))}
                  </span>
                  <span className="rated-card__score-value">{rating} / 5</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}