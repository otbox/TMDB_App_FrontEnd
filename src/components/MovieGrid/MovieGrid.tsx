import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllGenresMovies, getAllMovies, searchMovies } from '../../services/tmdbService'
import { getRatings, createRating, updateRating } from '../../services/ratingsService'
import type { Genre, Movie } from '../../types/Movie'
import type { Rating } from '../../services/ratingsService'
import MovieCard from './MovieCard/MovieCard'
import './style.css'
import { MovieModal } from './MovieModal/MovieModal'

type MovieGridProps = {
  onAuthRequired: () => void
  isLoggedIn: boolean
}

export default function MovieGrid({ onAuthRequired, isLoggedIn }: MovieGridProps) {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)

  const [userRatings, setUserRatings] = useState<Record<number, number>>({})

  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await getAllGenresMovies()
        setGenres(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadGenres()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    async function loadRatings() {
      try {
        const data: Rating[] = await getRatings()
        const map: Record<number, number> = {}
        data.forEach((r) => { map[r.movie_id] = r.rating })
        setUserRatings(map)
      } catch { /* not logged in */ }
    }
    loadRatings()
  }, [isLoggedIn])

  async function handleRate(movieId: number, value: number, alreadyRated: boolean) {
    if (!isLoggedIn) { onAuthRequired(); return }
    try {
      if (alreadyRated) {
        await updateRating(movieId, value)
      } else {
        await createRating(movieId, value)
      }
      setUserRatings((prev) => ({ ...prev, [movieId]: value }))
    } catch (err) {
      console.error('Failed to save rating', err)
    }
  }

  const loadMovies = useCallback(async (
    pageToLoad: number,
    currentQuery: string,
    currentGenre: Genre | null,
    replace: boolean
  ) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const data = currentQuery.trim()
        ? await searchMovies(currentQuery, pageToLoad)
        : await getAllMovies(pageToLoad, currentGenre?.id)

      let results: Movie[] = data.results

      if (currentQuery.trim() && currentGenre) {
        results = results.filter((m) => m.genre_ids?.includes(currentGenre.id))
      }

      setMovies((prev) => {
        if (replace) return results
        const existingIds = new Set(prev.map((m) => m.id))
        return [...prev, ...results.filter((m) => !existingIds.has(m.id))]
      })

      setHasMore(data.page < data.total_pages)
      setPage(data.page + 1)
    } catch {
      setError('Failed to load movies')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMovies([])
    setPage(1)
    setHasMore(true)
    loadMovies(1, query, selectedGenre, true)
  }, [query, selectedGenre])

  const handleClearFilters = () => {
    setSelectedGenre(null)
    setIsGenreMenuOpen(false)
  }

  const lastMovieElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingRef.current || !hasMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((currentPage) => {
          loadMovies(currentPage, query, selectedGenre, false)
          return currentPage
        })
      }
    })

    if (node) observer.current.observe(node)
  }, [hasMore, query, selectedGenre, loadMovies])

  return (
    <div>
      <div className="header-grid">
        <input
          type="search"
          className="search-input"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search movies"
        />

        <div className="genre-dropdown">
          <button
            type="button"
            className="genre-button"
            onClick={() => setIsGenreMenuOpen((prev) => !prev)}
          >
            {selectedGenre ? selectedGenre.name : 'Categories'}
          </button>

          {isGenreMenuOpen && (
            <div className="genre-menu">
              <button
                type="button"
                className="genre-item"
                onClick={() => { setSelectedGenre(null); setIsGenreMenuOpen(false) }}
              >
                All categories
              </button>

              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className="genre-item"
                  onClick={() => { setSelectedGenre(genre); setIsGenreMenuOpen(false) }}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}

          {(query || selectedGenre) && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClearFilters}
              aria-label="Clear filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="movie-grid">
        {movies.map((movie, index) => {
          const isLast = index === movies.length - 1
          return (
            <div key={movie.id} ref={isLast ? lastMovieElementRef : undefined}>
              <MovieCard
                movie={movie}
                userRating={userRatings[movie.id] ?? null}
                onSelect={setSelectedMovie}
                onRate={handleRate}
              />
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="grid-status">
          <span className="grid-status__text">Loading...</span>
        </div>
      )}
      {error && (
        <div className="grid-status grid-status--error">
          <span className="grid-status__text">{error}</span>
        </div>
      )}
      {!loading && !error && movies.length === 0 && (
        <div className="grid-status">
          <span className="grid-status__text">No movies found.</span>
        </div>
      )}

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onAuthRequired={onAuthRequired}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
