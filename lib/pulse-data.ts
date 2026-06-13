import { supabase } from './supabase';

export type PulseStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Assessment in Progress' 
  | 'Action Approved' 
  | 'Implementation in Progress' 
  | 'Near Completion' 
  | 'Resolved' 
  | 'Closed';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type PulseCategory = 
  | 'Infrastructure' 
  | 'Environmental' 
  | 'Public Safety' 
  | 'Transportation' 
  | 'Water & Electricity' 
  | 'Community' 
  | 'Improvement Suggestion' 
  | 'Other';

export interface PulseReport {
  id: string;
  title: string;
  description: string;
  category: PulseCategory;
  otherCategory?: string;
  location: string;
  mapLat?: number;
  mapLng?: number;
  priority: PriorityLevel;
  status: PulseStatus;
  dateSubmitted: string;
  dateResolved?: string;
  confirmations: number;
  reporterName: string;
  reporterId?: string;
  images?: string[];
  videos?: string[];
  resolutionSummary?: string;
  adminUpdates?: { date: string; message: string }[];
  
  // Moderation fields
  verificationStatus: string;
  verifiedBy?: string;
  verificationDate?: string;
  editHistory: any[];
  isDeleted: boolean;
  deletionReason?: string;
  deletedBy?: string;
  deletedAt?: string;
}

// Map db snake_case to camelCase
const mapDbToReport = (row: any): PulseReport => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category as PulseCategory,
  otherCategory: row.other_category || undefined,
  location: row.location,
  mapLat: row.map_lat || undefined,
  mapLng: row.map_lng || undefined,
  priority: row.priority as PriorityLevel,
  status: row.status as PulseStatus,
  dateSubmitted: row.date_submitted,
  dateResolved: row.date_resolved || undefined,
  confirmations: row.confirmations,
  reporterName: row.reporter_name,
  reporterId: row.reporter_id,
  images: row.images || [],
  videos: row.videos || [],
  resolutionSummary: row.resolution_summary || undefined,
  adminUpdates: row.admin_updates || [],
  verificationStatus: row.verification_status || 'Pending Review',
  verifiedBy: row.verified_by,
  verificationDate: row.verification_date,
  editHistory: row.edit_history || [],
  isDeleted: row.is_deleted || false,
  deletionReason: row.deletion_reason,
  deletedBy: row.deleted_by,
  deletedAt: row.deleted_at
});

