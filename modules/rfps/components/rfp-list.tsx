'use client'

import { useMemo } from 'react'
import { useRfps } from '../hooks'
import { RfpCard } from './rfp-card'
import { RfpFilters, useFilterState } from './rfp-filters'

export function RfpList() {
  const [filter, updateFilter] = useFilterState()

  const query = useRfps(
    {
      search: filter.search || undefined,
      category: filter.category ?? undefined,
      lifecycle: filter.lifecycle ?? undefined,
      grantFundingMechanism: filter.mechanism ?? undefined,
      ecosystem: filter.ecosystem ?? undefined,
    },
    50,
  )

  // A second, no-filter fetch populates the facet dropdowns with every
  // category / ecosystem currently indexed. React Query caches it.
  const facetQuery = useRfps({}, 200)

  const facets = useMemo(() => {
    const items = facetQuery.data?.items ?? []
    const categories = new Set<string>()
    const ecosystems = new Set<string>()
    for (const p of items) {
      for (const c of p.categories) categories.add(c)
      for (const e of p.ecosystems) ecosystems.add(e)
    }
    return {
      categories: Array.from(categories).sort(),
      ecosystems: Array.from(ecosystems).sort(),
    }
  }, [facetQuery.data])

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">Grant pools</h1>
        <p className="max-w-2xl text-foreground/70">
          Every open funding opportunity — RFPs, grants, retro funding rounds, bounties, QF rounds
          — indexed as a DAOIP-5 GrantPool. Queryable over a public GraphQL API.
        </p>
      </header>

      <div className="mb-10">
        <RfpFilters
          availableCategories={facets.categories}
          availableEcosystems={facets.ecosystems}
          filter={filter}
          onChange={updateFilter}
          totalMatching={total}
        />
      </div>

      {query.isLoading ? (
        <div className="font-mono text-sm text-muted-foreground">Loading…</div>
      ) : query.isError ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          Couldn&apos;t reach the switchboard. Start the backend with{' '}
          <code className="font-mono">ph switchboard</code> or configure{' '}
          <code className="font-mono">NEXT_PUBLIC_SWITCHBOARD_URL</code>.
        </div>
      ) : items.length === 0 ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          No grant pools match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((rfp) => (
            <RfpCard key={rfp.id} rfp={rfp} />
          ))}
        </div>
      )}
    </div>
  )
}
