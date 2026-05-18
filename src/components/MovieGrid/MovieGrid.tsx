import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllGenresMovies, getAllMovies, searchMovies } from '../../services/tmdbService'
import type { Genre, Movie } from '../../types/Movie'
import MovieCard from './MovieCard/MovieCard'
import './style.css'
import { MovieModal } from './MovieModal/MovieModal'

export default function MovieGrid() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

    const [query, setQuery] = useState('')
    const [genres, setGenres] = useState<Genre[]>([])
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
    const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)

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


    const handleRate = (movie: Movie) => setSelectedMovie(movie) // call api 
 
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
                results = results.filter((movie) =>
                    movie.genre_ids?.includes(currentGenre.id)
                )
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
        setQuery('')
        setSelectedGenre(null)
        setIsGenreMenuOpen(false)
    }

    //  Infinite scroll observer 
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

    const handleOpenModal = (movie: Movie) => setSelectedMovie(movie)
    const handleCloseModal = () => setSelectedMovie(null)

    return (
        <div>
            <div className="header-grid">
<input
  type="search"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search movies..."
  className="search-input"
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
                                onClick={() => {
                                    setSelectedGenre(null)
                                    setIsGenreMenuOpen(false)
                                }}
                            >
                                All categories
                            </button>

                            {genres.map((genre) => (
                                <button
                                    key={genre.id}
                                    type="button"
                                    className="genre-item"
                                    onClick={() => {
                                        setSelectedGenre(genre)
                                        setIsGenreMenuOpen(false)
                                    }}
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
                            aria-label="Clear search and category filters"
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
                            <MovieCard onRate={handleRate} movie={movie} onSelect={handleOpenModal} />
                        </div>
                    )
                })}
            </div>

            {loading && <p>Loading more movies...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && movies.length === 0 && <p>No movies found.</p>}

            <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
        </div>
    )
}