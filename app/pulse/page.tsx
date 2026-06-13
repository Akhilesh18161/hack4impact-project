'use client'

import React, { Suspense, useEffect, useReducer, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PlusCircle, Activity, Loader2 } from 'lucide-react'
import { PulseFeed } from '@/components/pulse/pulse-feed'
import { CreatePulseModal } from '@/components/pulse/create-pulse-modal'
import { PulseDetailClient } from '@/components/pulse/pulse-detail-client'
import { pulseClient, PulseReport } from '@/lib/pulse-data'

/* ── Inner component (needs Suspense for useSearchParams) ─────────────────── */
function PulseContent() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const [reports, setReports] = useState<PulseReport[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadReports = async () => {
    const data = await pulseClient.getReports()
    setReports(data)
  }

  // Re-render whenever any mutation fires (admin updates, new reports, etc.)
  useEffect(() => {
    loadReports()
    const unsubscribe = pulseClient.subscribeToReports(() => {
      loadReports()
    })
    return unsubscribe
  }, [])

  const reportId = searchParams.get('report')

  /* ── Detail view ─────────────────────────────────────────────────────── */
  if (reportId) {
    const report = reports.find((r) => r.id === decodeURIComponent(reportId)) ?? null
    return <PulseDetailClient report={report} />
  }

  /* ── Feed view ───────────────────────────────────────────────────────── */
  const handleReportSubmit = async (
    data: Omit<PulseReport, 'id' | 'status' | 'dateSubmitted' | 'confirmations' | 'adminUpdates'>
  ) => {
    try {
      const newReport = await pulseClient.addReport(data)
      // Navigate straight to the new report's detail page
      router.push(`/pulse?report=${encodeURIComponent(newReport.id)}`)
    } catch (err) {
      console.error(err)
      alert('Failed to submit report. Ensure attachments are not too large.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20"
          >
            <Activity className="size-3.5" />
            Citizen Reporting
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">City Pulse</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Report issues, track progress, and help improve your community.
            Every report contributes to understanding the city's current pulse.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            size="lg"
            className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-bold group"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="size-5 transition-transform group-hover:rotate-90" />
            Submit Pulse Report
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Cards navigate to /pulse?report=ID via PulseCard's router.push */}
        <PulseFeed reports={reports} />
      </motion.div>

      <CreatePulseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  )
}

/* ── Page export (Suspense required for useSearchParams in static export) ─── */
export default function PulsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PulseContent />
    </Suspense>
  )
}
