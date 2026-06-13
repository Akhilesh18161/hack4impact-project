'use client'

import { useState } from 'react'
import { LeftSidebar } from '@/components/community/left-sidebar'
import { RightSidebar } from '@/components/community/right-sidebar'
import { PostFeed } from '@/components/community/post-feed'

export default function CommunityHubPage() {
  const [currentFilter, setCurrentFilter] = useState('all')

  return (
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6 justify-center">
          <LeftSidebar 
            currentFilter={currentFilter} 
            onFilterChange={setCurrentFilter} 
          />
          <PostFeed currentFilter={currentFilter} selectedCategory={null} />
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
