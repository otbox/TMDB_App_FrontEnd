import { useEffect, useState, useCallback } from 'react'
import type { RMEpisode, RMCharacter } from '../../services/rickmortyService'
import { getCharactersByUrls } from '../../services/rickmortyService'
import {
  getEpisodeRating,
  createEpisodeRating,
  updateEpisodeRating,
  deleteEpisodeRating,
} from '../../services/episodeRatingsService'
import StarRating from '../MovieGrid/MovieCard/StarRating/StarRating'
import './EpisodeModal.css'

type EpisodeModalProps = {
  episode: RMEpisode | null
  onClose: () => void
  isLoggedIn?: boolean
  onAuthRequired?: () => void
}

export default function EpisodeModal({
  episode,
  onClose,
  isLoggedIn = false,
  onAuthRequired,
}: EpisodeModalProps) {
  const [characters, setCharacters] = useState<RMCharacter[]>([])
  const [charsLoading, setCharsLoading] = useState(false)

  const [existingRating, setExistingRating] = useState<number | null>(null)
  const [pickedStar, setPickedStar] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load cast (first 8 characters)
  useEffect(() => {
    if (!episode) return
    let ignore = false
    setCharsLoading(true)
    getCharactersByUrls(episode.characters.slice(0, 8)).then((data) => {
      if (!ignore) setCharacters(data)
    }).finally(() => {
      if (!ignore) setCharsLoading(false)
    })
    return () => { ignore = true }
  }, [episode?.id])

  // Load existing rating
  useEffect(() => {
    if (!episode || !isLoggedIn) {
      setExistingRating(null)
      setPickedStar(0)
      setIsEditing(false)
      return
    }
    let ignore = false
    getEpisodeRating(episode.id).then((r) => {
      if (!ignore) {
        setExistingRating(r.rating)
        setPickedStar(r.rating)
      }
    }).catch(() => {
      if (!ignore) {
        setExistingRating(null)
        setPickedStar(0)
      }
    })
    return () => { ignore = true }
  }, [episode?.id, isLoggedIn])

  const handleSubmit = useCallback(async () => {
    if (!episode || pickedStar === 0) return
    if (!isLoggedIn) { onAuthRequired?.(); return }
    try {
      setRatingLoading(true)
      setRatingError(null)
      if (existingRating !== null) {
        await updateEpisodeRating(episode.id, pickedStar)
      } else {
        await createEpisodeRating(episode.id, pickedStar)
      }
      setExistingRating(pickedStar)
      setIsEditing(false)
    } catch {
      setRatingError('Failed to save rating. Please try again.')
    } finally {
      setRatingLoading(false)
    }
  }, [episode, pickedStar, existingRating, isLoggedIn, onAuthRequired])

  const handleDelete = useCallback(async () => {
    if (!episode) return
    try {
      setRatingLoading(true)
      setRatingError(null)
      await deleteEpisodeRating(episode.id)
      setExistingRating(null)
      setPickedStar(0)
      setIsEditing(false)
    } catch {
      setRatingError('Failed to remove rating.')
    } finally {
      setRatingLoading(false)
    }
  }, [episode])

  if (!episode) return null

  const [season, epNum] = episode.episode.split('E')
  const seasonLabel = `${season.replace('S', 'Season ')} • Episode ${epNum}`

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div
        className="ep-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ep-modal-title"
      >
        <button type="button" className="ep-close" onClick={onClose} aria-label="Close">×</button>

        <div className="ep-header">
          <span className="ep-badge">{episode.episode}</span>
          <h2 id="ep-modal-title" className="ep-title">{episode.name}</h2>
          <p className="ep-meta">{seasonLabel} &bull; {episode.air_date}</p>
        </div>

        {/* Rating */}
        <div className="ep-section">
          <h3>Your Rating</h3>

          {!isLoggedIn && (
            <div className="ep-rating-guest">
              <p>Log in to rate this episode.</p>
              <button
                type="button"
                className="ep-btn ep-btn--primary"
                onClick={() => onAuthRequired?.()}
              >
                Login / Register
              </button>
            </div>
          )}

          {isLoggedIn && existingRating !== null && !isEditing && (
            <div className="ep-rating-display">
              <StarRating value={existingRating} readonly size="md" />
              <span className="ep-rating-value">{existingRating} / 5</span>
              <div className="ep-rating-actions">
                <button type="button" className="ep-btn ep-btn--secondary"
                  onClick={() => { setPickedStar(existingRating); setIsEditing(true) }}>
                  Edit
                </button>
                <button type="button" className="ep-btn ep-btn--danger"
                  onClick={handleDelete} disabled={ratingLoading}>
                  {ratingLoading ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          )}

          {isLoggedIn && (existingRating === null || isEditing) && (
            <div className="ep-rating-picker">
              <StarRating value={pickedStar} onChange={setPickedStar} size="md" />
              <div className="ep-rating-actions">
                <button
                  type="button"
                  className="ep-btn ep-btn--primary"
                  onClick={handleSubmit}
                  disabled={pickedStar === 0 || ratingLoading}
                >
                  {ratingLoading ? 'Saving...' : existingRating !== null ? 'Update' : 'Save rating'}
                </button>
                {isEditing && (
                  <button type="button" className="ep-btn ep-btn--secondary"
                    onClick={() => { setIsEditing(false); setPickedStar(existingRating ?? 0) }}>
                    Cancel
                  </button>
                )}
              </div>
              {ratingError && <p className="ep-rating-error">{ratingError}</p>}
            </div>
          )}
        </div>

        {/* Cast */}
        <div className="ep-section">
          <h3>Characters</h3>
          {charsLoading && <p className="ep-chars-loading">Loading characters...</p>}
          {!charsLoading && characters.length > 0 && (
            <div className="ep-cast">
              {characters.map((c) => (
                <div key={c.id} className="ep-cast-card">
                  <img src={c.image} alt={c.name} className="ep-cast-img" loading="lazy" />
                  <span className="ep-cast-name">{c.name}</span>
                  <span className={`ep-cast-status ep-cast-status--${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
