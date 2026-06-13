'use client'

import { useState, useRef } from 'react'
import { Post, Category, communityClient } from '@/lib/community-data'
import { useAuth } from '@/components/auth-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  FileImage,
  FileVideo,
  Sparkles,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: (post: Post) => void
}

const ALL_CATEGORIES: Category[] = [
  'Transportation', 'Traffic', 'Waste Management', 'Water',
  'Electricity', 'Environment', 'Infrastructure', 'Public Safety',
  'Education', 'Healthcare', 'Sustainability', 'Community Events', 'Other',
]

const MAX_TITLE = 120
const MAX_DESC = 2000

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const handleMediaToggle = (type: 'image' | 'video') => {
    if (mediaType === type) {
      setMediaType('none')
      setSelectedFiles([])
    } else {
      setMediaType(type)
      setSelectedFiles([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) setSelectedFiles(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !description.trim() || selectedCategories.length === 0) return

    setIsSubmitting(true)

    // Convert files to base64 data URLs for persistence
    const mediaUrls = await Promise.all(
      selectedFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
    )

    try {
      const newPost = await communityClient.createPost({
        authorId: user.id,
        authorName: user.fullName,
        authorRole: user.role,
        title: title.trim(),
        description: description.trim(),
        categories: selectedCategories,
        mediaType: selectedFiles.length > 0 ? mediaType : 'none',
        mediaUrls: mediaUrls,
        mediaFileNames: selectedFiles.map((f) => f.name),
      })

      setIsSubmitting(false)
      resetForm()
      onPostCreated(newPost)
      onClose()
    } catch (err: any) {
      setIsSubmitting(false)
      alert("Failed to create post: " + (err.message || JSON.stringify(err)))
      console.error(err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSelectedCategories([])
    setMediaType('none')
    setSelectedFiles([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    selectedCategories.length > 0 &&
    !isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] bg-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            Create Community Post
          </DialogTitle>
          <DialogDescription>
            Share an issue, propose a solution, or start a civic discussion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">

          {/* ── Title ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Post Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Summarise your issue or proposal..."
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm font-semibold placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="flex justify-end">
              <span className={cn('text-[10px]', title.length >= MAX_TITLE ? 'text-destructive' : 'text-muted-foreground')}>
                {title.length}/{MAX_TITLE}
              </span>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="Provide context, background, affected area, and a call to action..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
              rows={5}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[110px]"
            />
            <div className="flex justify-end">
              <span className={cn('text-[10px]', description.length >= MAX_DESC ? 'text-destructive' : 'text-muted-foreground')}>
                {description.length}/{MAX_DESC}
              </span>
            </div>
          </div>

          {/* ── Categories ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              Categories <span className="text-destructive">*</span>
              <span className="font-normal text-muted-foreground ml-1">(select at least one)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150',
                    selectedCategories.includes(cat)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[10px] text-muted-foreground">Selected:</span>
                {selectedCategories.map((cat) => (
                  <Badge
                    key={cat}
                    className="h-5 gap-1 px-1.5 text-[10px] cursor-pointer"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                    <X className="size-2.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* ── Media ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              Attach Media <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mediaType === 'image' ? 'default' : 'outline'}
                size="sm"
                className="h-9 gap-2 text-xs"
                onClick={() => handleMediaToggle('image')}
              >
                <ImageIcon className="size-3.5" /> Images
              </Button>
              <Button
                type="button"
                variant={mediaType === 'video' ? 'default' : 'outline'}
                size="sm"
                className="h-9 gap-2 text-xs"
                onClick={() => handleMediaToggle('video')}
              >
                <Video className="size-3.5" /> Video
              </Button>
            </div>

            {mediaType !== 'none' && (
              <div className="mt-1 flex flex-col gap-2">
                {/* File drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/10 p-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {mediaType === 'image' ? (
                    <FileImage className="size-8 mx-auto text-muted-foreground mb-2" />
                  ) : (
                    <FileVideo className="size-8 mx-auto text-muted-foreground mb-2" />
                  )}
                  <p className="text-xs font-semibold text-foreground">
                    Click to select {mediaType === 'image' ? 'images' : 'a video'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {mediaType === 'image' ? 'PNG, JPG, WEBP up to 10MB each' : 'MP4, MOV, WEBM up to 50MB'}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  multiple={mediaType === 'image'}
                  onChange={handleFileChange}
                />

                {/* Selected file previews */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
                      >
                        {mediaType === 'image' ? (
                          <FileImage className="size-3.5 text-primary shrink-0" />
                        ) : (
                          <FileVideo className="size-3.5 text-primary shrink-0" />
                        )}
                        <span className="truncate max-w-[140px] text-foreground font-medium">
                          {file.name}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Priority hint ── */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-start gap-2">
            <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Posts with <strong className="text-foreground">high community upvotes</strong> and engagement are automatically elevated to{' '}
              <strong className="text-foreground">High Priority</strong>, making them more visible to administrators.
            </p>
          </div>

          <DialogFooter className="border-t border-border/50 pt-4 gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Publish Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
