'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { applyToPool, type ApplyToPoolData } from '../apply-to-pool'
import type { GrantPool } from '../types'
import { poolIsActive } from '../types'
import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/shared/components/ui/dialog'

type Props = {
  rfp: GrantPool
  triggerLabel?: string
  triggerClassName?: string
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

function shortId(id: string): string {
  if (id.length <= 20) return id
  return `${id.slice(0, 10)}…${id.slice(-6)}`
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function ApplyToGrantDialog({
  rfp,
  triggerLabel = 'Apply to this grant',
  triggerClassName,
  size = 'default',
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ApplyToPoolData | null>(null)
  const [copied, setCopied] = useState(false)

  const canApply = poolIsActive(rfp)
  const poolName = rfp.name?.trim() || 'Untitled grant pool'

  const trimmedName = applicantName.trim()
  const trimmedEmail = applicantEmail.trim()
  const emailValid = trimmedEmail === '' || isValidEmail(trimmedEmail)
  const readyToSubmit =
    trimmedName.length > 0 && emailValid && confirmed && !pending

  function reset() {
    setApplicantName('')
    setApplicantEmail('')
    setConfirmed(false)
    setError(null)
    setResult(null)
    setCopied(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setTimeout(reset, 0)
    }
  }

  async function handleSubmit() {
    setPending(true)
    setError(null)
    try {
      const out = await applyToPool({
        grantPoolId: rfp.id,
        applicantName: trimmedName,
        applicantEmail: trimmedEmail || undefined,
      })
      if (out.success && out.data) {
        setResult(out.data)
      } else {
        setError(out.errors?.join(' ') || 'Request failed')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  async function copyLink() {
    if (!result?.redirectUrl) return
    try {
      await navigator.clipboard.writeText(result.redirectUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          className={triggerClassName}
          disabled={!canApply}
          title={!canApply ? 'This grant is not open for new applications' : undefined}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md gap-0 p-0 sm:max-w-lg">
        {!result ? (
          <div className="flex max-h-[min(85vh,640px)] flex-col">
            <div className="space-y-6 overflow-y-auto px-6 pt-6 pb-2">
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="text-xl leading-tight pr-6">Apply to {poolName}</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-4 text-left text-sm leading-relaxed text-foreground/80">
                    <p>
                      This creates your personal applicant workspace in Powerhouse Connect and a new
                      grant application for this pool. You can continue editing in Connect.
                    </p>
                    <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/50">
                        Grant pool id
                      </span>
                      <br />
                      {shortId(rfp.id)}
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <section className="space-y-4" aria-labelledby="apply-identity-heading">
                <h3
                  id="apply-identity-heading"
                  className="text-sm font-semibold tracking-tight text-foreground"
                >
                  Who is applying?
                </h3>
                <div className="space-y-1.5">
                  <label
                    htmlFor="apply-name"
                    className="text-xs font-medium uppercase tracking-wider text-foreground/60"
                  >
                    Name or team <span className="text-rose-600/90 dark:text-rose-400/90">*</span>
                  </label>
                  <input
                    id="apply-name"
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Alice Chen, Protocol Guild, AnonBuilder"
                    autoComplete="name"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-describedby="apply-name-hint"
                    disabled={pending}
                  />
                  <p id="apply-name-hint" className="text-xs text-muted-foreground">
                    Used in your applicant drive name and project profile — so reviewers can tell you
                    apart from other applicants.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="apply-email"
                    className="text-xs font-medium uppercase tracking-wider text-foreground/60"
                  >
                    Contact email (optional)
                  </label>
                  <input
                    id="apply-email"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="you@project.xyz"
                    autoComplete="email"
                    className={`w-full rounded-md border ${
                      emailValid ? 'border-border' : 'border-rose-500 dark:border-rose-500'
                    } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                    aria-describedby="apply-email-hint"
                    disabled={pending}
                  />
                  <p id="apply-email-hint" className="text-xs text-muted-foreground">
                    {emailValid
                      ? 'Saved on your project profile. Reviewers use it for follow-up.'
                      : 'Please enter a valid email address.'}
                  </p>
                </div>
              </section>

              <section
                className="rounded-lg border border-border bg-foreground/[0.02] py-4 pl-4 pr-3"
                aria-labelledby="apply-agreement-heading"
              >
                <h3
                  id="apply-agreement-heading"
                  className="mb-3 text-sm font-semibold tracking-tight text-foreground"
                >
                  Agreement required
                </h3>
                <p className="mb-4 text-xs leading-relaxed text-foreground/80">
                  You must check the box below to continue. This confirms you are ready for us to
                  create your drive and application on the Switchboard.
                </p>
                <div className="flex gap-3.5 rounded-md border border-border bg-background p-3.5">
                  <Checkbox
                    id="apply-confirm"
                    checked={confirmed}
                    onCheckedChange={(c) => setConfirmed(c === true)}
                    className="mt-0.5 size-5 shrink-0 border-2 border-foreground/35 bg-background shadow-sm data-[state=checked]:border-primary"
                    aria-describedby="apply-confirm-hint"
                  />
                  <div className="min-w-0 space-y-1">
                    <label
                      htmlFor="apply-confirm"
                      className="text-sm font-medium leading-snug text-foreground"
                    >
                      I agree: create a new applicant drive and grant application for this pool on
                      the Switchboard, and show me a link to open them in Connect.
                    </label>
                    <p id="apply-confirm-hint" className="text-xs text-muted-foreground">
                      {!trimmedName ? (
                        <span className="font-medium text-rose-600/95 dark:text-rose-400/90">
                          Enter your name above first.
                        </span>
                      ) : !emailValid ? (
                        <span className="font-medium text-rose-600/95 dark:text-rose-400/90">
                          Fix the email or leave it blank.
                        </span>
                      ) : confirmed ? (
                        <span className="text-foreground/80">You can continue.</span>
                      ) : (
                        <span className="font-medium text-rose-600/95 dark:text-rose-400/90">
                          Check the box to enable &quot;Create &amp; get link&quot;.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="mt-auto border-t border-border bg-muted/25 px-6 py-4 sm:py-5">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="outline"
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  void handleSubmit()
                }}
                disabled={!readyToSubmit}
                title={
                  !trimmedName
                    ? 'Enter your name to continue'
                    : !emailValid
                      ? 'Fix the email format'
                      : !confirmed
                        ? 'Check the agreement box above to continue'
                        : undefined
                }
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create & get link'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 px-6 py-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle>Your applicant workspace is ready</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Open Connect to work on your application. The link was generated by the RFP Hub
                Switchboard (same as your local Connect defaults when running Vetra).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md border border-border bg-foreground/[0.02] p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Open in Connect</p>
              <a
                href={result.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex break-all text-sm text-primary hover:underline"
              >
                {result.redirectUrl}
                <ExternalLink className="ml-1 inline size-3.5 flex-shrink-0" />
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={result.redirectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Open Connect
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void copyLink()
                }}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Application id: <span className="font-mono">{shortId(result.applicationId)}</span>
            </p>
            <DialogFooter className="border-t border-border pt-4 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
