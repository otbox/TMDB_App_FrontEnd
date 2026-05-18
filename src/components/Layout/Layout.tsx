import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import SearchBar from '../SearchBar/SearchBar'
import UserModal from '../UserModal/UserModal'
import './style.css'

type AuthUser = {
  id: number
  username: string
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

  const storedUser = localStorage.getItem('user')
  const currentUser: AuthUser | null = storedUser ? JSON.parse(storedUser) : null

  const handleRatedClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!currentUser) {
      event.preventDefault()
      setIsUserModalOpen(true)
      return
    }

    navigate('/rated')
  }

  const handleLoginClick = () => {
    setIsUserModalOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__left">
          <nav className="layout__nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>

            <Link
              to="/rated"
              onClick={handleRatedClick}
              className={location.pathname === '/rated' ? 'active' : ''}
            >
              Rated Movies
            </Link>
          </nav>
        </div>

        <div className="layout__center">
          <SearchBar />
        </div>

        <div className="layout__right">
          {currentUser ? (
            <div className="layout__auth">
              <span className="layout__username">{currentUser.username}</span>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </header>

      <main className="layout__main">
        <Outlet />
      </main>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserCreated={(user) => {
          localStorage.setItem('user', JSON.stringify(user))
          setIsUserModalOpen(false)
        }}
      />
    </div>
  )
}