export const pulseClient = {
  getReports: async (includeDeleted = false): Promise<PulseReport[]> => {
    let query = supabase
      .from('pulse_reports')
      .select('*')
      .order('date_submitted', { ascending: false });
      
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
      
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching pulse reports:', error);
      return [];
    }
    return (data || []).map(mapDbToReport);
  },

  getReport: async (id: string): Promise<PulseReport | null> => {
    const { data, error } = await supabase.from('pulse_reports').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbToReport(data);
  },

  editPulseReport: async (reportId: string, userId: string, updates: Partial<PulseReport>, isAdmin: boolean = false): Promise<PulseReport | null> => {
    const report = await pulseClient.getReport(reportId);
    if (!report || (!isAdmin && report.reporterId !== userId)) return null;
    
    if (!isAdmin && report.verificationStatus !== 'Pending Review' && report.verificationStatus !== 'Rejected') {
      return null;
    }

    const { data, error } = await supabase.from('pulse_reports').update({
      title: updates.title !== undefined ? updates.title : report.title,
      description: updates.description !== undefined ? updates.description : report.description,
      category: updates.category !== undefined ? updates.category : report.category,
      other_category: updates.otherCategory !== undefined ? updates.otherCategory : report.otherCategory,
      location: updates.location !== undefined ? updates.location : report.location,
      images: updates.images !== undefined ? updates.images : report.images,
      videos: updates.videos !== undefined ? updates.videos : report.videos,
      edit_history: [...report.editHistory, { date: new Date().toISOString(), changes: updates }]
    }).eq('id', reportId).select().single();

    if (error || !data) return null;
    return mapDbToReport(data);
  },

  deletePulseReport: async (reportId: string, userId: string, isAdmin: boolean = false): Promise<boolean> => {
    console.log(`Attempting deletePulseReport for id=${reportId}, userId=${userId}, isAdmin=${isAdmin}`);
    const report = await pulseClient.getReport(reportId);
    if (!report) {
      console.log('deletePulseReport failed: report not found');
      return false;
    }
    if (!isAdmin && report.reporterId !== userId) {
      console.log(`deletePulseReport failed: not admin and reporterId (${report.reporterId}) != userId (${userId})`);
      return false;
    }

    if (!isAdmin && report.verificationStatus !== 'Pending Review' && report.verificationStatus !== 'Rejected') {
      console.log(`deletePulseReport failed: not admin and invalid verificationStatus (${report.verificationStatus})`);
      return false;
    }

    const { error } = await supabase.from('pulse_reports').update({
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date().toISOString()
    }).eq('id', reportId);

    if (error) {
      console.error('deletePulseReport failed at supabase update:', error);
    } else {
      console.log('deletePulseReport succeeded');
    }

    return !error;
  },

  requestModification: async (reportId: string, userId: string, requestedChanges: any, reason: string): Promise<any> => {
    const { data, error } = await supabase.from('content_requests').insert([{
      content_id: reportId,
      content_type: 'pulse_report',
      request_type: 'modification',
      requester_id: userId,
      requested_changes: requestedChanges,
      reason,
      status: 'Pending'
    }]).select().single();

    if (error || !data) return null;
    return data;
  },

  requestRemoval: async (reportId: string, userId: string, reason: string): Promise<any> => {
    const { data, error } = await supabase.from('content_requests').insert([{
      content_id: reportId,
      content_type: 'pulse_report',
      request_type: 'removal',
      requester_id: userId,
      reason,
      status: 'Pending'
    }]).select().single();

    if (error || !data) return null;
    return data;
  },

  verifyContent: async (reportId: string, adminId: string, status: string): Promise<boolean> => {
    const { error } = await supabase.from('pulse_reports').update({
      verification_status: status,
      verified_by: adminId,
      verification_date: new Date().toISOString()
    }).eq('id', reportId);
    
    return !error;
  },

  addReport: async (report: Omit<PulseReport, 'id' | 'status' | 'dateSubmitted' | 'confirmations' | 'adminUpdates'>): Promise<PulseReport> => {
    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const dbRow = {
      id: newId,
      title: report.title,
      description: report.description,
      category: report.category,
      other_category: report.otherCategory,
      location: report.location,
      map_lat: report.mapLat,
      map_lng: report.mapLng,
      priority: report.priority,
      status: 'Submitted',
      confirmations: 1,
      reporter_name: report.reporterName,
      reporter_id: report.reporterId,
      images: report.images || [],
      videos: report.videos || [],
      admin_updates: []
    };

    const { data, error } = await supabase
      .from('pulse_reports')
      .insert([dbRow])
      .select()
      .single();

    if (error || !data) {
      console.error('Error inserting report:', error);
      throw error;
    }

    return mapDbToReport(data);
  },

  updateStatus: async (id: string, newStatus: PulseStatus, resolutionSummary?: string): Promise<void> => {
    const updates: any = { status: newStatus };
    if (resolutionSummary) updates.resolution_summary = resolutionSummary;
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      updates.date_resolved = new Date().toISOString();
    }

    const { error } = await supabase.from('pulse_reports').update(updates).eq('id', id);
    if (error) console.error('Error updating status:', error);
  },

  updatePriority: async (id: string, priority: PriorityLevel): Promise<void> => {
    const { error } = await supabase.from('pulse_reports').update({ priority }).eq('id', id);
    if (error) console.error('Error updating priority:', error);
  },

  addAdminUpdate: async (id: string, message: string): Promise<void> => {
    // Need to fetch existing first since we append
    const { data, error } = await supabase.from('pulse_reports').select('admin_updates').eq('id', id).single();
    if (error || !data) return;

    const newUpdates = [...(data.admin_updates || []), { date: new Date().toISOString(), message }];
    await supabase.from('pulse_reports').update({ admin_updates: newUpdates }).eq('id', id);
  },

  subscribeToReports: (callback: () => void) => {
    const channelName = `public:pulse_reports:${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulse_reports' }, () => {
        callback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// ── Deprecated local arrays for backward compatibility temporarily ──────────────────────────────────────────────
export const MOCK_PULSE_REPORTS: PulseReport[] = [];
export function initializeReports() {}
export function subscribeToReports(cb: any) { return () => {}; }

