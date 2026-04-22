import { client, DRIVE_ID } from '@/modules/shared/client'
import type { SubmitRfpInput } from './schema'

export interface SubmitResult {
  ok: boolean
  documentId?: string
  preview: Record<string, unknown>
  error?: string
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

function buildPreviewDocument(input: SubmitRfpInput): Record<string, unknown> {
  return {
    type: 'rfp-hub/rfp',
    state: {
      slug: slugify(input.title),
      title: input.title,
      summary: input.summary,
      body: input.body || null,
      funder: input.funder,
      funderUrl: input.funderUrl || null,
      categories: input.categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      status: input.status,
      deadline: input.deadline || null,
      fundingAmount: input.fundingAmount || null,
      fundingCurrency: input.fundingCurrency || null,
      ecosystem: input.ecosystem || null,
      sourceUrl: input.sourceUrl || null,
      provenance: {
        submitter: null, // filled in server-side from the signed bearer token
        submittedAt: new Date().toISOString(),
        verificationStatus: 'UNVERIFIED',
        sourceHash: '', // computed server-side by the duplicate-detection processor
      },
    },
  }
}

/**
 * Attempts to dispatch an `addRfp` action to the reactor. If the document
 * model isn't published yet (or the switchboard is unreachable), returns a
 * preview payload instead so the user sees what *would* have been submitted.
 */
export async function submitRfp(input: SubmitRfpInput): Promise<SubmitResult> {
  const preview = buildPreviewDocument(input)

  try {
    const reactor = client as unknown as {
      createDocument?: (opts: {
        driveId: string
        type: string
        state: unknown
      }) => Promise<{ id: string }>
    }

    if (typeof reactor.createDocument !== 'function') {
      return {
        ok: false,
        preview,
        error:
          "Reactor client doesn't support createDocument in this build — showing preview only.",
      }
    }

    const doc = await reactor.createDocument({
      driveId: DRIVE_ID,
      type: 'rfp-hub/rfp',
      state: (preview as { state: unknown }).state,
    })
    return { ok: true, documentId: doc.id, preview }
  } catch (err) {
    return {
      ok: false,
      preview,
      error: (err as Error)?.message ?? 'Unknown error',
    }
  }
}
