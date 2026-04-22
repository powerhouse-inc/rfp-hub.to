import type { Metadata } from 'next'
import { ExportsPage } from '@/modules/exports/exports-page'

export const metadata: Metadata = {
  title: 'Exports · RFP Hub',
  description:
    'Full-dataset snapshots, RSS/Atom feeds, webhooks, IPFS/Swarm mirrors, JSON-LD projections.',
}

export default function Page() {
  return <ExportsPage />
}
