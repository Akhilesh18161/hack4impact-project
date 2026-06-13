import MetricDetailClient from './MetricDetailClient'

export function generateStaticParams() {
  return [
    { metric: 'air-quality' },
    { metric: 'green-cover' },
    { metric: 'renewable-energy' },
    { metric: 'waste-recycling' },
    { metric: 'gdp-growth' },
    { metric: 'electric-vehicles' }
  ]
}

interface PageProps {
  params: Promise<{ metric: string }>
}

export default async function Page({ params }: PageProps) {
  return <MetricDetailClient params={params} />
}
