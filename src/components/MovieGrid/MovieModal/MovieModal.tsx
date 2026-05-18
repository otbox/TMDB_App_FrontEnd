import React, { useEffect, useState } from 'react'
import type { Movie } from '../../../types/Movie'
import type { MovieDetails } from '../../../types/MovieDetails'
import './style.css'
import { getMovieDetails } from '../../../services/tmdbService'


type MovieModalProps = {
  movie: Movie | null
  onClose: () => void
}

function MovieModalComponent({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!movie?.id) return

    let ignore = false

    async function loadMovieDetails() {
      try {
        setLoading(true)
        setError(null)

        if (!movie) {setError('Failed to load movie details'); return;} 
        const data = await getMovieDetails(movie.id)

        if (!ignore) {
          setDetails(data)
        }
      } catch (err) {
        if (!ignore) {
          setError('Failed to load movie details')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadMovieDetails()

    return () => {
      ignore = true
    }
  }, [movie?.id])

  if (!movie) return null

return (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
    >
      <button
        type="button"
        className="modal-close"
        onClick={onClose}
        aria-label="Close modal"
      >
        ×
      </button>

      {loading && (
        <div className="modal-state">
          <p>Loading movie details...</p>
        </div>
      )}

      {error && (
        <div className="modal-state modal-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && details && (
        <>
          <div className="modal-hero">
            {details.backdrop_path && (
              <img
                className="modal-backdrop"
                src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
                alt={details.title}
              />
            )}

            <div className="modal-hero-overlay" />
          </div>

          <div className="modal-body">
            <div className="modal-poster-column">
              <img
                className="modal-poster"
                src={
                  details.poster_path
                    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                    : 'https://placehold.co/500x750/141414/ffffff?text=No+Image'
                }
                alt={details.title}
                width={500}
                height={750}
              />
            </div>

            <div className="modal-info-column">
              <h2 id="movie-modal-title" className="modal-title">
                {details.title}
              </h2>

              {details.tagline && (
                <p className="modal-tagline">{details.tagline}</p>
              )}

              <div className="modal-meta">
                <span className="modal-chip">
                  Release: {details.release_date}
                </span>
                <span className="modal-chip">
                  Runtime: {details.runtime} min
                </span>
                <span className="modal-chip">
                  Score: {details.vote_average.toFixed(1)}
                </span>
                <span className="modal-chip">
                  Popularity: {Math.round(details.popularity)}
                </span>
              </div>

              <div className="modal-section">
                <h3>Summary</h3>
                <p>{details.overview || 'No summary available.'}</p>
              </div>

              <div className="modal-section">
                <h3>Genres</h3>
                <p>
                  {details.genres.map((genre) => genre.name).join(' • ')}
                </p>
              </div>

              {details.credits?.cast?.length > 0 && (
                <div className="modal-section">
                  <h3>Actors</h3>
                  <div className="modal-cast-list">
                    {details.credits.cast.slice(0, 8).map((actor) => (
                      <div key={actor.id} className="modal-cast-card">
                        <img
                          src={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                              : 'https://placehold.co/185x278/222/fff?text=No+Photo'
                          }
                          alt={actor.name}
                          className="modal-cast-photo"
                          width={185}
                          height={278}
                        />
                        <span className="modal-cast-name">{actor.name}</span>
                        <span className="modal-cast-character">
                          {actor.character}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
)
}

export const MovieModal = React.memo(MovieModalComponent)
export default MovieModalComponent