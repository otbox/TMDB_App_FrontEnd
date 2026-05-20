import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
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
  }

  const handleLoginClick = () => setIsUserModalOpen(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    navigate('/')
  }

  const handleAuthSuccess = (user: AuthUser, accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
    setIsUserModalOpen(false)
    if (pendingRoute) {
      navigate(pendingRoute)
      setPendingRoute(null)
    }
  }

  const isActive = (path: string) => location.pathname === path ? 'active' : ''

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__left">
          <nav className="layout__nav">
            <Link to="/" className={isActive('/')}>Movies</Link>
            <Link to="/rick-and-morty" className={isActive('/rick-and-morty')}>Rick &amp; Morty</Link>
            <Link to="/rated" onClick={handleRatedClick} className={isActive('/rated')}>Rated</Link>
          </nav>
        </div>

        <div className="layout__right">
          {currentUser ? (
            <div className="layout__auth">
              <span className="layout__username">{currentUser.username}</span>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button type="button" onClick={handleLoginClick}>Login</button>
          )}
        </div>
      </header>

      <main className="layout__main">
        <Outlet context={{
          onAuthRequired: () => setIsUserModalOpen(true),
          isLoggedIn: !!currentUser
        }} />
      </main>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => { setIsUserModalOpen(false); setPendingRoute(null) }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
