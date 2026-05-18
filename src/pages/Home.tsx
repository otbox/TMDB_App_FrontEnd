import { useOutletContext } from 'react-router-dom'
import MovieGrid from '../components/MovieGrid/MovieGrid'

type LayoutContext = {
  onAuthRequired: () => void
  isLoggedIn: boolean
}

export default function Home() {
  const { onAuthRequired, isLoggedIn } = useOutletContext<LayoutContext>()

  return (
    <div>
      <MovieGrid onAuthRequired={onAuthRequired} isLoggedIn={isLoggedIn} />
    </div>
  )
}
