import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import { useAuth } from '../context/AuthContext'
import FavoritesPanel from './FavoritesPanel'

export default function Layout() {
    const { user } = useAuth()
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [showFavorites, setShowFavorites] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
                onFavoritesClick={() => setShowFavorites(true)}
            />
            <main style={{ flex: 1 }}>
                <Outlet context={{ setShowLogin, setShowRegister,showLogin, showRegister }}/>
            </main>

            {showFavorites && user && (
                <FavoritesPanel onClose={() => setShowFavorites(false)} />
            )}
        </div>
    )
}