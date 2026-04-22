'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApplicationsFromURI } from './graphql'

/**
 * Fetch applications from an upstream DAOIP-5 applications-URI (e.g. the
 * `applicationsURI` field on a GrantPool document). Cached for 5 minutes —
 * upstream JSON files don't change often.
 */
export function useApplicationsFromURI(uri: string | null | undefined) {
  return useQuery({
    queryKey: ['applications-uri', uri],
    queryFn: () => (uri ? fetchApplicationsFromURI(uri) : Promise.resolve([])),
    enabled: Boolean(uri),
    staleTime: 5 * 60_000,
  })
}
