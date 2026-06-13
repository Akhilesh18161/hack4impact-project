'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PulseReport } from '@/lib/pulse-data'
import { StatusBadge } from './status-badge'
import {
  MapPin, Calendar, ThumbsUp, User, Tag, AlertTriangle,
  Image as ImageIcon, Video, Clock, ExternalLink,
} from 'lucide-react'
import { MapViewer } from './map-viewer'

interface PulseDetailModalProps {
  report: PulseReport | null
  onClose: () => void
}

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export function PulseDetailModal({ report, onClose }: PulseDetailModalProps) {
  if (!report) return null

  const mapSrc =
    report.mapLat && report.mapLng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${report.mapLng - 0.015}%2C${report.mapLat - 0.015}%2C${report.mapLng + 0.015}%2C${report.mapLat + 0.015}&layer=mapnik&marker=${report.mapLat}%2C${report.mapLng}`
      : null

  return (
    <Dialog open={!!report} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border-border/50">
        <DialogTitle className="sr-only">{report.title}</DialogTitle>

        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-card/50">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                  {report.category}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {report.id}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-snug">{report.title}</h2>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusBadge status={report.status} />
              <Badge
                variant="outline"
                className={`text-[10px] px-2 h-6 ${priorityColors[report.priority] ?? ''}`}
              >
                {report.priority} Priority
              </Badge>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary/70" />
              {report.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {new Date(report.dateSubmitted).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="size-3.5 text-primary/70" />
              {report.confirmations} Confirmations
            </span>
            {report.reporterName && (
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" />
                {report.reporterName}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" /> Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-lg border border-border/50">
                {report.description}
              </p>
            </div>

            {/* Admin Updates Timeline */}
            {report.adminUpdates && report.adminUpdates.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Activity Timeline
                </h3>
                <div className="relative pl-4 flex flex-col gap-3">
                  <div className="absolute left-0 top-1 bottom-1 w-px bg-border/60" />
                  {report.adminUpdates.map((update, idx) => (
                    <div key={idx} className="relative flex flex-col gap-0.5">
                      <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-primary border-2 border-background" />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date(update.date).toLocaleString()}
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Summary */}
            {(report.status === 'Resolved' || report.status === 'Closed') && report.resolutionSummary && (
              <div>
                <h3 className="text-xs font-bold uppercase text-emerald-500 tracking-wider mb-2 flex items-center gap-1.5">
                  ✅ Resolution Summary
                </h3>
                <p className="text-sm leading-relaxed text-foreground bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg">
                  {report.resolutionSummary}
                </p>
                {report.dateResolved && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="size-3" />
                    Resolved on {new Date(report.dateResolved).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            {/* Map */}
            {mapSrc ? (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Location on Map
                </h3>
                <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
                  <MapViewer lat={report.mapLat!} lng={report.mapLng!} height={200} />
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${report.mapLat}&mlon=${report.mapLng}&zoom=16`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[11px] text-primary py-1.5 bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <ExternalLink className="size-3" /> Open in OpenStreetMap
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 p-4 text-center text-muted-foreground">
                <MapPin className="size-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No map coordinates submitted</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{report.location}</p>
              </div>
            )}

            {/* Images */}
            {report.images && report.images.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> Evidence Photos ({report.images.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {report.images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted group">
                        <img
                          src={src}
                          alt={`Evidence ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {report.videos && report.videos.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                  <Video className="size-3.5" /> Evidence Videos
                </h3>
                <div className="flex flex-col gap-2">
                  {report.videos.map((src, i) => (
                    <video
                      key={i}
                      src={src}
                      controls
                      className="w-full rounded-lg border border-border/50"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No evidence */}
            {(!report.images || report.images.length === 0) && (!report.videos || report.videos.length === 0) && (
              <div className="rounded-xl border border-dashed border-border/50 p-4 text-center text-muted-foreground">
                <ImageIcon className="size-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No evidence photos or videos attached</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
