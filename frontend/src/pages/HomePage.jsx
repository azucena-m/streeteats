import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { trucksAPI } from '../services/api' 

export default function HomePage() {
    const [trucks, setTrucks]   = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState('')
    const [cuisine, setCuisine] = useState('')
    const [openOnly, setOpenOnly] = useState(false)
    const [cuisines, setCuisines] = useState([])

    const { setShowLogin } = useOutletContext()

    const loadTrucks = () => {
        const params = {}
        if (search)   params.search   = search
        if (cuisine)  params.cuisine  = cuisine
        if (openOnly) params.is_open  = true

        setLoading(true)
        trucksAPI.getAll(params)
            .then(res => setTrucks(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false))
    }

    // Load cuisines for the filter dropdown
    useEffect(() => {
        trucksAPI.getAll()
            .then(res => {
                const unique = [...new Set(res.data.map(t => t.cuisine))]
                setCuisines(unique)
            })
    }, [])

    // Reload trucks when filters change
    useEffect(() => {
        loadTrucks()
    }, [cuisine, openOnly])

    const handleSearch = (e) => {
        if (e.key === 'Enter') loadTrucks()
    }

    return (
        <div>
            {/* Hero */}
            <div style={{
                background: '#0f0e0d',
                color: 'white',
                padding: '3rem 1.5rem',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800',
                    lineHeight: 1.1,
                    marginBottom: '0.75rem'
                }}>
                    Discover <span style={{ color: '#f55d2c' }}>Food Trucks</span> Near You
                </h1>
                <p style={{ color: '#8a8378', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    REAL-TIME LOCATIONS · FRESH MENUS · LOCAL FAVORITES
                </p>
            </div>

            {/* Search + Filters */}
            <div style={{
                background: 'white',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e0d9ce',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <input 
                    placeholder='Search trucks... (press Enter)' 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{
                        flex: 1,
                        minWidth: '200px',
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
                    <option value=''>All Cuisines</option>
                    {cuisines.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                        type='checkbox'
                        checked={openOnly}
                        onChange={e => setOpenOnly(e.target.checked)}
                        style={{ accentColor: '#f55d2c' }}
                    />
                    Open Now
                </label>
                
                <button
                    onClick={() => { setSearch(''); setCuisine(''); setOpenOnly(false) }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#f55d2c',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Clear
                </button>
            </div>

            {/* Results */}
            <div style={{ padding: '1.5rem' }}>
                <p style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#8a8378',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '1rem'
                }}>
                    {loading ? 'Loading...' : `${trucks.length} truck${trucks.length !== 1 ? 's' : ''} found`}
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    {trucks.map(truck => (
                        <TruckCard key={truck.id} truck={truck} />
                    ))}
                </div>

                {!loading && trucks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8378' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
                        <p>No trucks match your filters.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function TruckCard({ truck }) {
    return (
        <div style={{
            background: 'white',
            border: '1.5px solid #e0d9ce',
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'transform 0.18s, box-shadow 0.18s',
            cursor: 'pointer'
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = ' 0 4px 16px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* Image */}
            <div style={{
                height: '160px',
                background: '#f2ede4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
            }}>
                🚚
            </div>

            {/* Body */}
            <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{truck.name}</h3>
                    <span style={{
                        background: '#f2ede4',
                        border: '1px solid #e0d9ce',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: '#8a8378',
                        whiteSpace: 'nowrap',
                        marginLeft: '0.5rem'
                    }}>
                        {truck.cuisine}
                    </span>
                </div>

                {truck.description && (
                    <p style={{
                        fontSize: '0.8rem',
                        color: '#8a8378',
                        lineHeight: '1.4',
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {truck.description}
                    </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: truck.is_open ? '#1a9b5e' : '#8a8378',
                        flexShrink: 0
                    }}/>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: truck.is_open ? '#1a9b5e' : '#8a8378'
                    }}>
                        {truck.is_open ? 'Open' : 'Closed'}
                    </span>
                    {truck.opening_time && (
                        <span style={{ fontSize: '0.72rem', color: '#8a8378' }}>
                            · {truck.opening_time} – {truck.closing_time}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

