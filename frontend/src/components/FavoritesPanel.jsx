import { useState, useEffect } from 'react'
import { favoritesAPI } from '../services/api'

export default function FavoritesPanel({ onClose }) {
    const [favs, setFavs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        favoritesAPI.getAll()
            .then(res => setFavs(res.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 500
                }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0,
                width: '380px', height: '100vh',
                background: 'white', zIndex: 501,
                boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                animation: 'slideIn 0.25s ease'
            }}>
                {/* Header */}
                <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '1.25rem 1.5rem',
                background: '#0f0e0d', color: 'white'
                }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>My Favorites</h2>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none',
                    color: 'white', fontSize: '1.1rem', cursor: 'pointer'
                }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {loading && (
                    <p style={{ textAlign: 'center', color: '#8a8378', padding: '2rem' }}>Loading...</p>
                )}
                {!loading && favs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8a8378' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</p>
                    <p>No favorites yet.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Explore trucks and save your favorites!
                    </p>
                    </div>
                )}
                {favs.map(f => (
                    <div key={f.id} style={{
                    display: 'flex', gap: '0.75rem',
                    alignItems: 'center', background: '#f2ede4',
                    borderRadius: '8px', padding: '0.75rem',
                    marginBottom: '0.6rem'
                    }}>
                    <div style={{
                        width: '56px', height: '44px',
                        background: '#e0d9ce', borderRadius: '6px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.5rem',
                        flexShrink: 0
                    }}>
                        🚚
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        {f.truck.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#8a8378', marginTop: '0.15rem' }}>
                        {f.truck.cuisine} · {f.truck.is_open ? '🟢 Open' : '🔴 Closed'}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </>
    )
}