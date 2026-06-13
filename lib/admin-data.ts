import { supabase } from './supabase'
import { ContentRequest } from './community-data'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  link?: string
}

export const adminClient = {
  // ── Content Requests ────────────────────────────────────────────────────────

  getContentRequests: async (): Promise<ContentRequest[]> => {
    const { data, error } = await supabase
      .from('content_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(req => ({
      id: req.id,
      contentId: req.content_id,
      contentType: req.content_type,
      requestType: req.request_type,
      requesterId: req.requester_id,
      createdAt: req.created_at,
      requestedChanges: req.requested_changes,
      reason: req.reason,
      status: req.status as any,
      adminNotes: req.admin_notes
    }))
  },

  updateContentRequestStatus: async (
    requestId: string,
    status: ContentRequest['status'],
    adminNotes?: string
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('content_requests')
      .update({ status, admin_notes: adminNotes })
      .eq('id', requestId)

    return !error
  },

  approveModification: async (req: ContentRequest, adminId: string): Promise<boolean> => {
    const targetTable = req.contentType === 'post' ? 'posts' : 'pulse_reports'

    const { data: targetData } = await supabase.from(targetTable).select('*').eq('id', req.contentId).single()
    if (!targetData) return false

    let updates: any = {}
    if (req.contentType === 'post') {
      updates = {
        title: req.requestedChanges.title ?? targetData.title,
        description: req.requestedChanges.description ?? targetData.description,
        categories: req.requestedChanges.categories ?? targetData.categories,
        media_urls: req.requestedChanges.mediaUrls ?? targetData.media_urls,
        media_type: req.requestedChanges.mediaType ?? targetData.media_type,
        edit_history: [...(targetData.edit_history || []), { date: new Date().toISOString(), changes: req.requestedChanges, approvedBy: adminId }]
      }
    } else {
      updates = {
        title: req.requestedChanges.title ?? targetData.title,
        description: req.requestedChanges.description ?? targetData.description,
        category: req.requestedChanges.category ?? targetData.category,
        location: req.requestedChanges.location ?? targetData.location,
        edit_history: [...(targetData.edit_history || []), { date: new Date().toISOString(), changes: req.requestedChanges, approvedBy: adminId }]
      }
    }

    const { error: updateError } = await supabase.from(targetTable).update(updates).eq('id', req.contentId)
    if (updateError) return false

    await adminClient.updateContentRequestStatus(req.id, 'Approved', 'Approved by admin')
    await adminClient.createNotification(
      req.requesterId,
      'Modification Approved',
      'Your modification request for ' + req.contentType + ' (' + req.contentId + ') has been approved.'
    )

    return true
  },

  approveRemoval: async (req: ContentRequest, adminId: string): Promise<boolean> => {
    const targetTable = req.contentType === 'post' ? 'posts' : 'pulse_reports'
    const { error } = await supabase.from(targetTable).update({
      is_deleted: true,
      deleted_by: adminId,
      deleted_at: new Date().toISOString(),
      deletion_reason: req.reason
    }).eq('id', req.contentId)

    if (error) return false

    await adminClient.updateContentRequestStatus(req.id, 'Approved', 'Approved by admin')
    await adminClient.createNotification(
      req.requesterId,
      'Removal Approved',
      'Your removal request for ' + req.contentType + ' (' + req.contentId + ') has been approved.'
    )
    return true
  },

  rejectRequest: async (req: ContentRequest, reason: string): Promise<boolean> => {
    const success = await adminClient.updateContentRequestStatus(req.id, 'Rejected', reason)
    if (success) {
      await adminClient.createNotification(
        req.requesterId,
        'Request Rejected',
        'Your request for ' + req.contentType + ' (' + req.contentId + ') was rejected: ' + reason
      )
    }
    return success
  },

  restoreContent: async (contentId: string, contentType: 'post' | 'pulse_report'): Promise<boolean> => {
    const targetTable = contentType === 'post' ? 'posts' : 'pulse_reports'
    const { error } = await supabase.from(targetTable).update({
      is_deleted: false,
      deleted_by: null,
      deleted_at: null,
      deletion_reason: null
    }).eq('id', contentId)

    return !error
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      createdAt: n.created_at,
      isRead: n.is_read,
      link: n.link
    }))
  },

  markNotificationRead: async (notificationId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    return !error
  },

  createNotification: async (userId: string, title: string, message: string, link?: string): Promise<boolean> => {
    const { error } = await supabase.from('notifications').insert([{
      user_id: userId,
      title,
      message,
      link
    }])
    return !error
  }
}
