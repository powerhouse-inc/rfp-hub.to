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
import { FUNDING_MECHANISM_OPTIONS, LIFECYCLE_OPTIONS } from '@/modules/rfps'
import { submitRfp, type SubmitResult } from '../dispatch'
import { submitRfpSchema, type SubmitRfpInput } from '../schema'

export function SubmitForm() {
  const renown = useRenown()
  const isConnected = Boolean(renown)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const form = useForm<SubmitRfpInput>({
    resolver: zodResolver(submitRfpSchema),
    defaultValues: {
      name: '',
      description: '',
      funder: '',
      funderUrl: '',
      categories: '',
      grantFundingMechanism: 'REQUEST_FOR_PROPOSAL',
      lifecycle: 'OPEN',
      closeDate: '',
      openDate: '',
      totalGrantPoolSizeInUSD: '',
      ecosystem: '',
      applicationsURI: '',
      briefingURI: '',
      eligibilityCriteria: '',
      evaluationCriteria: '',
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
              Submissions are signed with your Renown identity so provenance is tracked on the
              operation log. Use the &ldquo;Log in&rdquo; button in the top nav.
            </p>
          </div>
        </div>
      ) : null}

      <Section title="The basics">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register('name')} placeholder="Round 5 Retro Funding" />
        </Field>
        <Field
          label="Description"
          error={form.formState.errors.description?.message}
          hint="One or two sentences. Shown on cards and list."
        >
          <Textarea
            {...form.register('description')}
            rows={3}
            placeholder="Retroactive funding for public goods that improved the Superchain this year."
          />
        </Field>
      </Section>

      <Section title="Funder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Name"
            error={form.formState.errors.funder?.message}
            hint="Proxy until a GrantSystem document is linked."
          >
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
          <Field label="Mechanism">
            <select
              {...form.register('grantFundingMechanism')}
              className="h-9 w-full appearance-none border border-input bg-background px-3 text-sm"
            >
              {FUNDING_MECHANISM_OPTIONS.map((s: string) => (
                <option key={s} value={s}>
                  {s.toLowerCase().replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lifecycle">
            <select
              {...form.register('lifecycle')}
              className="h-9 w-full appearance-none border border-input bg-background px-3 text-sm"
            >
              {LIFECYCLE_OPTIONS.map((s: string) => (
                <option key={s} value={s}>
                  {s.toLowerCase().replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ecosystem">
            <Input {...form.register('ecosystem')} placeholder="Ethereum" />
          </Field>
        </div>
      </Section>

      <Section title="Timing">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Opens">
            <Input type="date" {...form.register('openDate')} />
          </Field>
          <Field label="Closes">
            <Input type="date" {...form.register('closeDate')} />
          </Field>
        </div>
      </Section>

      <Section title="Funding">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Total pool size (USD)">
            <Input
              {...form.register('totalGrantPoolSizeInUSD')}
              placeholder="1000000"
              inputMode="numeric"
            />
          </Field>
          <Field label="Applications URI">
            <Input
              {...form.register('applicationsURI')}
              placeholder="https://example.com/apply"
            />
          </Field>
        </div>
      </Section>

      <Section title="Details (optional)">
        <Field label="Briefing URI">
          <Input {...form.register('briefingURI')} placeholder="https://example.com/brief" />
        </Field>
        <Field label="Eligibility criteria">
          <Textarea
            {...form.register('eligibilityCriteria')}
            rows={3}
            placeholder="Who can apply?"
          />
        </Field>
        <Field label="Evaluation criteria">
          <Textarea
            {...form.register('evaluationCriteria')}
            rows={3}
            placeholder="How are applications judged?"
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
            'Submit grant pool'
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
              Document <span className="font-mono">{result.documentId}</span> is indexed and
              awaiting governance review.
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
              The reactor isn&apos;t reachable — showing the GrantPool document your submission
              would produce. Once a switchboard is live at{' '}
              <code className="font-mono">NEXT_PUBLIC_SWITCHBOARD_URL</code>, this form dispatches
              a signed <code className="font-mono">rfp-hub/grant-pool</code> create action.
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
