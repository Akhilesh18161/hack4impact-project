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
  images?: string[];
  videos?: string[];
  resolutionSummary?: string;
  adminUpdates?: { date: string; message: string }[];
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
  images: row.images || [],
  videos: row.videos || [],
  resolutionSummary: row.resolution_summary || undefined,
  adminUpdates: row.admin_updates || [],
});

export const pulseClient = {
  getReports: async (): Promise<PulseReport[]> => {
    const { data, error } = await supabase
      .from('pulse_reports')
      .select('*')
      .order('date_submitted', { ascending: false });
      
    if (error) {
      console.error('Error fetching pulse reports:', error);
      return [];
    }
    return (data || []).map(mapDbToReport);
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
    const channel = supabase
      .channel('public:pulse_reports')
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

