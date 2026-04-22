'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Hash,
  Shield,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { ApplicationCard, useApplicationsFromURI } from '@/modules/applications'
import { usePublisherLookup } from '@/modules/publishers'
import type { GrantPool } from '../types'
import { LIFECYCLE_LABEL } from '../types'
import { toDaoip5, toSchemaOrgGrant } from '../jsonld'
import { ApplyToGrantDialog } from './apply-to-grant-dialog'
import { RfpStatusBadge } from './rfp-status-badge'

type ExportView = 'raw' | 'daoip5' | 'schemaOrg'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmounts(pool: GrantPool): string {
  if (pool.totalGrantPoolSizeInUSD) {
    const n = Number(pool.totalGrantPoolSizeInUSD)
    if (!Number.isNaN(n)) {
      return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)} USD`
    }
  }
  if (pool.totalGrantPoolSize.length > 0) {
    return pool.totalGrantPoolSize
      .map((a) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(a.amount)))
      .join(' / ')
  }
  return '—'
}

function formatMechanism(m: GrantPool['grantFundingMechanism']): string {
  if (!m) return '—'
  return m
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatIdentifier(id: string | null | undefined): string {
  if (!id) return '—'
  if (id.startsWith('did:ethr:') && id.length > 20) {
    const addr = id.slice('did:ethr:'.length)
    return `did:ethr:${addr.slice(0, 6)}…${addr.slice(-4)}`
  }
  // Long pkh and other DIDs: shorten for display; full value still break-wraps in the UI.
  if (id.length > 48) {
    return `${id.slice(0, 24)}…${id.slice(-12)}`
  }
  return id
}

export function RfpDetail({ rfp }: { rfp: GrantPool }) {
  const [showJson, setShowJson] = useState(false)
  const [exportView, setExportView] = useState<ExportView>('raw')
  const lookupPublisher = usePublisherLookup()
  const funderName = lookupPublisher(rfp.grantSystemRef)
  // Applications aren't reactor documents — they come from the upstream
  // DAOIP-5 applications_uri.json. Fetch live so the page stays in sync
  // with whatever the funder publishes there.
  const applications = useApplicationsFromURI(rfp.applicationsURI)

  const exports: Record<ExportView, { label: string; payload: unknown }> = {
    raw: { label: 'Canonical', payload: rfp },
    daoip5: { label: 'DAOIP-5 GrantPool', payload: toDaoip5(rfp) },
    schemaOrg: { label: 'schema.org/MonetaryGrant', payload: toSchemaOrgGrant(rfp) },
  }

  const verified = rfp.governanceState === 'APPROVED'

  return (
    <article className="mx-auto w-full min-w-0 max-w-4xl overflow-x-hidden px-6 py-12">
      <Link
        href="/rfps"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Back to all grants
      </Link>

      <header className="mb-10 border-b border-border pb-8">
        <div className="mb-4 flex items-center gap-3">
          <RfpStatusBadge lifecycle={rfp.lifecycle} />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {formatMechanism(rfp.grantFundingMechanism)}
          </span>
          {verified ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
              <CheckCircle2 className="size-3" strokeWidth={2} /> Approved
            </span>
          ) : null}
        </div>
        <h1 className="mb-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          {rfp.name ?? 'Untitled grant pool'}
        </h1>
        {rfp.description ? (
          <p className="max-w-2xl text-lg text-foreground/70">{rfp.description}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ApplyToGrantDialog rfp={rfp} size="lg" triggerLabel="Apply to this grant" />
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0 space-y-8">
          {rfp.eligibilityCriteria ? (
            <CriteriaBlock title="Eligibility" body={rfp.eligibilityCriteria} />
          ) : null}
          {rfp.evaluationCriteria ? (
            <CriteriaBlock title="Evaluation" body={rfp.evaluationCriteria} />
          ) : null}

          {rfp.categories.length > 0 ? (
            <TagBlock title="Categories" tags={rfp.categories} />
          ) : null}
          {rfp.tags.length > 0 ? <TagBlock title="Tags" tags={rfp.tags} /> : null}
          {rfp.ecosystems.length > 0 ? (
            <TagBlock title="Ecosystems" tags={rfp.ecosystems} />
          ) : null}

          {rfp.contextDocuments.length > 0 ? (
            <div>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Context
              </h3>
              <ul className="space-y-1.5">
                {rfp.contextDocuments.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground"
                    >
                      <FileText className="size-3.5" strokeWidth={1.5} /> {d.name}
                      <ExternalLink className="size-3" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {(applications.data?.length ?? 0) > 0 ? (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Applications
                <span className="rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] text-foreground">
                  {applications.data?.length ?? 0}
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {applications.data?.slice(0, 6).map((a) => (
                  <ApplicationCard key={a.id} application={a} />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowJson((v) => !v)}
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {showJson ? 'Hide' : 'Show'} exports
              </button>
              {showJson ? (
                <div className="flex items-center gap-1 border border-border p-0.5">
                  {(Object.keys(exports) as ExportView[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setExportView(k)}
                      className={
                        exportView === k
                          ? 'bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-background'
                          : 'px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground'
                      }
                    >
                      {exports[k].label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {showJson ? (
              <div className="w-full min-w-0 max-w-full">
                <pre className="max-h-[min(70svh,32rem)] w-full min-w-0 max-w-full overflow-x-auto overflow-y-auto overscroll-contain border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-foreground/80">
                  {JSON.stringify(exports[exportView].payload, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="min-w-0 max-w-full space-y-6 overflow-x-hidden border-l border-border pl-6 text-sm md:max-w-[18rem]">
          <MetaRow icon={<Calendar className="size-3.5" strokeWidth={1.5} />} label="Opens">
            {formatDate(rfp.openDate)}
          </MetaRow>
          <MetaRow icon={<Calendar className="size-3.5" strokeWidth={1.5} />} label="Closes">
            {formatDate(rfp.closeDate)}
          </MetaRow>
          <MetaRow label="Mechanism">{formatMechanism(rfp.grantFundingMechanism)}</MetaRow>
          <MetaRow label="Pool size">
            <span className="font-mono">{formatAmounts(rfp)}</span>
          </MetaRow>
          {rfp.grantSystemRef ? (
            <MetaRow label="Funder">
              <Link
                href={`/publishers/${encodeURIComponent(rfp.grantSystemRef)}`}
                className="break-all text-sm hover:text-foreground"
              >
                {funderName ?? formatIdentifier(rfp.grantSystemRef)}
              </Link>
            </MetaRow>
          ) : null}
          {rfp.applicationsURI ? (
            <MetaRow label="Applications">
              <Link
                href={rfp.applicationsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs hover:text-foreground"
              >
                {rfp.applicationsURI}
                <ExternalLink className="size-3 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            </MetaRow>
          ) : null}
          {rfp.briefingURI ? (
            <MetaRow label="Briefing">
              <Link
                href={rfp.briefingURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs hover:text-foreground"
              >
                {rfp.briefingURI}
                <ExternalLink className="size-3 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            </MetaRow>
          ) : null}
          {rfp.email ? (
            <MetaRow label="Contact">
              <Link
                href={`mailto:${rfp.email}`}
                className="font-mono text-xs hover:text-foreground"
              >
                {rfp.email}
              </Link>
            </MetaRow>
          ) : null}
          <div className="border-t border-border pt-6">
            <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Provenance
            </h4>
            <div className="space-y-2.5 text-xs">
              <MetaRow icon={<User className="size-3" strokeWidth={1.5} />} label="Submitter">
                {rfp.submitter ? (
                  <div className="flex min-w-0 max-w-full flex-col gap-1">
                    <span className="w-full min-w-0 break-all font-mono text-xs">
                      {formatIdentifier(rfp.submitter.identifier)}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {rfp.submitter.type}
                    </span>
                  </div>
                ) : (
                  '—'
                )}
              </MetaRow>
              <MetaRow icon={<Calendar className="size-3" strokeWidth={1.5} />} label="Submitted">
                {formatDate(rfp.submitter?.submittedAt ?? null)}
              </MetaRow>
              <MetaRow icon={<Shield className="size-3" strokeWidth={1.5} />} label="Governance">
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {rfp.governanceState}
                </span>
              </MetaRow>
              {rfp.verificationMethod ? (
                <MetaRow icon={<Shield className="size-3" strokeWidth={1.5} />} label="Verified via">
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    {rfp.verificationMethod}
                  </span>
                </MetaRow>
              ) : null}
              {rfp.duplicateOf ? (
                <MetaRow icon={<Hash className="size-3" strokeWidth={1.5} />} label="Duplicate of">
                  <span className="font-mono text-[10px] break-all">{rfp.duplicateOf}</span>
                </MetaRow>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-1 flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        <span className="min-w-0 break-words">{label}</span>
      </div>
      <div className="min-w-0 max-w-full text-foreground/90 [overflow-wrap:anywhere]">{children}</div>
    </div>
  )
}

function TagBlock({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="border border-border px-2 py-1 font-mono text-xs text-foreground/80">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function CriteriaBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">{body}</p>
    </div>
  )
}

// Keeps label mapping used above alive for exhaustive lifecycle coverage.
void LIFECYCLE_LABEL
