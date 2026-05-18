import React, { useEffect, useState, useCallback } from 'react'
import type { Movie } from '../../../types/Movie'
import type { MovieDetails } from '../../../types/MovieDetails'
import './style.css'
import { getMovieDetails } from '../../../services/tmdbService'
import {
  getRating,
  createRating,
  updateRating,
  deleteRating,
} from '../../../services/ratingsService'
import StarRating from '../MovieCard/StarRating/StarRating'

type MovieModalProps = {
  movie: Movie | null
  onClose: () => void
  onAuthRequired?: () => void
}

function MovieModalComponent({ movie, onClose, onAuthRequired }: MovieModalProps) {
  const [details, setDetails]   = useState<MovieDetails | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // rating state
  const [existingRating, setExistingRating] = useState<number | null>(null)
  const [pickedStar, setPickedStar]         = useState<number>(0)
  const [ratingLoading, setRatingLoading]   = useState(false)
  const [ratingError, setRatingError]       = useState<string | null>(null)
  const [isEditing, setIsEditing]           = useState(false)

  const isLoggedIn = !!localStorage.getItem('token')

  // Load movie details
  useEffect(() => {
    if (!movie?.id) return
    let ignore = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        if (!movie) return
        const data = await getMovieDetails(movie.id)
        if (!ignore) setDetails(data)
      } catch {
        if (!ignore) setError('Failed to load movie details')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [movie?.id])

  // Load existing rating whenever movie changes
  useEffect(() => {
    if (!movie?.id || !isLoggedIn) {
      setExistingRating(null)
      setPickedStar(0)
      setIsEditing(false)
      return
    }

    let ignore = false

    async function loadRating() {
      try {
        if (!movie) return
        const r = await getRating(movie.id)
        if (!ignore) {
          setExistingRating(r.rating)
          setPickedStar(r.rating)
          setIsEditing(false)
        }
      } catch {
        // 404 = not rated yet, that's fine
        if (!ignore) {
          setExistingRating(null)
          setPickedStar(0)
        }
      }
    }

    loadRating()
    return () => { ignore = true }
  }, [movie?.id, isLoggedIn])

  const handleSubmitRating = useCallback(async () => {
    if (!movie?.id || pickedStar === 0) return

    if (!isLoggedIn) {
      onAuthRequired?.()
      return
    }

    try {
      setRatingLoading(true)
      setRatingError(null)

      if (existingRating !== null) {
        await updateRating(movie.id, pickedStar)
      } else {
        await createRating(movie.id, pickedStar)
      }

      setExistingRating(pickedStar)
      setIsEditing(false)
    } catch {
      setRatingError('Failed to save rating. Please try again.')
    } finally {
      setRatingLoading(false)
    }
  }, [movie?.id, pickedStar, existingRating, isLoggedIn, onAuthRequired])

  const handleDelete = useCallback(async () => {
    if (!movie?.id) return

    try {
      setRatingLoading(true)
      setRatingError(null)
      await deleteRating(movie.id)
      setExistingRating(null)
      setPickedStar(0)
      setIsEditing(false)
    } catch {
      setRatingError('Failed to remove rating. Please try again.')
    } finally {
      setRatingLoading(false)
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
                  <span className="modal-chip">Release: {details.release_date}</span>
                  <span className="modal-chip">Runtime: {details.runtime} min</span>
                  <span className="modal-chip">Score: {details.vote_average.toFixed(1)}</span>
                  <span className="modal-chip">Popularity: {Math.round(details.popularity)}</span>
                </div>

                <div className="modal-section">
                  <h3>Summary</h3>
                  <p>{details.overview || 'No summary available.'}</p>
                </div>

                <div className="modal-section">
                  <h3>Genres</h3>
                  <p>{details.genres.map((g) => g.name).join(' • ')}</p>
                </div>

                {/* ── RATING SECTION ── */}
                <div className="modal-section modal-rating">
                  <h3>Your Rating</h3>

                  {!isLoggedIn && (
                    <div className="rating-guest">
                      <p>Log in to rate this movie.</p>
                      <button
                        type="button"
                        className="rating-btn rating-btn--primary"
                        onClick={() => onAuthRequired?.()}
                      >
                        Login / Register
                      </button>
                    </div>
                  )}

                  {isLoggedIn && existingRating !== null && !isEditing && (
                    <div className="rating-display">
                      <div className="rating-display__stars">
                        {'★'.repeat(existingRating)}{'☆'.repeat(5 - existingRating)}
                      </div>
                      <span className="rating-display__value">{existingRating} / 5</span>
                      <div className="rating-display__actions">
                        <button
                          type="button"
                          className="rating-btn rating-btn--secondary"
                          onClick={() => { setPickedStar(existingRating); setIsEditing(true) }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rating-btn rating-btn--danger"
                          onClick={handleDelete}
                          disabled={ratingLoading}
                        >
                          {ratingLoading ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  )}

                  {isLoggedIn && (existingRating === null || isEditing) && (
                    <div className="rating-picker">
                      <StarRating value={pickedStar} onChange={setPickedStar} />
                      <div className="rating-picker__actions">
                        <button
                          type="button"
                          className="rating-btn rating-btn--primary"
                          onClick={handleSubmitRating}
                          disabled={pickedStar === 0 || ratingLoading}
                        >
                          {ratingLoading
                            ? 'Saving...'
                            : existingRating !== null ? 'Update rating' : 'Save rating'}
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            className="rating-btn rating-btn--secondary"
                            onClick={() => { setIsEditing(false); setPickedStar(existingRating ?? 0) }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {ratingError && <p className="rating-error">{ratingError}</p>}
                    </div>
                  )}
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
                          <span className="modal-cast-character">{actor.character}</span>
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