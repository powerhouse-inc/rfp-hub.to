import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SubmitForm } from '@/modules/submit'

export const metadata: Metadata = {
  title: 'Submit an RFP · RFP Hub',
  description: 'Submit a funding opportunity to the open RFP Hub index.',
}

export default function SubmitPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">Submit an RFP</h1>
        <p className="text-foreground/70">
          Anyone can submit. Submissions are signed with your Renown identity and land as an{' '}
          <code className="font-mono text-sm">rfp-hub/rfp</code> document on the reactor. Duplicate
          detection and verification happen automatically via processors.
        </p>
      </header>
      <SubmitForm />
    </div>
  )
}
