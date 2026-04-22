'use client'

import { use } from 'react'
import { PublisherDetail } from '@/modules/publishers/components/publisher-detail'

export default function PublisherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <PublisherDetail id={id} />
}
