'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPublishers } from './graphql'

export function usePublishers() {
  return useQuery({
    queryKey: ['publishers'],
    queryFn: () => fetchPublishers(),
    staleTime: 60_000,
  })
}
