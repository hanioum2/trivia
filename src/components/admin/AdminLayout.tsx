import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../../services/authService'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()

  useEffect(() => {
    // Enable scrolling for admin pages
    document.body.classList.add('admin-mode')
    return () => {
      document.body.classList.remove('admin-mode')
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <div className="admin-nav-content">
          <h1 className="admin-nav-title">Quiz Admin</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}

