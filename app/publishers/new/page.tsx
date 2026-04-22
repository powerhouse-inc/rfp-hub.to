import type { Metadata } from 'next'
import { PublisherForm } from '@/modules/publishers/components/publisher-form'

export const metadata: Metadata = {
  title: 'Add publisher · RFP Hub',
  description: 'Register a new GrantSystem (funder, DAO, foundation, etc.) on the RFP Hub.',
}

export default function NewPublisherPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">Add publisher</h1>
        <p className="text-foreground/70">
          Create a <code className="font-mono text-sm">rfp-hub/grant-system</code> document. Once
          it exists, new grant pools can be linked to it via their{' '}
          <code className="font-mono text-sm">grantSystemRef</code>.
        </p>
      </header>
      <PublisherForm />
    </div>
  )
}
