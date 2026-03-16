import { useAuth } from '../context/AuthContext'

export default function Header({ onLoginClick, onRegisterClick }) {
    const { user, logout } = useAuth()

    return (
        <header style={{
            background: '#0f0e0d',
            color: 'white',
            padding: '0 1.5rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #f55d2c'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{ fontSize: '1.5rem' }}>🚚</span>
                <span style={{
                    fontFamily: 'sans-serif',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: 'white',
                    letterSpacing: '-0.02em'
                }}>
                    StreetEats</span>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {user? (
                    <>
                        <span style={{
                            background: '#f55d2c',
                            color: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            @{user.username}
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '1.5px solid rgba(255,255,255,0.25)',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Sign Out
                    </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={onLoginClick}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '1.5px solid rgba(255,255,255,0.25)',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onRegisterClick}
                            style={{
                                background: '#f55d2c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            Join Free
                        </button>
                    </>
                )}
            </nav>
        </header>
    )
}