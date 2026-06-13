'use client'

import { useRouter } from 'next/navigation'
import { PulseReport } from '@/lib/pulse-data'
import { StatusBadge } from '@/components/pulse/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Calendar, ThumbsUp, User,
  Clock, CheckCircle2, ImageIcon, Video, X, ExternalLink,
  Edit2, Trash2, FileEdit, FileX
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import { EditPulseModal, RequestModificationModal, RequestRemovalModal } from './content-action-modals'
import { pulseClient } from '@/lib/pulse-data'

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-500 border-red-500/30',
  High:     'bg-orange-500/10 text-orange-500 border-orange-500/30',
  Medium:   'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  Low:      'bg-green-500/10 text-green-600 border-green-500/30',
}

interface Props {
  report: PulseReport | null
}

export function PulseDetailClient({ report: initialReport }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [report, setReport] = useState<PulseReport | null>(initialReport)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  
  // Author action modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isModReqOpen, setIsModReqOpen] = useState(false)
  const [isRemReqOpen, setIsRemReqOpen] = useState(false)

  const isAuthor = user?.id === report?.reporterId
  const canEditDirectly = report?.verificationStatus === 'Pending Review' || report?.verificationStatus === 'Rejected'

  const handleDelete = async () => {
    if (!user || !report || !isAuthor) return
    if (!confirm('Are you sure you want to delete this report?')) return
    const success = await pulseClient.deletePulseReport(report.id, user.id)
    if (success) {
      router.push('/pulse')
    }
  }

  if (!report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold">Report not found</p>
        <Button variant="outline" onClick={() => router.push('/pulse')}>
          <ArrowLeft className="size-4 mr-2" /> Back to City Pulse
        </Button>
      </div>
    )
  }

  const mapSrc = report.mapLat && report.mapLng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${report.mapLng - 0.015}%2C${report.mapLat - 0.015}%2C${report.mapLng + 0.015}%2C${report.mapLat + 0.015}&layer=mapnik&marker=${report.mapLat}%2C${report.mapLng}`
    : null

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[999] bg-black/92 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 size-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="size-5 text-white" />
          </button>
          <img
            src={lightboxSrc}
            alt="Evidence"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="min-h-screen bg-background">
        {/* Sticky top bar */}
        <div className="sticky top-16 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.push('/pulse')}
            >
              <ArrowLeft className="size-4" /> Back to City Pulse
            </Button>
            <span className="text-border">|</span>
            <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
            <div className="ml-auto flex items-center gap-2">
              <StatusBadge status={report.status} />
              <Badge variant="outline" className={`text-[10px] px-2 h-6 ${priorityColors[report.priority] ?? ''}`}>
                {report.priority} Priority
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">{report.category}</Badge>
              {report.otherCategory && <Badge variant="outline" className="text-xs">{report.otherCategory}</Badge>}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6">{report.title}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground items-center">
              <span className="flex items-center gap-2"><MapPin className="size-4 text-primary/70" />{report.location}</span>
              <span className="flex items-center gap-2">
                <Calendar className="size-4" />
                {new Date(report.dateSubmitted).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-2"><ThumbsUp className="size-4 text-primary/70" />{report.confirmations} Citizen Confirmations</span>
              {report.reporterName && <span className="flex items-center gap-2"><User className="size-4" />{report.reporterName}</span>}
              
              {isAuthor && user && (
                <div className="flex items-center gap-2 ml-auto">
                  {canEditDirectly ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-2">
                        <Edit2 className="size-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                        <Trash2 className="size-4" /> Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsModReqOpen(true)} className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                        <FileEdit className="size-4" /> Request Change
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsRemReqOpen(true)} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                        <FileX className="size-4" /> Request Removal
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Main 2-col grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left: content (2/3) ── */}
            <div className="lg:col-span-2 flex flex-col gap-10">

              {/* Description */}
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">Description</h2>
                <p className="text-base sm:text-lg leading-relaxed text-foreground/90 bg-muted/30 rounded-2xl p-6 border border-border/50">
                  {report.description}
                </p>
              </motion.section>

              {/* Evidence Photos — large */}
              {report.images && report.images.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                    <ImageIcon className="size-3.5" /> Evidence Photos ({report.images.length})
                  </h2>
                  <div className={`grid gap-3 ${
                    report.images.length === 1
                      ? 'grid-cols-1'
                      : report.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {report.images.map((src, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-muted cursor-zoom-in shadow-sm hover:shadow-lg transition-shadow"
                        onClick={() => setLightboxSrc(src)}
                      >
                        <div className={`w-full overflow-hidden ${report.images!.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                          <img
                            src={src}
                            alt={`Evidence ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full transition-all duration-200">
                            Click to enlarge
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Videos */}
              {report.videos && report.videos.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                    <Video className="size-3.5" /> Evidence Videos
                  </h2>
                  <div className="flex flex-col gap-4">
                    {report.videos.map((src, i) => (
                      <video key={i} src={src} controls className="w-full rounded-2xl border border-border/50 shadow-sm" />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Admin Timeline */}
              {report.adminUpdates && report.adminUpdates.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-5 flex items-center gap-2">
                    <Clock className="size-3.5" /> Activity Timeline
                  </h2>
                  <div className="relative pl-6 flex flex-col gap-6">
                    <div className="absolute left-0 top-1 bottom-1 w-px bg-border/60" />
                    {report.adminUpdates.map((u, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-primary border-2 border-background shadow-sm" />
                        <span className="text-[11px] font-mono text-muted-foreground block mb-1">
                          {new Date(u.date).toLocaleString()}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{u.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Resolution */}
              {(report.status === 'Resolved' || report.status === 'Closed') && report.resolutionSummary && (
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="text-xs font-bold uppercase text-emerald-500 tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="size-3.5" /> Official Resolution Summary
                  </h2>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <p className="text-base leading-relaxed">{report.resolutionSummary}</p>
                    {report.dateResolved && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        Resolved on {new Date(report.dateResolved).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </motion.section>
              )}
            </div>

            {/* ── Right: sidebar (1/3) ── */}
            <div className="flex flex-col gap-6">

              {/* Map */}
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                  <MapPin className="size-3.5" /> Location
                </h2>
                {mapSrc ? (
                  <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                    <iframe
                      src={mapSrc}
                      width="100%"
                      height="280"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Report Location"
                    />
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${report.mapLat}&mlon=${report.mapLng}&zoom=16`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs text-primary py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors font-medium"
                    >
                      <ExternalLink className="size-3" /> Open in OpenStreetMap
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/50 p-6 text-center bg-muted/20">
                    <MapPin className="size-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">{report.location}</p>
                    <p className="text-xs mt-1 text-muted-foreground/60">No map coordinates submitted</p>
                  </div>
                )}
              </motion.section>

              {/* Details card */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-2xl border border-border/50 bg-card/50 p-5 flex flex-col gap-4"
              >
                <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Report Details</h2>
                {([
                  { label: 'Report ID',     value: <span className="font-mono text-xs">{report.id}</span> },
                  { label: 'Status',        value: <StatusBadge status={report.status} /> },
                  { label: 'Priority',      value: <Badge variant="outline" className={`text-[10px] ${priorityColors[report.priority] ?? ''}`}>{report.priority}</Badge> },
                  { label: 'Category',      value: report.category },
                  { label: 'Reporter',      value: report.reporterName },
                  { label: 'Submitted',     value: new Date(report.dateSubmitted).toLocaleDateString() },
                  { label: 'Confirmations', value: `${report.confirmations} citizens` },
                ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-right">{value}</span>
                  </div>
                ))}
              </motion.section>
            </div>
          </div>
        </div>
      </div>

      {/* Author Modals */}
      {isAuthor && user && report && (
        <>
          <EditPulseModal
            report={report}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSuccess={setReport}
          />
          <RequestModificationModal
            report={report}
            isOpen={isModReqOpen}
            onClose={() => setIsModReqOpen(false)}
            currentUserId={user.id}
          />
          <RequestRemovalModal
            report={report}
            isOpen={isRemReqOpen}
            onClose={() => setIsRemReqOpen(false)}
            currentUserId={user.id}
          />
        </>
      )}
    </>
  )
}
