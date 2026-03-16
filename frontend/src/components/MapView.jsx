import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix Leaflet's default marker icon brken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeTruckIcon(isOpen) {
    return L.divIcon({
        className: '',
        html: `<div style="
        width: 22px;
        height: 22px;
        background: ${isOpen ? '#f55d2c' : '#8a8378'};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -24],
    })
}

export default function MapView({ trucks, onTruckClick, disabled }) {
    const mapRef       = useRef(null)
    const mapInstance  = useRef(null)
    const markersRef   = useRef([])

    useEffect(() => {
        if (!mapInstance.current) return
        if (disabled) {
            mapInstance.current.dragging.disable()
            mapInstance.current.scrollWheelZoom.disable()
            mapInstance.current._container.style.pointerEvents = 'none'
        } else {
            mapInstance.current.dragging.enable()
            mapInstance.current.scrollWheelZoom.enable()
            mapInstance.current._container.style.pointerEvents = 'auto'
        }
    }, [disabled])


    // Initialize map once
    useEffect(() => {
        if (mapInstance.current) return
    
        mapInstance.current = L.map(mapRef.current).setView([29.7604, -95.3698], 13)
    
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          maxZoom: 19,
        }).addTo(mapInstance.current)
    }, [])

    // Update markers when trucks change
    useEffect(() => {
        if (!mapInstance.current) return

        // Remove old markers
        markersRef.current.forEach(m => m.remove())
        markersRef.current = []

        // Add new markers
        trucks.forEach(truck => {
            const marker = L.marker([truck.latitude, truck.longitude], {
                icon: makeTruckIcon(truck.is_open)
            })

            marker.bindPopup(`
                <div style="font-family: sans-serif">
                    <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem">
                        ${truck.name}
                    </div>
                    <div style="font-size: 0.82rem; color: #8a8378; margin-bottom: 0.5rem">
                        ${truck.cuisine} · ${truck.is_open ? '🟢 Open' : '🔴 Closed'}
                    </div>
                    <button
                        onclick="window.selectTruck(${truck.id})"
                        style="
                        background: #f55d2c;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        padding: 0.3rem 0.75rem;
                        font-size: 0.8rem;
                        font-weight: 600;
                        cursor: pointer;
                        "
                    >
                        View Details
                    </button>
                </div>
            `)

            marker.addTo(mapInstance.current)
            markersRef.current.push(marker)
        })
    }, [trucks])

    // Expose selectTruck globally so popup button can call it
    useEffect(() => {
        window.selectTruck = (id) => {
            const truck = trucks.find(t => t.id === id)
            if (truck && onTruckClick) onTruckClick(truck)
        }
        return() => delete window.selectTruck
    }, [trucks, onTruckClick])

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
        />
    )
}