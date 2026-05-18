import './style.css'
import type { Movie } from '../../../types/Movie'
import StarRating from './StarRating/StarRating'


type MovieCardProps = {
  movie: Movie
  userRating?: number | null
  onSelect: (movie: Movie) => void
  onRate: (movieId: number, rating: number) => void
}

export default function MovieCard({
  movie,
  userRating,
  onSelect,
  onRate,
}: MovieCardProps) {
  const { id, title, poster_path, release_date, vote_average } = movie

  const year = release_date ? new Date(release_date).getFullYear() : 'N/A'
  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : 'https://placehold.co/500x750/141414/ffffff?text=No+Image'

  return (
    <div
      className="movie-card"
      onClick={() => onSelect(movie)}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(movie)
        }
      }}
    >
      <img
        className="movie-card__image"
        src={posterUrl}
        alt={title}
        loading="lazy"
        width={500}
        height={750}
      />

      <div className="movie-card__overlay">
        <div className="movie-card__content">
          <h3 className="movie-card__title">{title}</h3>

          <div className="movie-card__meta">
            <span className="movie-card__year">{year}</span>
            <span className="movie-card__rating">
              TMDB {vote_average ? vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>

          <div
            className="movie-card__user-rating"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="movie-card__user-rating-label">Your rating</span>

            <StarRating
              value={userRating ?? 0}
              onChange={(rating) => onRate(id, rating)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}