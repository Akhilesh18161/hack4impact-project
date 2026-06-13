import React from 'react'

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-xl sm:p-12">
        <h1 className="mb-6 text-3xl font-black tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mb-8 text-sm text-muted-foreground">Last Updated: October 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            By accessing or using the UrbanPulse platform, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access our platform.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. User Conduct</h2>
          <p>
            You are responsible for any activity that occurs under your account. You agree not to use the platform 
            for any unlawful purpose or to conduct any activity that infringes on the rights of others, including 
            submitting false or malicious Pulse reports.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Content Ownership</h2>
          <p>
            You retain your rights to any content you submit, post, or display on UrbanPulse. By submitting content, 
            you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, adapt, publish, and 
            distribute it across our platform for the purpose of urban analytics and community improvement.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Termination</h2>
          <p>
            We may terminate or suspend your access to our platform immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Modifications to Service</h2>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the platform (or any part thereof) 
            with or without notice. We shall not be liable to you or any third party for any modification, suspension, 
            or discontinuance of the platform.
          </p>

          <div className="mt-12 rounded-xl bg-primary/10 p-4 border border-primary/20">
            <p className="text-sm font-semibold text-primary">
              Note: This is a demonstration Terms of Service document created for the UrbanPulse prototype.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
