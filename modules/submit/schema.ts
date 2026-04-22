import { z } from 'zod'
import { FUNDING_MECHANISM_OPTIONS, LIFECYCLE_OPTIONS } from '../rfps/types'

export const submitRfpSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters.'),
  description: z
    .string()
    .min(20, 'Summary should explain the funding opportunity in one or two sentences.')
    .max(500, 'Keep the description under 500 characters.'),
  funder: z.string().min(2, 'Who is funding this grant pool?'),
  funderUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  categories: z.string().min(1, 'At least one category helps others find this pool.'),
  grantFundingMechanism: z.enum(FUNDING_MECHANISM_OPTIONS as [string, ...string[]]),
  lifecycle: z.enum(LIFECYCLE_OPTIONS as [string, ...string[]]),
  closeDate: z.string().optional().or(z.literal('')),
  openDate: z.string().optional().or(z.literal('')),
  totalGrantPoolSizeInUSD: z.string().optional().or(z.literal('')),
  ecosystem: z.string().optional().or(z.literal('')),
  applicationsURI: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  briefingURI: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  eligibilityCriteria: z.string().optional().or(z.literal('')),
  evaluationCriteria: z.string().optional().or(z.literal('')),
})

export type SubmitRfpInput = z.infer<typeof submitRfpSchema>
