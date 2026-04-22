'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchPublisher, fetchPublishers } from './graphql'

export function usePublishers() {
  return useQuery({
    queryKey: ['publishers'],
    queryFn: () => fetchPublishers(),
    staleTime: 60_000,
  })
}

export function usePublisher(id: string | null | undefined) {
  return useQuery({
    queryKey: ['publisher', id],
    queryFn: () => (id ? fetchPublisher(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

/**
 * Returns a lookup function for resolving a PHID → GrantSystem name.
 * Used by RfpCard / RfpDetail to render human-readable funder labels
 * instead of raw UUIDs.
 */
export function usePublisherLookup(): (ref: string | null | undefined) => string | null {
  const { data } = usePublishers()
  const byId = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of data ?? []) if (p.name) m.set(p.id, p.name)
    return m
  }, [data])
  return (ref) => (ref ? byId.get(ref) ?? null : null)
}
