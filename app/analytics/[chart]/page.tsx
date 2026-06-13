import AnalyticsDetailClient from './AnalyticsDetailClient'

export function generateStaticParams() {
  return [
    { chart: 'aqi' },
    { chart: 'environment' },
    { chart: 'economy' },
    { chart: 'waste' },
    { chart: 'sustainability' },
    { chart: 'allmetrics' }
  ]
}

interface PageProps {
  params: Promise<{ chart: string }>
}

export default async function Page({ params }: PageProps) {
  return <AnalyticsDetailClient params={params} />
}
