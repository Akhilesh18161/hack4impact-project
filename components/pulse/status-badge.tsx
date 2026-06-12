import { Badge } from '@/components/ui/badge';
import { PulseStatus } from '@/lib/pulse-data';
import { Clock, Eye, AlertCircle, CheckCircle2, Hammer, FastForward, CheckSquare, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PulseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<PulseStatus, { color: string; icon: React.ReactNode }> = {
    'Submitted': {
      color: 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    'Under Review': {
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
      icon: <Eye className="w-3 h-3 mr-1" />
    },
    'Assessment in Progress': {
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20',
      icon: <AlertCircle className="w-3 h-3 mr-1" />
    },
    'Action Approved': {
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20',
      icon: <CheckSquare className="w-3 h-3 mr-1" />
    },
    'Implementation in Progress': {
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
      icon: <Hammer className="w-3 h-3 mr-1" />
    },
    'Near Completion': {
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
      icon: <FastForward className="w-3 h-3 mr-1" />
    },
    'Resolved': {
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    },
    'Closed': {
      color: 'bg-stone-500/10 text-stone-500 border-stone-500/20 hover:bg-stone-500/20',
      icon: <XCircle className="w-3 h-3 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig['Submitted'];

  return (
    <Badge variant="outline" className={`font-semibold rounded-full px-2.5 py-0.5 transition-colors ${config.color} ${className || ''}`}>
      <span className="flex items-center">
        {config.icon}
        {status}
      </span>
    </Badge>
  );
}
