'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApplications, fetchApplicationsForPool } from './graphql'

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => fetchApplications(),
    staleTime: 30_000,
  })
}

export function useApplicationsForPool(poolId: string | null | undefined) {
  return useQuery({
    queryKey: ['applications', 'pool', poolId],
    queryFn: () => (poolId ? fetchApplicationsForPool(poolId) : Promise.resolve([])),
    enabled: Boolean(poolId),
    staleTime: 30_000,
  })
}
