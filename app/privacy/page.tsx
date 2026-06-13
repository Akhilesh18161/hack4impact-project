import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-xl sm:p-12">
        <h1 className="mb-6 text-3xl font-black tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mb-8 text-sm text-muted-foreground">Last Updated: October 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Welcome to UrbanPulse. We value your privacy and are committed to protecting your personal data. 
            This privacy policy outlines how we collect, use, and safeguard the information you provide while 
            using the UrbanPulse smart city platform.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            We collect information you directly provide to us when creating an account (such as name, email address, and username), 
            as well as data regarding your interactions with the platform (such as Pulse reports, upvotes, comments, and location data attached to reports).
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            The data we collect is utilized to maintain and improve our services, authenticate users, process your community reports, 
            and aggregate data for urban analytics. Your public contributions (like posts and comments) will be visible to other community members.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Data Security</h2>
          <p>
            We implement standard security measures to protect your data from unauthorized access. However, no electronic transmission 
            over the internet or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please contact us at 
            <a href="mailto:urbanpulse2026@gmail.com" className="text-primary hover:underline ml-1">urbanpulse2026@gmail.com</a>.
          </p>

          <div className="mt-12 rounded-xl bg-primary/10 p-4 border border-primary/20">
            <p className="text-sm font-semibold text-primary">
              Note: This is a demonstration Privacy Policy created for the UrbanPulse prototype.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
