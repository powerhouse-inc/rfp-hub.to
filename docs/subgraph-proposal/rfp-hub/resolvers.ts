/* eslint-disable @typescript-eslint/no-explicit-any */

interface ResolverDeps {
  reactor: any // @powerhousedao/reactor Reactor instance
}

interface RfpFilterInput {
  funder?: string | null
  category?: string | null
  status?: string | null
  ecosystem?: string | null
  deadlineBefore?: string | null
  deadlineAfter?: string | null
  search?: string | null
}

interface PaginationInput {
  limit?: number | null
  cursor?: string | null
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const RFP_DOC_TYPE = 'rfp-hub/rfp'
const PUBLISHER_DOC_TYPE = 'rfp-hub/publisher'

/**
 * Thin projection over raw Rfp documents. The document-model keeps the source
 * of truth; this reshapes it into the public API contract so clients never
 * depend on internal document-model field names.
 */
function projectRfp(doc: any) {
  const s = doc?.state?.global ?? doc?.state ?? {}
  const provenance = s.provenance ?? {}
  return {
    id: doc.id,
    slug: s.slug ?? doc.id,
    title: s.title ?? '',
    summary: s.summary ?? '',
    body: s.body ?? null,
    funder: s.funder ?? '',
    funderUrl: s.funderUrl ?? null,
    categories: s.categories ?? [],
    status: s.status ?? 'UPCOMING',
    deadline: s.deadline ?? null,
    fundingAmount: s.fundingAmount ?? null,
    fundingCurrency: s.fundingCurrency ?? null,
    ecosystem: s.ecosystem ?? null,
    sourceUrl: s.sourceUrl ?? null,
    provenance: {
      submitter: provenance.submitter ?? null,
      submittedAt: provenance.submittedAt ?? doc.createdAtUtcIso ?? new Date().toISOString(),
      verificationStatus: provenance.verificationStatus ?? 'UNVERIFIED',
      sourceHash: provenance.sourceHash ?? '',
    },
    createdAt: doc.createdAtUtcIso ?? new Date().toISOString(),
    updatedAt: doc.lastModifiedAtUtcIso ?? new Date().toISOString(),
  }
}

function matchesFilter(rfp: ReturnType<typeof projectRfp>, f: RfpFilterInput): boolean {
  if (f.funder && rfp.funder.toLowerCase() !== f.funder.toLowerCase()) return false
  if (f.category && !rfp.categories.map((c) => c.toLowerCase()).includes(f.category.toLowerCase()))
    return false
  if (f.status && rfp.status !== f.status) return false
  if (f.ecosystem && rfp.ecosystem !== f.ecosystem) return false
  if (f.deadlineBefore && rfp.deadline && rfp.deadline > f.deadlineBefore) return false
  if (f.deadlineAfter && rfp.deadline && rfp.deadline < f.deadlineAfter) return false
  if (f.search) {
    const q = f.search.toLowerCase()
    const hay = `${rfp.title} ${rfp.summary} ${rfp.funder} ${(rfp.categories ?? []).join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

export function createResolvers(deps: ResolverDeps) {
  const { reactor } = deps

  async function listRfpDocs(): Promise<any[]> {
    // The reactor API for enumerating documents by type varies across versions.
    // Adjust this to the right call in liberuum's chosen reactor-api version.
    if (typeof reactor?.findDocuments === 'function') {
      const { items } = await reactor.findDocuments({ documentType: RFP_DOC_TYPE })
      return items ?? []
    }
    if (typeof reactor?.getDocumentsByType === 'function') {
      return await reactor.getDocumentsByType(RFP_DOC_TYPE)
    }
    return []
  }

  async function listPublisherDocs(): Promise<any[]> {
    if (typeof reactor?.findDocuments === 'function') {
      const { items } = await reactor.findDocuments({ documentType: PUBLISHER_DOC_TYPE })
      return items ?? []
    }
    if (typeof reactor?.getDocumentsByType === 'function') {
      return await reactor.getDocumentsByType(PUBLISHER_DOC_TYPE)
    }
    return []
  }

  return {
    Query: {
      rfps: async (_: unknown, args: { filter?: RfpFilterInput; pagination?: PaginationInput }) => {
        const filter = args.filter ?? {}
        const limit = Math.min(args.pagination?.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
        const cursor = args.pagination?.cursor ?? null

        const docs = await listRfpDocs()
        const all = docs.map(projectRfp).filter((rfp) => matchesFilter(rfp, filter))
        // Deterministic order: newest first, break ties by id for stable cursors.
        all.sort((a, b) =>
          a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : b.createdAt.localeCompare(a.createdAt),
        )

        const startIdx = cursor ? Math.max(0, all.findIndex((r) => r.id === cursor) + 1) : 0
        const slice = all.slice(startIdx, startIdx + limit)
        const nextCursor = slice.length === limit ? slice[slice.length - 1].id : null

        return { items: slice, nextCursor, total: all.length }
      },

      rfp: async (_: unknown, args: { id: string }) => {
        const doc = await reactor?.getDocument?.(args.id)
        return doc ? projectRfp(doc) : null
      },

      rfpBySlug: async (_: unknown, args: { slug: string }) => {
        const docs = await listRfpDocs()
        const match = docs.map(projectRfp).find((r) => r.slug === args.slug)
        return match ?? null
      },

      publishers: async () => {
        const pubDocs = await listPublisherDocs()
        if (pubDocs.length > 0) {
          return pubDocs.map((doc: any) => {
            const s = doc?.state?.global ?? doc?.state ?? {}
            return {
              id: doc.id,
              name: s.name ?? doc.id,
              url: s.url ?? null,
              description: s.description ?? null,
              rfpCount: s.rfpCount ?? 0,
              verified: s.verified ?? false,
            }
          })
        }
        // Fallback: derive publisher list from Rfp documents by grouping on funder.
        const rfps = (await listRfpDocs()).map(projectRfp)
        const byFunder = new Map<string, { name: string; url: string | null; rfpCount: number }>()
        for (const r of rfps) {
          const existing = byFunder.get(r.funder) ?? { name: r.funder, url: r.funderUrl, rfpCount: 0 }
          existing.rfpCount += 1
          byFunder.set(r.funder, existing)
        }
        return Array.from(byFunder.entries()).map(([key, p]) => ({
          id: key,
          name: p.name,
          url: p.url,
          description: null,
          rfpCount: p.rfpCount,
          verified: false,
        }))
      },

      stats: async () => {
        const rfps = (await listRfpDocs()).map(projectRfp)
        const funders = new Set(rfps.map((r) => r.funder.toLowerCase()).filter(Boolean))
        return {
          totalRfps: rfps.length,
          openRfps: rfps.filter((r) => r.status === 'OPEN').length,
          totalFunders: funders.size,
          updatedAt: new Date().toISOString(),
        }
      },
    },
  }
}
