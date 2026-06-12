'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props {
  id: string
}

/** Immediately redirects /pulse/[id] → /pulse?report=[id] */
export function PulseIdRedirect({ id }: Props) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/pulse?report=${encodeURIComponent(id)}`)
  }, [id, router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}
