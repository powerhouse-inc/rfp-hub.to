import type { Metadata } from 'next'
import { RfpList } from '@/modules/rfps'

export const metadata: Metadata = {
  title: 'RFPs · RFP Hub',
  description: 'Search open funding opportunities indexed across web3.',
}

export default function RfpsPage() {
  return <RfpList />
}
