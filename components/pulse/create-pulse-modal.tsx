'use client'

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Image as ImageIcon, Video, AlertTriangle, X, Map } from 'lucide-react'
import { PulseCategory, PriorityLevel } from '@/lib/pulse-data'
import { MapPicker } from './map-picker'

interface CreatePulseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreatePulseModal({ isOpen, onClose, onSubmit }: CreatePulseModalProps) {
  const [title,         setTitle]         = useState('')
  const [description,   setDescription]   = useState('')
  const [category,      setCategory]      = useState<PulseCategory>('Infrastructure')
  const [otherCategory, setOtherCategory] = useState('')
  const [location,      setLocation]      = useState('')
  const [priority,      setPriority]      = useState<PriorityLevel>('Medium')
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [showMap,       setShowMap]       = useState(false)

  // Media state
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<{ url: string; name: string }[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Map state
  const [mapLat, setMapLat] = useState<number | undefined>()
  const [mapLng, setMapLng] = useState<number | undefined>()

  /* ── Image upload ──────────────────────────────────────────────────────── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setImages((p) => [...p, ev.target!.result as string])
      reader.readAsDataURL(file)
    })
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const removeImage = (i: number) => setImages((p) => p.filter((_, idx) => idx !== i))

  /* ── Video upload ──────────────────────────────────────────────────────── */
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      setVideos((p) => [...p, { url: URL.createObjectURL(file), name: file.name }])
    })
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const removeVideo = (i: number) => setVideos((p) => p.filter((_, idx) => idx !== i))

  /* ── Map callback ──────────────────────────────────────────────────────── */
  const handleLocationPick = (lat: number, lng: number, address: string) => {
    setMapLat(lat)
    setMapLng(lng)
    setLocation(address)
  }

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      onSubmit({
        title, description, category,
        otherCategory: category === 'Other' ? otherCategory : undefined,
        location, mapLat, mapLng, priority,
        reporterName: 'Current User',
        images,
        videos: videos.map((v) => v.url),
      })
      setIsSubmitting(false)
      resetForm()
      onClose()
    }, 800)
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('Infrastructure')
    setOtherCategory(''); setLocation(''); setPriority('Medium')
    setImages([]); setVideos([]); setMapLat(undefined); setMapLng(undefined); setShowMap(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose() } }}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-xl">Submit Pulse Report</DialogTitle>
          </div>
          <DialogDescription>
            Report an issue or suggest an improvement. Your report will be sent to the relevant city department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Report Title</label>
            <Input required placeholder="e.g. Broken street light on Main St" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card" />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <MapPin className="size-3 text-primary" /> Location
            </label>
            <div className="flex gap-2">
              <Input
                required
                placeholder="Enter address, or pick on map below"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-card flex-1"
              />
              <Button type="button" variant="outline" className="shrink-0 gap-1.5 px-3" onClick={() => setShowMap((v) => !v)}>
                <Map className="size-3.5 text-primary" />
                {showMap ? 'Hide Map' : 'Pick on Map'}
              </Button>
            </div>

            {/* Interactive Leaflet Map */}
            {showMap && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-1">
                <MapPicker lat={mapLat} lng={mapLng} onLocationPick={handleLocationPick} />
              </div>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Category</label>
              <select className="w-full h-9 rounded-md border border-input bg-card/80 backdrop-blur-md px-3 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary dark:bg-card/80" value={category} onChange={(e) => setCategory(e.target.value as PulseCategory)}>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environmental">Environmental</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Transportation">Transportation</option>
                <option value="Water & Electricity">Water &amp; Electricity</option>
                <option value="Community">Community</option>
                <option value="Improvement Suggestion">Improvement Suggestion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Priority Level</label>
              <select className="w-full h-9 rounded-md border border-input bg-card/80 backdrop-blur-md px-3 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary dark:bg-card/80" value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Other Category */}
          {category === 'Other' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-foreground">Specify Category</label>
              <Input required placeholder="Please specify..." value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} className="bg-card" />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Detailed Description</label>
            <textarea
              required
              placeholder="Provide as much detail as possible to help authorities assess the situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Attach Evidence (Optional)</label>
            <div className="flex gap-3">
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer flex-1" onClick={() => imageInputRef.current?.click()}>
                <ImageIcon className="size-6 mb-1" />
                <span className="text-xs font-medium">Add Photos</span>
                <span className="text-[10px] text-muted-foreground/70">JPG, PNG, WEBP</span>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer flex-1" onClick={() => videoInputRef.current?.click()}>
                <Video className="size-6 mb-1" />
                <span className="text-xs font-medium">Add Video</span>
                <span className="text-[10px] text-muted-foreground/70">MP4, MOV, WEBM</span>
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((src, i) => (
                  <div key={i} className="relative group size-20 rounded-lg overflow-hidden border border-border shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 size-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {videos.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <Video className="size-4 text-primary shrink-0" />
                    <span className="text-xs truncate flex-1">{v.name}</span>
                    <button type="button" onClick={() => removeVideo(i)} className="size-5 flex items-center justify-center shrink-0 hover:bg-border rounded-full">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full border-2 border-background border-r-transparent animate-spin" />
                  Submitting…
                </div>
              ) : 'Submit Pulse Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
