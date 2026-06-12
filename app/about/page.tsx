export default function AboutPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">About UrbanPulse</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
          UrbanPulse is a platform dedicated to creating smarter, more sustainable communities. 
          By providing real-time data and actionable insights, we empower citizens and leaders 
          to build the cities of tomorrow.
        </p>
      </div>
    </div>
  )
}
