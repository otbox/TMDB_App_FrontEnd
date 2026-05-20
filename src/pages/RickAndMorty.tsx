import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getEpisodes, type RMEpisode } from '../services/rickmortyService'
import EpisodeModal from '../components/EpisodeModal/EpisodeModal'
import './RickAndMorty.css'

type LayoutContext = {
  onAuthRequired: () => void
  isLoggedIn: boolean
}

export default function RickAndMorty() {
  const { onAuthRequired, isLoggedIn } = useOutletContext<LayoutContext>()

  const [episodes, setEpisodes] = useState<RMEpisode[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedEpisode, setSelectedEpisode] = useState<RMEpisode | null>(null)

  const loadingRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const loadEpisodes = useCallback(async (
    pageToLoad: number,
    search: string,
    replace: boolean
  ) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const data = await getEpisodes(pageToLoad, search)
      setEpisodes((prev) => {
        if (replace) return data.results
        const ids = new Set(prev.map((e) => e.id))
        return [...prev, ...data.results.filter((e) => !ids.has(e.id))]
      })
      setHasMore(data.info.next !== null)
      setPage(pageToLoad + 1)
    } catch {
      setError('No episodes found.')
      setHasMore(false)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setEpisodes([])
    setPage(1)
    setHasMore(true)
    loadEpisodes(1, query, true)
  }, [query])

  const lastRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingRef.current || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((p) => {
          loadEpisodes(p, query, false)
          return p
        })
      }
    })
    if (node) observerRef.current.observe(node)
  }, [hasMore, query, loadEpisodes])

  return (
    <div className="rm-page">
      <div className="rm-header">
        <h1 className="rm-title">Rick <span>&</span> Morty</h1>
        <input
          type="search"
          className="rm-search"
          placeholder="Search episodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search episodes"
        />
      </div>

      <div className="rm-grid">
        {episodes.map((ep, index) => {
          const isLast = index === episodes.length - 1
          const [season] = ep.episode.split('E')
          return (
            <div
              key={ep.id}
              ref={isLast ? lastRef : undefined}
              className="rm-card"
              onClick={() => setSelectedEpisode(ep)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedEpisode(ep)
              }}
            >
              <div className="rm-card__badge">{ep.episode}</div>
              <div className="rm-card__body">
                <h3 className="rm-card__name">{ep.name}</h3>
                <span className="rm-card__season">{season.replace('S', 'Season ')}</span>
                <span className="rm-card__date">{ep.air_date}</span>
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="rm-status"><span>Loading...</span></div>
      )}
      {error && (
        <div className="rm-status rm-status--error"><span>{error}</span></div>
      )}
      {!loading && !error && episodes.length === 0 && (
        <div className="rm-status"><span>No episodes found.</span></div>
      )}

      <EpisodeModal
        episode={selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
        isLoggedIn={isLoggedIn}
        onAuthRequired={onAuthRequired}
      />
    </div>
  )
}
