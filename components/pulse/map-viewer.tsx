'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'

interface MapViewerProps {
  lat: number
  lng: number
  height?: number
  className?: string
}

const DARK_TILE  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const DARK_ATTR  = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
const LIGHT_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export function MapViewer({ lat, lng, height = 260, className = "" }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const tileRef      = useRef<any>(null)
  const LRef         = useRef<any>(null)

  const { resolvedTheme } = useTheme()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return
      LRef.current = L

      // Fix broken default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const isDark = document.documentElement.classList.contains('dark')
      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: false,
      })

      tileRef.current = L.tileLayer(
        isDark ? DARK_TILE : LIGHT_TILE,
        { attribution: isDark ? DARK_ATTR : LIGHT_ATTR, maxZoom: 19 }
      ).addTo(map)

      L.marker([lat, lng]).addTo(map)

      mapRef.current = map
      setIsLoaded(true)

      setTimeout(() => { if (!cancelled) map.invalidateSize() }, 300)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = tileRef.current = null
    }
  }, [lat, lng])

  useEffect(() => {
    if (!mapRef.current || !tileRef.current || !LRef.current) return
    const L = LRef.current
    const isDark = resolvedTheme === 'dark'
    tileRef.current.remove()
    tileRef.current = L.tileLayer(
      isDark ? DARK_TILE : LIGHT_TILE,
      { attribution: isDark ? DARK_ATTR : LIGHT_ATTR, maxZoom: 19 }
    ).addTo(mapRef.current)
  }, [resolvedTheme])

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border/60 shadow-sm ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/80 z-10 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading map…</span>
        </div>
      )}
      <div ref={containerRef} style={{ height, width: '100%' }} />
    </div>
  )
}
