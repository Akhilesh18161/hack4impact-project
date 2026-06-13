'use client'

import React, { useState } from 'react'
import { PulseReport, PulseStatus, PulseCategory } from '@/lib/pulse-data'
import { PulseCard } from './pulse-card'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'

interface PulseFeedProps {
  reports: PulseReport[]
  onCardClick?: (report: PulseReport) => void
  showFilters?: boolean
}

export function PulseFeed({ reports, onCardClick, showFilters = true }: PulseFeedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PulseStatus | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState<PulseCategory | 'All'>('All')

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search reports or locations..."
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="appearance-none pl-9 pr-8 py-2 bg-card/80 backdrop-blur-md border border-input rounded-lg text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary h-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assessment in Progress">Assessment in Progress</option>
                <option value="Action Approved">Action Approved</option>
                <option value="Implementation in Progress">Implementation in Progress</option>
                <option value="Near Completion">Near Completion</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            <select 
              className="px-4 py-2 bg-card/80 backdrop-blur-md border border-input rounded-lg text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
            >
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Environmental">Environmental</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Transportation">Transportation</option>
              <option value="Water & Electricity">Water & Electricity</option>
              <option value="Community">Community</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <PulseCard 
              key={report.id} 
              report={report} 
              onClick={onCardClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card/50 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm">No Pulse Reports match your filters.</p>
          {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setCategoryFilter('All');
              }}
              className="mt-2 text-primary"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
