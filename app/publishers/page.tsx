import type { Metadata } from 'next'
import { PublishersGrid } from '@/modules/publishers'

export const metadata: Metadata = {
  title: 'Publishers · RFP Hub',
  description: 'Funders and grant programs indexed on the RFP Hub.',
}

export default function PublishersPage() {
  return <PublishersGrid />
}
