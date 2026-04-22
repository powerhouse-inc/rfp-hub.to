'use client'

import { useMemo } from 'react'
import { useRfps } from '../hooks'
import { RfpCard } from './rfp-card'
import { RfpFilters, useFilterState } from './rfp-filters'

export function RfpList() {
  const [filter, updateFilter] = useFilterState()

  // Fetch with "server-side" filters (subgraph handles them, or the fallback
  // does them in-memory — either way the UI doesn't care).
  const query = useRfps(
    {
      search: filter.search || undefined,
      funder: filter.funder ?? undefined,
      category: filter.category ?? undefined,
      status: filter.status ?? undefined,
      ecosystem: filter.ecosystem ?? undefined,
    },
    50,
  )

  // For the facet dropdowns we want *all* values, not just the filtered ones.
  // A second "no-filter" fetch powers that; it's cached in React Query.
  const facetQuery = useRfps({}, 200)

  const facets = useMemo(() => {
    const items = facetQuery.data?.items ?? []
    const funders = new Set<string>()
    const categories = new Set<string>()
    const ecosystems = new Set<string>()
    for (const r of items) {
      if (r.funder) funders.add(r.funder)
      for (const c of r.categories) categories.add(c)
      if (r.ecosystem) ecosystems.add(r.ecosystem)
    }
    return {
      funders: Array.from(funders).sort(),
      categories: Array.from(categories).sort(),
      ecosystems: Array.from(ecosystems).sort(),
    }
  }, [facetQuery.data])

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">RFPs</h1>
        <p className="max-w-2xl text-foreground/70">
          Open funding opportunities indexed across web3 — aligned with DAOIP-5, queryable over a
          public GraphQL API.
        </p>
      </header>

      <div className="mb-10">
        <RfpFilters
          availableFunders={facets.funders}
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
          No RFPs match these filters.
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
