'use client'

import { use } from 'react'
import { useRfp } from '@/modules/rfps'
import { RfpDetail } from '@/modules/rfps'

export default function RfpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: rfp, isLoading, isError } = useRfp(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 font-mono text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (isError || !rfp) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-3 text-2xl font-medium tracking-tight">RFP not found</h1>
        <p className="text-muted-foreground">
          This RFP may have been removed, or the switchboard isn&apos;t reachable.
        </p>
      </div>
    )
  }

  return <RfpDetail rfp={rfp} />
}
