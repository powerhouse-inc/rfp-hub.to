import type { Metadata } from 'next'
import { HomePage } from '@/modules/home'

export const metadata: Metadata = {
  title: 'RFP Hub · The open layer for web3 funding opportunities',
  description:
    'A neutral, DAOIP-5-aligned layer for web3 RFPs, grants, and retro funding rounds. One signed schema, many projections — GraphQL, JSON-LD, RSS, IPFS. No gatekeeper.',
}

export default function Page() {
  return <HomePage />
}
