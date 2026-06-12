'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Search, Loader2, MapPin, X } from 'lucide-react'

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

interface MapPickerProps {
  lat?: number
  lng?: number
  onLocationPick: (lat: number, lng: number, address: string) => void
}

const DARK_TILE  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const DARK_ATTR  = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
const LIGHT_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export function MapPicker({ lat, lng, onLocationPick }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const markerRef    = useRef<any>(null)
  const tileRef      = useRef<any>(null)
  const LRef         = useRef<any>(null)

  const { resolvedTheme } = useTheme()
  const [isLoaded,      setIsLoaded]      = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching,   setIsSearching]   = useState(false)
  const [pinInfo,       setPinInfo]       = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  )

  /* ── Initialise Leaflet (client-only) ──────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return
      LRef.current = L

      // Fix broken default icon paths in bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const isDark   = document.documentElement.classList.contains('dark')
      const map = L.map(containerRef.current!, {
        center: [lat ?? 27.7172, lng ?? 85.324],
        zoom:   lat ? 15 : 12,
      })

      tileRef.current = L.tileLayer(
        isDark ? DARK_TILE : LIGHT_TILE,
        { attribution: isDark ? DARK_ATTR : LIGHT_ATTR, maxZoom: 19 }
      ).addTo(map)

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map)
      }

      /* Click → drop pin + reverse geocode */
      map.on('click', async (e: any) => {
        const { lat: clat, lng: clng } = e.latlng
        setPinInfo({ lat: clat, lng: clng })

        if (markerRef.current) {
          markerRef.current.setLatLng([clat, clng])
        } else {
          markerRef.current = L.marker([clat, clng]).addTo(map)
        }

        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${clat}&lon=${clng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          onLocationPick(clat, clng, data.display_name ?? `${clat.toFixed(5)}, ${clng.toFixed(5)}`)
        } catch {
          onLocationPick(clat, clng, `${clat.toFixed(5)}, ${clng.toFixed(5)}`)
        }
      })

      mapRef.current = map
      setIsLoaded(true)

      // Force tile redraw after dialog animation settles (prevents blank map)
      setTimeout(() => { if (!cancelled) map.invalidateSize() }, 300)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = markerRef.current = tileRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Swap tiles on theme change ────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !tileRef.current || !LRef.current) return
    const L      = LRef.current
    const isDark = resolvedTheme === 'dark'
    tileRef.current.remove()
    tileRef.current = L.tileLayer(
      isDark ? DARK_TILE : LIGHT_TILE,
      { attribution: isDark ? DARK_ATTR : LIGHT_ATTR, maxZoom: 19 }
    ).addTo(mapRef.current)
  }, [resolvedTheme])

  /* ── Search (Nominatim) — plain function, no FormEvent ─────────────────── */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchResults([])
    try {
      const res     = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const results: SearchResult[] = await res.json()
      setSearchResults(results)
    } catch {}
    setIsSearching(false)
  }, [searchQuery])

  const selectResult = useCallback((r: SearchResult) => {
    if (!mapRef.current || !LRef.current) return
    const L    = LRef.current
    const rlat = parseFloat(r.lat)
    const rlng = parseFloat(r.lon)
    mapRef.current.flyTo([rlat, rlng], 16)
    setPinInfo({ lat: rlat, lng: rlng })
    if (markerRef.current) {
      markerRef.current.setLatLng([rlat, rlng])
    } else {
      markerRef.current = L.marker([rlat, rlng]).addTo(mapRef.current)
    }
    onLocationPick(rlat, rlng, r.display_name)
    setSearchResults([])
    setSearchQuery('')
  }, [onLocationPick])

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-2">

      {/* ── Search bar — NOTE: intentionally a <div>, NOT a <form>
           because this component is rendered inside the modal's <form>      */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault() // prevent outer form submit
                handleSearch()
              }
            }}
            placeholder="Search location (e.g. Thamel, Kathmandu)…"
            className="w-full pl-9 pr-8 py-2 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="size-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <button
          type="button"          /* IMPORTANT: not "submit" — avoids triggering the outer form */
          disabled={isSearching || !searchQuery.trim()}
          onClick={handleSearch}
          className="shrink-0 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSearching ? <Loader2 className="size-3.5 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Dropdown results */}
      {searchResults.length > 0 && (
        <div className="bg-card border border-border/70 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
          {searchResults.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-left px-3 py-2.5 text-xs hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0 flex items-start gap-2"
            >
              <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm">
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted/80 z-10 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading map…</span>
          </div>
        )}
        <div ref={containerRef} style={{ height: 260, width: '100%' }} />
      </div>

      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <MapPin className="size-3 text-primary" />
        {pinInfo
          ? `📍 Pinned at ${pinInfo.lat.toFixed(4)}, ${pinInfo.lng.toFixed(4)} — click map to reposition`
          : 'Click anywhere on the map to drop a pin, or search above'}
      </p>
    </div>
  )
}
