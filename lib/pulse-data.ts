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

// ── Pub/Sub listeners ─────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to any data mutation. Returns an unsubscribe function. */
export function subscribeToReports(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

// ── localStorage persistence ──────────────────────────────────────────────
const STORAGE_KEY = 'urbanpulse_reports_v1';

function persist() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PULSE_REPORTS));
  } catch {
    // Quota exceeded (likely large base64 images) — strip uploaded media and retry
    try {
      const stripped = MOCK_PULSE_REPORTS.map((r) => ({
        ...r,
        images: r.images?.filter((img) => !img.startsWith('data:')),
        videos: [],
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch { /* give up silently */ }
  }
}

// ── Seed / initial data ───────────────────────────────────────────────────
const SEED_DATA: PulseReport[] = [
  {
    id: 'PR-1042',
    title: 'Massive Pothole on Ring Road',
    description: 'There is a massive pothole spanning the entire left lane. Several cars have been damaged over the past two days.',
    category: 'Infrastructure',
    location: 'Ring Road South, near Koteshwor',
    priority: 'High',
    status: 'Implementation in Progress',
    dateSubmitted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 42,
    reporterName: 'Anonymous Citizen',
    images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'],
    adminUpdates: [
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), message: 'Assessment complete. Crew dispatched.' }
    ]
  },
  {
    id: 'PR-1045',
    title: 'Streetlights out in Thamel',
    description: 'Entire block is completely dark. High risk of accidents and security concerns.',
    category: 'Water & Electricity',
    location: 'Thamel Marg',
    priority: 'Critical',
    status: 'Under Review',
    dateSubmitted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 18,
    reporterName: 'Aayush',
  },
  {
    id: 'PR-1021',
    title: 'Illegal Dumping at Bagmati River Bank',
    description: 'A construction company is dumping debris into the river late at night.',
    category: 'Environmental',
    location: 'Bagmati Corridor',
    priority: 'High',
    status: 'Resolved',
    dateSubmitted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dateResolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    confirmations: 85,
    reporterName: 'EcoWarrior',
    resolutionSummary: 'City authorities investigated and fined the responsible company. Site has been cleared and warning signs installed.',
    adminUpdates: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), message: 'Investigation initiated.' },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), message: 'Perpetrators identified and fined. Cleanup scheduled.' }
    ],
    images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400']
  },
  {
    id: 'PR-1050',
    title: 'New cycling lane needed',
    description: 'Traffic is getting worse and cyclists have no safe route from Patan to Kathmandu.',
    category: 'Improvement Suggestion',
    location: 'Patan to Kathmandu Route',
    priority: 'Low',
    status: 'Assessment in Progress',
    dateSubmitted: new Date().toISOString(),
    confirmations: 120,
    reporterName: 'UrbanCyclist',
  }
];

/** Load reports from localStorage on the client, fall back to seed data. */
function loadInitialReports(): PulseReport[] {
  if (typeof window === 'undefined') return [...SEED_DATA]; // server → seed only
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PulseReport[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* corrupt data → fall back to seed */ }
  return [...SEED_DATA];
}

// Global in-memory store (initialised from localStorage or seed data)
export let MOCK_PULSE_REPORTS: PulseReport[] = loadInitialReports();

// ── Mutation helpers ──────────────────────────────────────────────────────

export const addPulseReport = (
  report: Omit<PulseReport, 'id' | 'status' | 'dateSubmitted' | 'confirmations' | 'adminUpdates'>
): PulseReport => {
  const newReport: PulseReport = {
    ...report,
    id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Submitted',
    dateSubmitted: new Date().toISOString(),
    confirmations: 1,
    adminUpdates: [],
  };
  MOCK_PULSE_REPORTS = [newReport, ...MOCK_PULSE_REPORTS];
  persist();
  notify();
  return newReport;
};

export const updatePulseReportStatus = (
  id: string,
  newStatus: PulseStatus,
  resolutionSummary?: string
) => {
  MOCK_PULSE_REPORTS = MOCK_PULSE_REPORTS.map((report) => {
    if (report.id !== id) return report;
    return {
      ...report,
      status: newStatus,
      resolutionSummary: resolutionSummary || report.resolutionSummary,
      dateResolved:
        newStatus === 'Resolved' || newStatus === 'Closed'
          ? new Date().toISOString()
          : report.dateResolved,
    };
  });
  persist();
  notify();
};

export const updatePulseReportPriority = (id: string, priority: PriorityLevel) => {
  MOCK_PULSE_REPORTS = MOCK_PULSE_REPORTS.map((report) =>
    report.id === id ? { ...report, priority } : report
  );
  persist();
  notify();
};

export const addAdminUpdate = (id: string, message: string) => {
  MOCK_PULSE_REPORTS = MOCK_PULSE_REPORTS.map((report) => {
    if (report.id !== id) return report;
    return {
      ...report,
      adminUpdates: [
        ...(report.adminUpdates || []),
        { date: new Date().toISOString(), message },
      ],
    };
  });
  persist();
  notify();
};
