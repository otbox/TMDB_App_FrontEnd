import { useState } from 'react'
import api from '../../services/api'
import './style.css'

type AuthUser = {
  id: number
  username: string
}

type UserModalProps = {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: AuthUser, accessToken: string, refreshToken: string) => void
}

type Tab = 'login' | 'register'

export default function UserModal({ isOpen, onClose, onAuthSuccess }: UserModalProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const reset = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  const switchTab = (next: Tab) => {
    setTab(next)
    reset()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }

    if (tab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (tab === 'register') {
        await api.post('/users', { username: username.trim(), password })
      }

      const loginRes = await api.post<{
        access_token: string
        refresh_token: string
        user: AuthUser
      }>('/login', { username: username.trim(), password })

      onAuthSuccess(loginRes.data.user, loginRes.data.access_token, loginRes.data.refresh_token)
      reset()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data: { message: string } } }
        setError(axiosErr.response?.data?.message || 'Unexpected error')
      } else {
        setError('Unexpected error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-user-backdrop" onClick={onClose}>
      <div className="modal-user-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-user-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'active' : ''}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        <h2>{tab === 'login' ? 'Welcome back' : 'Create account'}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {tab === 'register' && (
            <div>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="modal-user-error">{error}</p>}

          <div className="modal-user-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading
                ? tab === 'login' ? 'Logging in...' : 'Creating...'
                : tab === 'login' ? 'Login' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
