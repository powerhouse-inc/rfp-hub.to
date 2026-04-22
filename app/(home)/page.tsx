import type { Metadata } from 'next'
import { HomePage } from '@/modules/home'

export const metadata: Metadata = {
  title: 'RFP Hub · The open index of web3 funding opportunities',
  description:
    'An open, neutral, DAOIP-5-aligned index of web3 RFPs, grants, and retro funding rounds. Public GraphQL API for aggregation clients.',
}

export default function Page() {
  return <HomePage />
}
