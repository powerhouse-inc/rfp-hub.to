'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import { Label } from '@/modules/shared/components/ui/label'
import { Textarea } from '@/modules/shared/components/ui/textarea'
import { createPublisher, type CreatePublisherResult } from '../dispatch'

const TYPES = ['DAO', 'FOUNDATION', 'PROTOCOL', 'COMPANY', 'PROGRAM', 'PERSON', 'OTHER'] as const

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional().or(z.literal('')),
  type: z.enum(TYPES),
  grantPoolsURI: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  email: z.string().email('Must be a valid email.').optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  code: z.string().optional().or(z.literal('')),
})

type Input = z.infer<typeof schema>

export function PublisherForm() {
  const qc = useQueryClient()
  const [result, setResult] = useState<CreatePublisherResult | null>(null)

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      type: 'FOUNDATION',
      grantPoolsURI: '',
      email: '',
      contactName: '',
      code: '',
    },
  })

  const onSubmit = async (values: Input) => {
    const r = await createPublisher(values)
    setResult(r)
    if (r.ok) {
      form.reset()
      // Invalidate the publishers list cache so the new entry shows up.
      await qc.invalidateQueries({ queryKey: ['publishers'] })
    }
  }

  if (result?.ok) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
          <div>
            <p className="mb-1 font-medium text-foreground">Publisher created</p>
            <p className="text-foreground/70">
              Document <span className="font-mono">{result.id}</span> is live on the reactor.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setResult(null)}>
            Add another
          </Button>
          <Link
            href="/publishers"
            className="inline-flex items-center rounded-md border border-transparent bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            View publishers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {result && !result.ok ? (
        <div className="flex items-start gap-3 border border-border bg-foreground/[0.02] p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <p className="mb-1 font-medium text-foreground">Submit failed</p>
            <p className="font-mono text-xs text-muted-foreground">{result.error}</p>
          </div>
        </div>
      ) : null}

      <Section title="The basics">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register('name')} placeholder="Ethereum Foundation" />
        </Field>
        <Field label="Description" error={form.formState.errors.description?.message}>
          <Textarea {...form.register('description')} rows={3} placeholder="Who are they and what do they fund?" />
        </Field>
      </Section>

      <Section title="Classification">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Type">
            <select
              {...form.register('type')}
              className="h-9 w-full appearance-none border border-input bg-background px-3 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Short code" hint="Optional abbreviation shown in the URL / badge.">
            <Input {...form.register('code')} placeholder="EF" />
          </Field>
        </div>
      </Section>

      <Section title="Links">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Grant pools URI" error={form.formState.errors.grantPoolsURI?.message}>
            <Input {...form.register('grantPoolsURI')} placeholder="https://esp.ethereum.foundation" />
          </Field>
          <Field label="Contact name">
            <Input {...form.register('contactName')} placeholder="Ecosystem Support" />
          </Field>
          <Field label="Contact email" error={form.formState.errors.email?.message}>
            <Input {...form.register('email')} placeholder="esp@ethereum.org" />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating…
            </>
          ) : (
            'Create publisher'
          )}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-6 last:border-b-0">
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</h2>
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
