import { useOutletContext } from 'react-router-dom'
import MovieGrid from '../components/MovieGrid/MovieGrid'

type LayoutContext = {
  onAuthRequired: () => void
}

export default function Home() {
  const { onAuthRequired } = useOutletContext<LayoutContext>()

  return (
    <div>
      <MovieGrid onAuthRequired={onAuthRequired} />
    </div>
  )
}