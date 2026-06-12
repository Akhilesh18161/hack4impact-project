'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react'
import { PulseCategory, PriorityLevel } from '@/lib/pulse-data'

interface CreatePulseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreatePulseModal({ isOpen, onClose, onSubmit }: CreatePulseModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PulseCategory>('Infrastructure')
  const [otherCategory, setOtherCategory] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('Medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate network request
    setTimeout(() => {
      onSubmit({
        title,
        description,
        category,
        otherCategory: category === 'Other' ? otherCategory : undefined,
        location,
        priority,
        reporterName: 'Current User', // In a real app, this comes from auth
      })
      setIsSubmitting(false)
      resetForm()
      onClose()
    }, 800)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('Infrastructure')
    setOtherCategory('')
    setLocation('')
    setPriority('Medium')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm()
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
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

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Report Title</label>
              <Input 
                required
                placeholder="e.g. Broken street light on Main St"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-card"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <MapPin className="size-3 text-primary" /> Location
              </label>
              <div className="flex gap-2">
                <Input 
                  required
                  placeholder="Enter specific address or landmark"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-card flex-1"
                />
                <Button type="button" variant="outline" className="shrink-0 gap-2 px-3">
                  <MapPin className="size-4 text-primary" />
                  Pick on Map
                </Button>
              </div>
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Category</label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PulseCategory)}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Water & Electricity">Water & Electricity</option>
                  <option value="Community">Community</option>
                  <option value="Improvement Suggestion">Improvement Suggestion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Priority Level</label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Other Category Field */}
            {category === 'Other' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-foreground">Specify Category</label>
                <Input 
                  required
                  placeholder="Please specify..."
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className="bg-card"
                />
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
                className="w-full min-h-[100px] rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Attach Evidence (Optional)</label>
              <div className="flex gap-3">
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer flex-1">
                  <ImageIcon className="size-6 mb-1" />
                  <span className="text-xs font-medium">Add Photos</span>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer flex-1">
                  <Video className="size-6 mb-1" />
                  <span className="text-xs font-medium">Add Video</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full border-2 border-background border-r-transparent animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
