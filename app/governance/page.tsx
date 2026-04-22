import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, GitCommit, Scale, ShieldAlert, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Governance · RFP Hub',
  description:
    'The publisher allowlist, dispute queue, and schema-evolution RFC process — all expressed as a first-class Document Model.',
}

const POLICIES = [
  {
    icon: Users,
    title: 'Publisher allowlist',
    status: 'Live',
    body:
      'Verified publisher status is an entry in the rfp-hub-governance Document Model. Granting, revoking, and reinstating status are all signed operations with a public audit trail.',
    linkLabel: 'View allowlist operations',
    linkHref: '#allowlist',
  },
  {
    icon: ShieldAlert,
    title: 'Dispute lifecycle',
    status: 'Live',
    body:
      'File → investigate → resolve → appeal. Each transition is an operation on the rfp-hub-governance model. The full dispute record is preserved even after resolution.',
    linkLabel: 'Dispute runbook',
    linkHref: '#disputes',
  },
  {
    icon: GitCommit,
    title: 'Schema-evolution RFC',
    status: 'Live',
    body:
      'Changes to the RFP object format are proposed as RFC documents signed by proposers, reviewed against documented quorum rules, and released under semantic versioning.',
    linkLabel: 'Open RFCs',
    linkHref: '#rfcs',
  },
  {
    icon: Scale,
    title: 'Ranking policy',
    status: 'None currently',
    body:
      'Default list order is deadline ascending, then created-at. There is no ranking. Any future change flows through the RFC process above, publicly documented before adoption.',
    linkLabel: 'Current sort contract',
    linkHref: '#ranking',
  },
  {
    icon: BookOpen,
    title: 'Stale-entry archival',
    status: 'Automatic',
    body:
      'Entries past their deadline are auto-archived and remain queryable via the archived filter. Corrections apply as update operations with provenance intact.',
    linkLabel: 'Archival reducer',
    linkHref: '#archival',
  },
]

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14 border-b border-border pb-10">
        <span className="mb-3 inline-block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Governance as document
        </span>
        <h1 className="mb-4 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          The rules are a document. <br />
          Changing them is an operation.
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">
          Publisher allowlist, dispute queue, RFC process, stale-entry archival — all expressed as
          a first-class Powerhouse Document Model. Policy changes leave the same signed audit
          trail as data changes.
        </p>
      </header>

      <section className="mb-14 space-y-6">
        {POLICIES.map((p) => (
          <article
            key={p.title}
            id={p.linkHref.replace('#', '')}
            className="grid grid-cols-1 gap-6 border-b border-border pb-6 md:grid-cols-[3rem_1fr_auto] md:gap-10"
          >
            <div className="flex size-10 items-center justify-center border border-border">
              <p.icon className="size-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h3 className="text-lg font-medium tracking-tight">{p.title}</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.status}
                </span>
              </div>
              <p className="text-foreground/70">{p.body}</p>
            </div>
            <Link
              href={p.linkHref}
              className="hidden items-center gap-1 self-start font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground md:inline-flex"
            >
              {p.linkLabel} <ArrowRight className="size-3" strokeWidth={1.5} />
            </Link>
          </article>
        ))}
      </section>

      <section className="border border-border p-6 md:p-8">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Why governance-as-document matters
        </h2>
        <p className="mb-4 text-foreground/80">
          In most registries, governance is out-of-band — a multisig setting, a hardcoded admin
          list, a YAML file hidden in CI. In RFP Hub, governance is <em>data</em>. Every
          allowlist change, every dispute verdict, every schema migration is a signed operation in
          the same event-sourced substrate as the RFPs themselves.
        </p>
        <p className="text-foreground/80">
          That means: versioning, signature verification, deterministic replay, and synchronization
          all come for free. Auditors can replay governance from the log. Forks can diverge on
          policy without losing interoperability on data. And any rule change leaves an
          indisputable record — because the rules live inside the same Document Model that the
          data does.
        </p>
      </section>
    </div>
  )
}
