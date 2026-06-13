'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { pulseClient, PulseReport } from '@/lib/pulse-data'

export function EditPulseModal({
  report,
  isOpen,
  onClose,
  onSuccess,
  currentUserId
}: {
  report: PulseReport
  isOpen: boolean
  onClose: () => void
  onSuccess: (report: PulseReport) => void
  currentUserId: string
}) {
  const [description, setDescription] = useState(report.description)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const updated = await pulseClient.editPulseReport(report.id, currentUserId, { description })
    setIsSubmitting(false)
    if (updated) {
      onSuccess(updated)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pulse Report</DialogTitle>
          <DialogDescription>Make changes to your report. Allowed since it hasn&apos;t been verified yet.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RequestModificationModal({
  report,
  isOpen,
  onClose,
  currentUserId
}: {
  report: PulseReport
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}) {
  const [requestedChanges, setRequestedChanges] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!requestedChanges || !reason) return
    setIsSubmitting(true)
    await pulseClient.requestModification(report.id, currentUserId, { description: requestedChanges }, reason)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Modification</DialogTitle>
          <DialogDescription>Your report is verified, so changes must be approved by an admin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">New Content / Changes</label>
            <textarea
              value={requestedChanges}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestedChanges(e.target.value)}
              placeholder="What do you want to change?"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Reason for Change</label>
            <textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Why are you making this change?"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !requestedChanges || !reason}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RequestRemovalModal({
  report,
  isOpen,
  onClose,
  currentUserId
}: {
  report: PulseReport
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setIsSubmitting(true)
    await pulseClient.requestRemoval(report.id, currentUserId, reason)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Removal</DialogTitle>
          <DialogDescription>Your report is verified, so removal must be approved by an admin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Reason for Removal</label>
            <textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Why do you want to delete this report?"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting || !reason}>Submit Removal Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeletePulseModal({
  report,
  isOpen,
  onClose,
  onSuccess,
  currentUserId
}: {
  report: PulseReport
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentUserId: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const success = await pulseClient.deletePulseReport(report.id, currentUserId)
    setIsSubmitting(false)
    if (success) {
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pulse Report</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>Delete Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

