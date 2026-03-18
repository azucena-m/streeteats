import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { favoritesAPI, trucksAPI } from '../services/api'
import MapView from '../components/MapView'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export default function HomePage() {
    const [trucks, setTrucks]     = useState([])
    const [loading, setLoading]   = useState(true)
    const [search, setSearch]     = useState('')
    const [cuisine, setCuisine]   = useState('')
    const [openOnly, setOpenOnly] = useState(false)
    const [cuisines, setCuisines] = useState([])
    const [selected, setSelected] = useState(null)
    const [favorites, setFavorites] = useState(new Set())

    const { setShowLogin, setShowRegister, showLogin, showRegister } = useOutletContext()
    const  { user } = useAuth()

    const loadTrucks = () => {
        const params = {}
        if (search)   params.search  = search
        if (cuisine)  params.cuisine = cuisine
        if (openOnly) params.is_open = true

        setLoading(true)
        trucksAPI.getAll(params)
        .then(res => setTrucks(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }

    useEffect(() => {
        trucksAPI.getAll()
        .then(res => {
            const unique = [...new Set(res.data.map(t => t.cuisine))]
            setCuisines(unique)
        })
    }, [])

    useEffect(() => {
        loadTrucks()
    }, [cuisine, openOnly])

    const handleSearch = (e) => {
        if (e.key === 'Enter') loadTrucks()
    }

    // Load favorites when user logs in
    useEffect(() => {
        if (!user) { setFavorites(new Set()); return }
            favoritesAPI.getAll()
            .then(res => {
            const ids = new Set(res.data.map(f => f.truck_id))
            setFavorites(ids)
            })
            .catch(() => {})
    }, [user])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 63px)' }}>

        {/* Hero */}
        <div style={{
            background: '#0f0e0d',
            color: 'white',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            flexShrink: 0
        }}>
            <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: '800',
            lineHeight: 1.1,
            marginBottom: '0.5rem'
            }}>
            Discover <span style={{ color: '#f55d2c' }}>Food Trucks</span> Near You
            </h1>
            <p style={{ color: '#8a8378', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            REAL-TIME LOCATIONS · FRESH MENUS · LOCAL FAVORITES
            </p>
        </div>

        {/* Search + Filters */}
        <div style={{
            background: 'white',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid #e0d9ce',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexShrink: 0
        }}>
            <input
            placeholder="Search trucks... (press Enter)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            style={{
                flex: 1, minWidth: '200px',
                padding: '0.6rem 0.9rem',
                border: '1.5px solid #e0d9ce',
                borderRadius: '6px',
                fontSize: '0.9rem',
                outline: 'none'
            }}
            />
            <select
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
            style={{
                padding: '0.6rem 0.9rem',
                border: '1.5px solid #e0d9ce',
                borderRadius: '6px',
                fontSize: '0.9rem',
                background: 'white',
                outline: 'none'
            }}
            >
            <option value="">All Cuisines</option>
            {cuisines.map(c => (
                <option key={c} value={c}>{c}</option>
            ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={openOnly}
                onChange={e => setOpenOnly(e.target.checked)}
                style={{ accentColor: '#f55d2c' }}
            />
            Open Now
            </label>
            <button
            onClick={() => { setSearch(''); setCuisine(''); setOpenOnly(false) }}
            style={{
                background: 'none', border: 'none',
                color: '#f55d2c', fontWeight: '700',
                cursor: 'pointer', fontSize: '0.875rem'
            }}
            >
            Clear
            </button>
        </div>

        {/* Main content - sidebar + map */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Sidebar */}
            <div style={{
            width: '360px',
            flexShrink: 0,
            background: '#f2ede4',
            borderRight: '1px solid #e0d9ce',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
            }}>
            <p style={{
                fontSize: '0.75rem', fontWeight: '700',
                color: '#8a8378', textTransform: 'uppercase',
                letterSpacing: '0.05em', padding: '0.75rem 1rem',
                borderBottom: '1px solid #e0d9ce'
            }}>
                {loading ? 'Loading...' : `${trucks.length} truck${trucks.length !== 1 ? 's' : ''} found`}
            </p>

            <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {trucks.map(truck => (
                <TruckCard
                    key={truck.id}
                    truck={truck}
                    isSelected={selected?.id === truck.id}
                    isFav={favorites.has(truck.id)}
                    onClick={() => {
                        console.log('selected truck:', truck)
                        setSelected(truck)
                    }}
                />
                ))}
                {!loading && trucks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8a8378' }}>
                    <p style={{ fontSize: '2rem' }}>🔍</p>
                    <p>No trucks match your filters.</p>
                </div>
                )}
            </div>
            </div>

            {/* Map */}
            <div style={{ flex: 1, position: 'relative' }}>
                {!showLogin && !showRegister && !selected && (
                    <MapView
                        trucks={trucks}
                        onTruckClick={truck => setSelected(truck)}
                    />
                )}
            </div>
        </div>

        {/* Truck detail panel */}
        {selected && (
            <TruckDetail
            truck={selected}
            onClose={() => setSelected(null)}
            onLoginRequired={() => setShowLogin(true)}
            onFavChange={(id, isFav) => {
                setFavorites(prev => {
                    const next = new Set(prev)
                    isFav ? next.add(id) : next.delete(id)
                    return next
                })
            }}
            />
        )}

        {/* Auth Modals */}
        {showLogin && (
            <AuthModal
            mode="login"
            onClose={() => setShowLogin(false)}
            onSwitch={() => { setShowLogin(false); setShowRegister(true) }}
            />
        )}
        {showRegister && (
            <AuthModal
            mode="register"
            onClose={() => setShowRegister(false)}
            onSwitch={() => { setShowRegister(false); setShowLogin(true) }}
            />
        )}
    </div>
  )
}

