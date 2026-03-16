import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import AuthModal from './AuthModal'

export default function Layout() {
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />
            <main style={{ flex: 1 }}>
                <Outlet context={{ setShowLogin, setShowRegister }}/>
            </main>

            {showLogin && (
                <AuthModal
                    mode='login'
                    onClose={() => setShowLogin(false)}
                    onSwitch={() => { setShowLogin(false) ; setShowRegister(true) }}
                />
            )}
            {showRegister && (
                <AuthModal
                    mode='register'
                    onClose={() => setShowRegister(false)}
                    onSwitch={() => {setShowRegister(false); setShowLogin(true)}}
                />
            )}
        </div>
    )
}