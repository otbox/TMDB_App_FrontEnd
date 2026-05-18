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
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  // useState so header re-renders after login/logout
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const handleRatedClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!currentUser) {
      event.preventDefault()
      setPendingRoute('/rated')
      setIsUserModalOpen(true)
    }
    // if logged in, Link navigates normally — no need to call navigate()
  }

  const handleLoginClick = () => {
    setIsUserModalOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    navigate('/')
  }

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
    setIsUserModalOpen(false)

    if (pendingRoute) {
      navigate(pendingRoute)
      setPendingRoute(null)
    }
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
         <Outlet context={{ onAuthRequired: () => setIsUserModalOpen(true) }} />
      </main>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setPendingRoute(null)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}