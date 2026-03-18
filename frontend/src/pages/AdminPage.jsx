import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { trucksAPI } from '../services/api'
import { data } from 'react-router-dom'

const EMPTY_FORM = {
    name: '', cuisine: '', description: '',
    latitude: '', longitude: '', address: '',
    phone: '', instagram: '', image_url: '',
    opening_time: '', closing_time: '',
    days_open: '', is_open: true
}

export default function AdminPage() {
    const { user, login }         = useAuth()
    const [trucks, setTrucks]     = useState([])
    const [search, setSearch]     = useState('')
    const [form, setForm]         = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [loginForm, setLoginForm] = useState({ email: '', password: '', error: '' })

    const load = () => {
        trucksAPI.getAll()
            .then(r => 
                setTrucks(r.data))
            .catch(() => {})
    }

    useEffect(() => {
        if (user?.is_admin) load()
    }, [user])

    // Show login gate if not admin
    if (!user || !user.is_admin) {
        return <AdminLoginGate loginForm={loginForm} setLoginForm={setLoginForm} onLogin={login} />
    }

    const filtered = trucks.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.cuisine.toLowerCase().includes(search.toLowerCase())
    )

    const handleSave = async () => {
        if (!form.data.name || !form.data.cuisine || !form.data.latitude || !form.data.longitude) {
            alert('Name, cuisine, latitude, and longitude are required.')
            return
        }
        const payload = {
            ...form.data,
            latitude: parseFloat(form.data.latitude),
            longitude: parseFloat(form.data.longitude),
            description:   form.data.description   || null,
            address:       form.data.address       || null,
            phone:         form.data.phone         || null,
            instagram:     form.data.instagram     || null,
            image_url:     form.data.image_url     || null,
            opening_time:  form.data.opening_time  || null,
            closing_time:  form.data.closing_time  || null,
            days_open:     form.data.days_open     || null,
          }
      
        try {
            if (form.mode === 'add') {
                await trucksAPI.create(payload)
            } else {
                await trucksAPI.update(form.id, payload)
            }
            setForm(null)
            load()
        } catch (e) {
            alert(e.response?.data?.detail || 'Something went wrong')
        }
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label='Total Trucks' value={trucks.length} />
                <StatCard label='Open Now' value={trucks.filter(t => t.is_open).length} />
                <StatCard label='Cuisines' value={new Set(trucks.map(t => t.cuisine)).size} />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <input 
                    placeholder='Search trucks...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, maxWidth: '320px',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e0d9ce',
                        borderRadius: '6px', fontSize: '0.9rem', outline: 'none'
                    }}
                />
                <button
                    onClick={() => setForm({ mode: 'add', data: { ...EMPTY_FORM } })}
                    style={{
                      background: '#f55d2c', color: 'white',
                      border: 'none', borderRadius: '6px',
                      padding: '0.6rem 1.25rem',
                      fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                    }}>
                    + Add Truck
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', border: '1px solid #e0d9ce', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Name', 'Cuisine', 'Status', 'Hours', 'Location', 'Actions'].map(h => (
                                <th key={h} style={{
                                    background: '#0f0e0d', color: 'white',
                                    padding: '0.8rem 1rem', textAlign: 'left',
                                    fontSize: '0.78rem', fontWeight: '700',
                                    letterSpacing: '0.04em', textTransform: 'uppercase'
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8a8378' }}>
                                    No trucks found.
                                </td>
                            </tr>
                        )}
                        {filtered.map(truck => (
                            <tr key={truck.id} style={{ borderBottom: '1px solid #e0d9ce' }}>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{truck.name}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>{truck.cuisine}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.72rem', fontWeight: '700',
                                        background: truck.is_open ? '#dcfce7' : '#fee2e2',
                                        color: truck.is_open ? '#15803d' : '#dc2626'
                                    }}>
                                        {truck.is_open ? 'Open' : 'Closed'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                                    {truck.opening_time ? `${truck.opening_time}-${truck.closing_time}` : '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#8a8378' }}>
                                    {truck.address || `${truck.latitude}, ${truck.longitude}`}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setForm({
                                                mode: 'edit', id: truck.id,
                                                data: { ...EMPTY_FORM, ...truck,
                                                  latitude: String(truck.latitude),
                                                  longitude: String(truck.longitude)
                                                }
                                              })}
                                              style={{
                                                background: '#0f0e0d', color: 'white',
                                                border: 'none', borderRadius: '5px',
                                                padding: '0.3rem 0.65rem',
                                                fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
                                              }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(truck)}
                                            style={{
                                              background: '#fee2e2', color: '#dc2626',
                                              border: 'none', borderRadius: '5px',
                                              padding: '0.3rem 0.65rem',
                                              fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {form && (
                <FormModal 
                    form={form}
                    onChange={(k, v) => setForm(f => ({ ...f, data: { ...f.data, [k]: v} }))}
                    onSave={handleSave}
                    onClose={() => setForm(null)}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmModal 
                    message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

function StatCard({ label, value, green }) {
    return (
        <div style={{
            background: 'white', border: '1px solid #e0d9ce',
            borderRadius: '10px', padding: '1.25rem 1.5rem', flex: 1
        }}>
            <div style={{
                fontFamily: 'sans-serif', fontSize: '2rem',
                fontWeight: '800', lineHeight: 1,
                marginBottom: '0.25rem',
                color: green ? '#1a9b5e' : '#0f0e0d'
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '0.75rem', textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#8a8378', fontWeight: '600'
            }}>
                {label}
            </div>
      </div>
    )
}

function AdminLoginGate({ loginForm, setLoginForm, onLogin }) {
    const upd = (k, v) => setLoginForm(f => ({ ...f, [k]: v, error: '' }))
    const submit = async () => {
        try {
            const user = await onLogin(loginForm.email, loginForm.password)
            if (!user.is_admin) {
                setLoginForm(f => ({ ...f, error: 'This account does not have admin access.'}))
            }
        } catch (e) {
            setLoginForm(f => ({ ...f, error: e.response?.data?.detail || 'Invalid credentials'}))
        }
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 63px)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '2rem'
        }}>
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '2.5rem', width: '100%', maxWidth: '420px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                    Admin Access
                </h2>
                <p style={{ color: '#8a8378', marginBottom: '1.25rem', fontSize: '0.9rem' }}> 
                    Sign in with your admin credentials
                </p>
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                        Email
                    </label>
                    <input style={{
                        width: '100%', padding: '0.65rem 0.9rem',
                        border: '1.5px solid #e0d9ce', borderRadius: '7px',
                        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                    }}
                        type='email'
                        placeholder='admin@streeteats.com'
                        value={loginForm.email}
                        onChange={e => upd('email', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                    />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                        Password
                    </label>
                    <input style={{
                        width: '100%', padding: '0.65rem 0.9rem',
                        border: '1.5px solid #e0d9ce', borderRadius: '7px',
                        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                    }}
                        type='password'
                        placeholder='••••••••'
                        value={loginForm.password}
                        onChange={e => upd('password', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                    />
                </div>
                {loginForm.error && (
                    <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                        {loginForm.error}
                    </p>
                )}
                <button
                    onClick={submit}
                    style={{
                        width: '100%', padding: '0.75rem',
                        background: '#f55d2c', color: 'white',
                        border: 'none', borderRadius: '7px',
                        fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Sign In
                </button>
            </div>
        </div>
    )
}

function Field({ label, k, d, onChange, type = 'text', placeholder = '' }) {
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={d[k] ?? ''}
                onChange={e => onChange(k, e.target.value)}
                style={{
                    width: '100%', padding: '0.6rem 0.9rem',
                    border: '1.5px solid #e0d9ce', borderRadius: '7px',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                }}
            />
        </div>
    )
}

function FormModal({ form, onChange, onSave, onClose }) {
    const d = form.data 

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,14,13,0.6)',
            zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem', backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '2rem', width: '100%', maxWidth: '660px',
                position: 'relative', maxHeight: '90vh', overflowY: 'auto'
            }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'none', border: 'none',
                    fontSize: '1.1rem', cursor: 'pointer', color: '#8a8378'
                }}>x</button>

                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem' }}>
                    {form.mode === 'add' ? 'Add New Truck' : 'Edit Truck'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                    <Field label="Name *"      k="name"     d={d} onChange={onChange} placeholder="Smoky Joe's BBQ" />
                    <Field label="Cuisine *"   k="cuisine"  d={d} onChange={onChange} placeholder="BBQ" />
                    <div style={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                            Description
                        </label>
                        <textarea 
                            rows={3}
                            value={d.description ?? ''}
                            onChange={e => onChange('description', e.target.value)}
                            style={{
                                width: '100%', padding: '0.6rem 0.9rem',
                                border: '1.5px solid #e0d9ce', borderRadius: '7px',
                                fontSize: '0.9rem', outline: 'none',
                                resize: 'vertical', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <Field label="Latitude *"  k="latitude"  d={d} onChange={onChange} type="number"  placeholder="29.7604" />
                    <Field label="Longitude *" k="longitude" d={d} onChange={onChange} type="number" placeholder="-95.3698" />
                    <div style={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                            Address & Coordinate Lookup *
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                value={d.address ?? ''}
                                onChange={e => onChange('address', e.target.value)}
                                placeholder='Type an addressand click lookup'
                                style={{
                                    flex: 1, padding: '0.6rem 0.9rem',
                                    border: '1.5px solid #e0d9ce', borderRadius: '7px',
                                    fontSize: '0.9rem', outline: 'none'
                            
                                }} 
                            />
                            <button
                                onClick={async () => {
                                    const address = d.address
                                    console.log('looking up:', address)
                                    if (!address) return
                                    try {
                                        const res = await fetch(
                                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
                                        )
                                        const data = await res.json()
                                        if (data.length > 0) {
                                            onChange('latitude', data[0].lat)
                                            onChange('longitude', data[0].lon)
                                            onChange('address', address)
                                            alert(`Found: ${data[0].display_name}`)
                                        } else {
                                            alert('Address not found. Try being more specific.')
                                        }
                                    } catch {
                                        alert('Lookup failed. Try again.')
                                    }
                                }}
                                style={{
                                    background: '#0f0e0d', color: 'white',
                                    border: 'none', borderRadius: '7px',
                                    padding: '0.6rem 1rem', fontWeight: '600',
                                    fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                Lookup
                            </button>   
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#8a8378', marginTop: '0.4rem' }}>
                                💡 Or right-click on{' '}
                            <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                                style={{ color: '#f55d2c' }}>
                                Google Maps
                            </a>
                                {' '}to copy coordinates manually.
                        </p>

                    </div>
                    <Field label="Phone"       k="phone"     d={d} onChange={onChange}   placeholder="555-0100" />
                    <Field label="Instagram"   k="instagram"  d={d} onChange={onChange} placeholder="@handle" />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Image URL" k="image_url"  d={d} onChange={onChange} placeholder="https://..." />
                    </div>
                    <Field label="Opening Time" k="opening_time"  d={d} onChange={onChange} type="time" />
                    <Field label="Closing Time" k="closing_time"  d={d} onChange={onChange} type="time" />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Days Open" k="days_open"  d={d} onChange={onChange} placeholder="Mon,Tue,Wed,Thu,Fri" />
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginBottom: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input 
                                type='checkbox'
                                checked={d.is_open}
                                onChange={e => onChange('is_open', e.target.checked)}
                                style={{ accentColor: '#f55d2c', width: '15px', height: '15px' }}
                            />
                            Currently Open
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button onClick={onClose} style={{
                        background: '#f2ede4', color: '#0f0e0d',
                        border: '1.5px solid #e0d9ce', borderRadius: '7px',
                        padding: '0.65rem 1.5rem', fontWeight: '600',
                        fontSize: '0.9rem', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    <button onClick={onSave} style={{
                        background: '#f55d2c', color: 'white',
                        border: 'none', borderRadius: '7px',
                        padding: '0.65rem 1.5rem', fontWeight: '600',
                        fontSize: '0.9rem', cursor: 'pointer'
                    }}>
                        Save Truck
                    </button>
                </div>
            </div>
        </div>
    )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return(
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,14,13,0.6)',
            zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem', backdropFilter: 'blur(4px)'
        }}
            onClick={onCancel}
        >
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '2rem', width: '100%', maxWidth: '380px',
                textAlign: 'center'
            }}
                onClick={e => e.stopPropagation()}
            >
                <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>{message}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{
                        background: '#f2ede4', color: '#0f0e0d',
                        border: '1.5px solid #e0d9ce', borderRadius: '7px',
                        padding: '0.65rem 1.5rem', fontWeight: '600', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{
                        background: '#dc2626', color: 'white',
                        border: 'none', borderRadius: '7px',
                        padding: '0.65rem 1.5rem', fontWeight: '600', cursor: 'pointer'

                    }}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}