import { client, DRIVE_ID } from '@/modules/shared/client'
import type { SubmitRfpInput } from './schema'

export interface SubmitResult {
  ok: boolean
  documentId?: string
  preview: Record<string, unknown>
  error?: string
}

function buildPreviewDocument(input: SubmitRfpInput): Record<string, unknown> {
  return {
    type: 'rfp-hub/grant-pool',
    state: {
      grantSystemRef: null,
      name: input.name,
      description: input.description,
      grantFundingMechanism: input.grantFundingMechanism,
      isOpen: input.lifecycle === 'OPEN',
      openDate: input.openDate || null,
      closeDate: input.closeDate || null,
      applicationsURI: input.applicationsURI || null,
      governanceURI: null,
      attestationIssuersURI: null,
      requiredCredentials: [],
      totalGrantPoolSize: [],
      totalGrantPoolSizeInUSD: input.totalGrantPoolSizeInUSD || null,
      minGrant: [],
      maxGrant: [],
      email: null,
      image: null,
      coverImage: null,
      extensions: null,
      sameAs: [],
      code: null,
      briefingURI: input.briefingURI || null,
      eligibilityCriteria: input.eligibilityCriteria || null,
      evaluationCriteria: input.evaluationCriteria || null,
      contextDocuments: [],
      reviewers: [],
      categories: input.categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      ecosystems: input.ecosystem ? [input.ecosystem] : [],
      tags: [],
      lifecycle: input.lifecycle,
      // submitter is filled in server-side from the signed bearer token
      submitter: null,
      publisher: null,
      lastVerifiedAt: null,
      verificationMethod: null,
      verifiedBy: null,
      // Community submissions start as PENDING; governance decides later.
      governanceState: 'PENDING',
      supersedes: null,
      claimedFromEntry: null,
      duplicateOf: null,
      _derivedFunder: input.funder,
      _derivedFunderUrl: input.funderUrl || null,
    },
  }
}

/**
 * Attempts to dispatch an `addGrantPool` action to the reactor. If the
 * document model isn't live yet (or the switchboard is unreachable), returns
 * a preview payload so the user sees the DAOIP-5-shaped submission that
 * *would* have been dispatched.
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
      type: 'rfp-hub/grant-pool',
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
