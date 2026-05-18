import { Link, Outlet } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'

export default function Layout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/rated">Rated Movies</Link>
        </nav>
        <SearchBar />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}