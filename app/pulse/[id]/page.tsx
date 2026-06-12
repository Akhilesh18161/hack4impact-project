import { MOCK_PULSE_REPORTS } from '@/lib/pulse-data'
import { PulseIdRedirect } from './redirect'

/**
 * Generates static pages for the seed reports only.
 * These pages immediately redirect to /pulse?report=ID so that:
 *  - Bookmarked links continue to work
 *  - The live detail view (with pub/sub & localStorage) is always used
 */
export function generateStaticParams() {
  return MOCK_PULSE_REPORTS.map((r) => ({
    id: encodeURIComponent(r.id),
  }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function PulseDetailPage({ params }: Props) {
  const { id } = await params
  return <PulseIdRedirect id={decodeURIComponent(id)} />
}
