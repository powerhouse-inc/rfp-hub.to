import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API · RFP Hub',
  description: 'Public GraphQL API for the RFP Hub.',
}

const ENDPOINT_BLOCK = `curl -X POST $NEXT_PUBLIC_SWITCHBOARD_URL \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ rfps(filter: { status: OPEN }) { items { id title funder deadline } total } }"}'`

const SCHEMA_BLOCK = `type Query {
  rfps(filter: RfpFilter, pagination: Pagination): RfpPage!
  rfp(id: OID!): Rfp
  rfpBySlug(slug: String!): Rfp
  publishers: [Publisher!]!
  stats: HubStats!
}

input RfpFilter {
  funder: String
  category: String
  status: RfpStatus      # OPEN | CLOSED | UPCOMING | CANCELLED
  ecosystem: String
  deadlineBefore: DateTime
  deadlineAfter: DateTime
  search: String
}

type Rfp {
  id: OID!
  slug: String!
  title: String!
  summary: String!
  body: String
  funder: String!
  funderUrl: URL
  categories: [String!]!
  status: RfpStatus!
  deadline: DateTime
  fundingAmount: String
  fundingCurrency: String
  ecosystem: String
  sourceUrl: URL
  provenance: Provenance!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Provenance {
  submitter: EthereumAddress
  submittedAt: DateTime!
  verificationStatus: VerificationStatus!  # UNVERIFIED | VERIFIED | DISPUTED
  sourceHash: String!
}`

export default function ApiDocsPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 border-b border-border pb-8">
        <span className="mb-3 inline-block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Public · unauthenticated
        </span>
        <h1 className="mb-3 text-3xl font-medium tracking-tight md:text-4xl">GraphQL API</h1>
        <p className="max-w-2xl text-foreground/70">
          One endpoint, cacheable, shaped for aggregation clients. Every RFP Hub operator exposes
          the same schema so a single aggregator can consume multiple instances.
        </p>
      </header>

      <Section title="Endpoint">
        <p className="mb-3 text-foreground/70">
          A single GraphQL endpoint backed by a Powerhouse switchboard. The reference deployment
          runs at:
        </p>
        <pre className="overflow-x-auto border border-border bg-foreground/[0.02] p-4 font-mono text-xs text-foreground/80">
          http://localhost:4001/graphql
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Override with <code className="font-mono">NEXT_PUBLIC_SWITCHBOARD_URL</code>. Any
          operator running their own instance can substitute their URL.
        </p>
      </Section>

      <Section title="Quick start">
        <pre className="overflow-x-auto border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-foreground/80">
          {ENDPOINT_BLOCK}
        </pre>
      </Section>

      <Section title="Schema">
        <pre className="overflow-x-auto border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-foreground/80">
          {SCHEMA_BLOCK}
        </pre>
      </Section>

      <Section title="DAOIP-5 alignment">
        <p className="text-foreground/70">
          The <code className="font-mono">Rfp</code> type aligns with DAOstar&apos;s{' '}
          <a
            href="https://daostar.org/EIPs/daoip-5"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            DAOIP-5 Grants Metadata Standard
          </a>
          . A <code className="font-mono">sourceHash</code> derived from{' '}
          <code className="font-mono">keccak256(funder + title + deadline)</code> enables
          cross-operator deduplication.
        </p>
      </Section>

      <Section title="Submitting RFPs">
        <p className="text-foreground/70">
          Read access is unauthenticated. Write access is signed — submissions dispatch an{' '}
          <code className="font-mono">addRfp</code> action to the reactor, authenticated via a
          Renown bearer token. Anyone can submit; verification is a separate processor step.
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}