function TruckCard({ truck, isSelected, isFav, onClick }) {
  return (
    <div
        onClick={onClick}
        style={{
            background: 'white',
            border: `1.5px solid ${isSelected ? '#f55d2c' : '#e0d9ce'}`,
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            transition: 'border-color 0.15s',
            position: 'relative'
        }}
        >
        <div style={{
            width: '80px', minWidth: '80px',
            background: '#f2ede4',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.75rem'
        }}>
            🚚
        </div>
        <div style={{ padding: '0.65rem', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{truck.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                    {isFav && <span style={{ fontSize: '0.75rem' }}>❤️</span>}
                    <span style={{
                        fontSize: '0.68rem', background: '#f2ede4',
                        border: '1px solid #e0d9ce', padding: '0.1rem 0.4rem',
                        borderRadius: '999px', fontWeight: '600',
                        color: '#8a8378', whiteSpace: 'nowrap'
                    }}>
                        {truck.cuisine}
                    </span>
                </div>
            </div>
            {truck.description && (
            <p style={{
                fontSize: '0.75rem', color: '#8a8378',
                lineHeight: 1.4, margin: '0.2rem 0 0.4rem',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {truck.description}
            </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: truck.is_open ? '#1a9b5e' : '#8a8378'
            }} />
            <span style={{
                fontSize: '0.72rem', fontWeight: '700',
                color: truck.is_open ? '#1a9b5e' : '#8a8378'
            }}>
                {truck.is_open ? 'Open' : 'Closed'}
            </span>
            {truck.opening_time && (
                <span style={{ fontSize: '0.7rem', color: '#8a8378' }}>
                · {truck.opening_time}–{truck.closing_time}
                </span>
            )}
            </div>
        </div>
    </div>
  )
}

function TruckDetail({ truck, onClose, onLoginRequired, onFavChange }) {
    const { user } = useAuth()
    const [isFav, setIsFav] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Check if this truck is already favorited on open
    useEffect(() => {
        if (!user) return
        favoritesAPI.getAll()
            .then(res => {
                const favIds = res.data.map(f => f.truck_id)
                setIsFav(favIds.includes(truck.id))
            })
    }, [truck.id, user])

    const handleFav = async () => {
        if (!user) { onClose(); onLoginRequired(); return }
        setLoading(true)
        try {
            if (isFav) {
                await favoritesAPI.remove(truck.id)
                setIsFav(false)
                onFavChange(truck.id, false)
            } else {
                await favoritesAPI.add(truck.id)
                setIsFav(true)
                onFavChange(truck.id, true)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,14,13,0.6)',
            zIndex: 1000,        // add this line
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem', backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '2rem', width: '100%', maxWidth: '500px',
                position: 'relative'
            }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'none', border: 'none',
                    fontSize: '1.1rem', cursor: 'pointer', color: '#8a8378'
                }}>✕</button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                    {truck.name}
                </h2>
                <span style={{
                    display: 'inline-block', background: '#f55d2c',
                    color: 'white', fontSize: '0.75rem', fontWeight: '700',
                    padding: '0.2rem 0.6rem', borderRadius: '999px',
                    marginBottom: '0.75rem', textTransform: 'uppercase'
                    }}>
                    {truck.cuisine}
                </span>

                {truck.description && (
                    <p style={{ color: '#8a8378', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {truck.description}
                    </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                    <DetailItem label="Status" value={truck.is_open ? '🟢 Open Now' : '🔴 Closed'} />
                    {truck.opening_time && <DetailItem label="Hours" value={`${truck.opening_time} – ${truck.closing_time}`} />}
                    {truck.address && <DetailItem label="Location" value={truck.address} />}
                </div>

                <button
                    onClick={handleFav}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: isFav ? '#f2ede4' : '#f55d2c',
                        color: isFav ? '#0f0e0d' : 'white',
                        border: isFav ? '1.5px solid #e0d9ce' : 'none',
                        borderRadius: '7px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    {loading ? '...' : isFav ? '💔 Remove Favorite' : '❤️ Add to Favorites'}
                </button>

                {!user && (
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#8a8378', marginTop: '0.75rem' }}>
                        <a onClick={() => { onClose(); onLoginRequired() }} style={{ color: '#f55d2c', cursor: 'pointer' }}>
                            Sign in
                        </a>{' '}
                        to save your favorites
                    </p>
                )}
            </div>
        </div>
    )
}

function DetailItem({ label, value }) {
    return (
        <div style={{ background: '#f2ede4', borderRadius: '8px', padding: '0.65rem 0.9rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8378', marginBottom: '0.15rem' }}>
                {label}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{value}</div>
        </div>
    )
}

