import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,14,13,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backdropFilter: 'blur(4px)'
  }
  
const modalStyle = {
    background: 'white',
    borderRadius: '14px',
    padding: '2rem',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 1001
}
  
const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1.5px solid #e0d9ce',
    borderRadius: '7px',
    fontSize: '0.9rem',
    outline: 'none',
    marginTop: '0.3rem',
    boxSizing: 'border-box'
}
  
const btnStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#f55d2c',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem'
}

export default function AuthModal({ mode, onClose, onSwitch}) {
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none',
                        fontSize: '1.1rem', cursor: 'pointer', color: '#8a8378'
                    }}
                >
                    x
                </button>

                {mode === 'login'
                    ? <LoginForm onClose={onClose} onSwitch={onSwitch} />
                    : <RegisterForm onClose={onClose} onSwitch={onSwitch} />
                }
            </div>
        </div>
    )
}

function LoginForm({ onClose, onSwitch }) {
    const { login }               = useAuth()
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)

    const handleSubmit = async () => {
        if (!email || !password) { setError('Please fill in all fields.'); return}
        setLoading(true)
        setError('')
        try {
            await login(email, password)
            onClose()
        } catch (e) {
            setError(e.response?.data?.detail || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Welcome Back
            </h2>
            <p style={{ color: '#8a8378', fontSize: '0.875', marginBottom: '1.25rem' }}>
                Sign in to save your favorite food trucks!
            </p>

            <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Email</label>
                <input 
                    style={{ ...inputStyle, zIndex: 1002, position: 'relative' }}
                    type='email'
                    placeholder='you@example.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Password</label>
                <input 
                    style={inputStyle}
                    type='password' 
                    placeholder='••••••••'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{error}</p>}

            <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8a8378', textAlign: 'center' }}>
                No account?{' '}
                <a onClick={onSwitch} style={{ color: '#f55d2c', cursor: 'pointer' }}>
                    Join Free
                </a>
            </p>
        </>
    )
}

function RegisterForm({ onClose, onSwitch}) {
    const { register }              = useAuth()
    const [username, setUsername]   = useState('')
    const [email, setEmail]         = useState('')
    const [password, setPassword]   = useState('')
    const [error, setError]         = useState('')
    const [loading, setLoading]     = useState(false)

    const handleSubmit = async () => {
        if (!username || !email || !password) { setError('Please fill in all fields.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        setError('')
        try {
            await register(email, username, password)
            onClose()
        } catch (e) {
            setError(e.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Join StreetEats
            </h2>
            <p style={{ color: '#8a8378', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Create an account to save favorites
            </p>

            <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Username</label>
                <input
                style={inputStyle}
                placeholder="foodie42"
                value={username}
                onChange={e => setUsername(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Email</label>
                <input 
                    style={inputStyle}
                    type='email'
                    placeholder='you@example.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Password</label>
                <input 
                    style={inputStyle}
                    type='password'
                    placeholder='At least 6 characters'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{error}</p>}

            <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#8a8378', textAlign: 'center' }}>
                Have an account?{' '}
                <a onClick={onSwitch} style={{ color: '#f55d2c', cursor: 'pointer' }}>
                Sign in →
                </a>
            </p>
        </>
    )
}