'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, ExternalLink, Hash, Shield, User } from 'lucide-react'
import { useState } from 'react'
import type { Rfp } from '../types'
import { RfpStatusBadge } from './rfp-status-badge'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: string | null, currency: string | null): string {
  if (!amount) return '—'
  const n = Number(amount)
  if (Number.isNaN(n)) return `${amount}${currency ? ` ${currency}` : ''}`
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(n)}${currency ? ` ${currency}` : ''}`
}

export function RfpDetail({ rfp }: { rfp: Rfp }) {
  const [showJson, setShowJson] = useState(false)
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/rfps"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Back to all RFPs
      </Link>

      <header className="mb-10 border-b border-border pb-8">
        <div className="mb-4 flex items-center gap-3">
          <RfpStatusBadge status={rfp.status} />
          {rfp.provenance.verificationStatus === 'VERIFIED' ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
              <Shield className="size-3" strokeWidth={2} /> Verified
            </span>
          ) : null}
        </div>
        <h1 className="mb-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          {rfp.title}
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">{rfp.summary}</p>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_18rem]">
        <section className="space-y-8">
          {rfp.body ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-foreground/80">
              {rfp.body}
            </div>
          ) : null}
          {rfp.categories.length > 0 ? (
            <div>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {rfp.categories.map((c) => (
                  <span
                    key={c}
                    className="border border-border px-2 py-1 font-mono text-xs text-foreground/80"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <button
              type="button"
              onClick={() => setShowJson((v) => !v)}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {showJson ? 'Hide' : 'Show'} raw JSON (DAOIP-5-compatible)
            </button>
            {showJson ? (
              <pre className="mt-3 overflow-x-auto border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-foreground/80">
                {JSON.stringify(rfp, null, 2)}
              </pre>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6 border-l border-border pl-6 text-sm">
          <MetaRow icon={<Calendar className="size-3.5" strokeWidth={1.5} />} label="Deadline">
            {formatDate(rfp.deadline)}
          </MetaRow>
          <MetaRow label="Funder">
            {rfp.funderUrl ? (
              <Link
                href={rfp.funderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                {rfp.funder}
                <ExternalLink className="size-3" strokeWidth={1.5} />
              </Link>
            ) : (
              rfp.funder
            )}
          </MetaRow>
          <MetaRow label="Funding">
            <span className="font-mono">{formatAmount(rfp.fundingAmount, rfp.fundingCurrency)}</span>
          </MetaRow>
          <MetaRow label="Ecosystem">{rfp.ecosystem ?? '—'}</MetaRow>
          {rfp.sourceUrl ? (
            <MetaRow label="Source">
              <Link
                href={rfp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs hover:text-foreground"
              >
                {rfp.sourceUrl}
                <ExternalLink className="size-3 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            </MetaRow>
          ) : null}
          <div className="border-t border-border pt-6">
            <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Provenance
            </h4>
            <div className="space-y-2.5 text-xs">
              <MetaRow icon={<User className="size-3" strokeWidth={1.5} />} label="Submitter">
                <span className="font-mono">
                  {rfp.provenance.submitter
                    ? `${rfp.provenance.submitter.slice(0, 6)}…${rfp.provenance.submitter.slice(-4)}`
                    : 'system'}
                </span>
              </MetaRow>
              <MetaRow icon={<Calendar className="size-3" strokeWidth={1.5} />} label="Submitted">
                {formatDate(rfp.provenance.submittedAt)}
              </MetaRow>
              <MetaRow icon={<Shield className="size-3" strokeWidth={1.5} />} label="Status">
                {rfp.provenance.verificationStatus}
              </MetaRow>
              {rfp.provenance.sourceHash && rfp.provenance.sourceHash !== 'seed' ? (
                <MetaRow icon={<Hash className="size-3" strokeWidth={1.5} />} label="Source hash">
                  <span className="font-mono text-[10px] break-all">
                    {rfp.provenance.sourceHash}
                  </span>
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
    <div>
      <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-foreground/90">{children}</div>
    </div>
  )
}
