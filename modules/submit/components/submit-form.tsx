'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRenown } from '@powerhousedao/reactor-browser'
import { Button } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import { Label } from '@/modules/shared/components/ui/label'
import { Textarea } from '@/modules/shared/components/ui/textarea'
import { RFP_STATUS_OPTIONS } from '@/modules/rfps'
import { submitRfp, type SubmitResult } from '../dispatch'
import { submitRfpSchema, type SubmitRfpInput } from '../schema'

export function SubmitForm() {
  const renown = useRenown()
  const isConnected = Boolean(renown)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const form = useForm<SubmitRfpInput>({
    resolver: zodResolver(submitRfpSchema),
    defaultValues: {
      status: 'OPEN',
      categories: '',
      title: '',
      summary: '',
      funder: '',
      funderUrl: '',
      deadline: '',
      fundingAmount: '',
      fundingCurrency: '',
      ecosystem: '',
      sourceUrl: '',
      body: '',
    },
  })

  const onSubmit = async (values: SubmitRfpInput) => {
    const r = await submitRfp(values)
    setResult(r)
    if (r.ok) form.reset()
  }

  if (result) {
    return <SubmitResultView result={result} onReset={() => setResult(null)} />
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {!isConnected ? (
        <div className="flex items-start gap-3 border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm">
          <AlertCircle
            className="mt-0.5 size-4 flex-shrink-0 text-[var(--accent)]"
            strokeWidth={1.5}
          />
          <div>
            <p className="mb-1 font-medium text-foreground">Sign in to submit</p>
            <p className="text-foreground/70">
              RFP submissions are signed with your Renown identity so we can track provenance.
              Use the &ldquo;Sign in&rdquo; button in the top nav.
            </p>
          </div>
        </div>
      ) : null}

      <Section title="The basics">
        <Field label="Title" error={form.formState.errors.title?.message}>
          <Input {...form.register('title')} placeholder="Round 5 Retro Funding" />
        </Field>
        <Field label="One-line summary" error={form.formState.errors.summary?.message}>
          <Textarea
            {...form.register('summary')}
            rows={3}
            placeholder="Retroactive funding for public goods that improved the Superchain this year."
          />
        </Field>
      </Section>

      <Section title="Funder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" error={form.formState.errors.funder?.message}>
            <Input {...form.register('funder')} placeholder="Optimism Foundation" />
          </Field>
          <Field label="Homepage" error={form.formState.errors.funderUrl?.message}>
            <Input {...form.register('funderUrl')} placeholder="https://optimism.io" />
          </Field>
        </div>
      </Section>

      <Section title="Classification">
        <Field
          label="Categories (comma-separated)"
          error={form.formState.errors.categories?.message}
          hint="e.g. Public Goods, Infrastructure, Retroactive Funding"
        >
          <Input {...form.register('categories')} placeholder="Public Goods, Infrastructure" />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Status">
            <select
              {...form.register('status')}
              className="h-9 w-full appearance-none border border-input bg-background px-3 text-sm"
            >
              {RFP_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <Input type="date" {...form.register('deadline')} />
          </Field>
          <Field label="Ecosystem">
            <Input {...form.register('ecosystem')} placeholder="Ethereum" />
          </Field>
        </div>
      </Section>

      <Section title="Funding">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Amount">
            <Input {...form.register('fundingAmount')} placeholder="1000000" />
          </Field>
          <Field label="Currency">
            <Input {...form.register('fundingCurrency')} placeholder="USDC" />
          </Field>
          <Field label="Source URL">
            <Input {...form.register('sourceUrl')} placeholder="https://example.com/rfp" />
          </Field>
        </div>
      </Section>

      <Section title="Details (optional)">
        <Field label="Full description">
          <Textarea
            {...form.register('body')}
            rows={6}
            placeholder="Scope, deliverables, eligibility criteria, judging rubric…"
          />
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting || !isConnected}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting…
            </>
          ) : (
            'Submit RFP'
          )}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-6 last:border-b-0">
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function SubmitResultView({
  result,
  onReset,
}: {
  result: SubmitResult
  onReset: () => void
}) {
  return (
    <div className="space-y-6">
      {result.ok ? (
        <div className="flex items-start gap-3 border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 flex-shrink-0 text-[var(--accent)]"
            strokeWidth={1.5}
          />
          <div>
            <p className="mb-1 font-medium text-foreground">Submitted</p>
            <p className="text-foreground/70">
              Document <span className="font-mono">{result.documentId}</span> is now indexed.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 border border-border bg-foreground/[0.02] p-4 text-sm">
          <AlertCircle
            className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.5}
          />
          <div>
            <p className="mb-1 font-medium text-foreground">Preview mode</p>
            <p className="text-foreground/70">
              The RFP document model isn&apos;t live yet — showing the DAOIP-5-compatible payload
              your submission would produce. Once{' '}
              <code className="font-mono">rfp-hub-app</code> is deployed, this form dispatches a
              signed <code className="font-mono">addRfp</code> action to the reactor.
            </p>
            {result.error ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">{result.error}</p>
            ) : null}
          </div>
        </div>
      )}
      <pre className="overflow-x-auto border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-foreground/80">
        {JSON.stringify(result.preview, null, 2)}
      </pre>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          Submit another
        </Button>
      </div>
    </div>
  )
}
