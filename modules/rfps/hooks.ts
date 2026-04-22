'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchHubStats, fetchRfp, fetchRfps } from './graphql'
import type { RfpFilter } from './types'

export function useRfps(filter: RfpFilter, limit = 20, cursor: string | null = null) {
  return useQuery({
    queryKey: ['rfps', filter, limit, cursor],
    queryFn: () => fetchRfps(filter, limit, cursor),
    staleTime: 30_000,
  })
}

export function useRfp(id: string | null | undefined) {
  return useQuery({
    queryKey: ['rfp', id],
    queryFn: () => (id ? fetchRfp(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function useHubStats() {
  return useQuery({
    queryKey: ['hub-stats'],
    queryFn: () => fetchHubStats(),
    staleTime: 60_000,
  })
}
