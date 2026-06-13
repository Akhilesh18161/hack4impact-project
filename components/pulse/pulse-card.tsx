'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PulseReport } from '@/lib/pulse-data';
import { StatusBadge } from './status-badge';
import { MapPin, Calendar, ThumbsUp, ImageIcon, Edit2, Trash2, FileEdit, FileX } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { EditPulseModal, DeletePulseModal, RequestModificationModal, RequestRemovalModal } from './content-action-modals';

interface PulseCardProps {
  report: PulseReport;
  onClick?: (report: PulseReport) => void;
}

export function PulseCard({ report, onClick }: PulseCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isModReqOpen, setIsModReqOpen] = useState(false)
  const [isRemReqOpen, setIsRemReqOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isAuthor = user?.id === report.reporterId || isAdmin
  const canEditDirectly = isAdmin || report.verificationStatus === 'Pending Review' || report.verificationStatus === 'Rejected'

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if we didn't click an action button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    if (onClick) {
      onClick(report);
    } else {
      router.push(`/pulse?report=${encodeURIComponent(report.id)}`);
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <>
    <Card 
      className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm cursor-pointer"
      onClick={handleClick}
    >
      {/* Optional image header */}
      {report.images && report.images.length > 0 && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img 
            src={report.images[0]} 
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-none text-[10px] gap-1 h-6">
              <ImageIcon className="w-3 h-3" />
              {report.images.length}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
            {report.category}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground mr-1">{report.id}</span>
            {isAuthor && user && (
              <div className="flex items-center" onClick={e => e.stopPropagation()}>
                {canEditDirectly ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary" onClick={() => setIsEditOpen(true)} title="Edit Report">
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => setIsDeleteOpen(true)} title="Delete Report">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-500/70 hover:text-amber-500" onClick={() => setIsModReqOpen(true)} title="Request Change">
                      <FileEdit className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/70 hover:text-destructive" onClick={() => setIsRemReqOpen(true)} title="Request Removal">
                      <FileX className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <h3 className="font-bold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {report.title}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/70" />
          <span className="line-clamp-2">{report.location}</span>
        </div>
        
        <p className="text-sm text-foreground/80 line-clamp-3 mt-1">
          {report.description}
        </p>

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <Badge variant="outline" className={`text-[10px] px-2 h-6 ${getPriorityColor(report.priority)}`}>
            {report.priority} Priority
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 border-t border-border/50 bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(report.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div className="flex items-center gap-1.5 bg-primary/5 text-primary/90 px-2 py-1 rounded-md font-medium">
          <ThumbsUp className="w-3.5 h-3.5" />
          {report.confirmations} Confirmations
        </div>
      </CardFooter>
    </Card>

    {isAuthor && user && (
      <>
        <EditPulseModal
          report={report}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => window.location.reload()}
          currentUserId={user.id}
        />
        <DeletePulseModal
          report={report}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => window.location.reload()}
          currentUserId={user.id}
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
  );
}
