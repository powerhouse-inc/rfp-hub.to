import { z } from 'zod'
import { RFP_STATUS_OPTIONS } from '../rfps/types'

export const submitRfpSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters.'),
  summary: z
    .string()
    .min(20, 'Summary should explain the funding opportunity in one or two sentences.')
    .max(280, 'Keep the summary under 280 characters.'),
  funder: z.string().min(2, 'Who is funding this RFP?'),
  funderUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  categories: z.string().min(1, 'At least one category helps others find this RFP.'),
  status: z.enum(RFP_STATUS_OPTIONS as [string, ...string[]]),
  deadline: z.string().optional().or(z.literal('')),
  fundingAmount: z.string().optional().or(z.literal('')),
  fundingCurrency: z.string().optional().or(z.literal('')),
  ecosystem: z.string().optional().or(z.literal('')),
  sourceUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  body: z.string().optional().or(z.literal('')),
})

export type SubmitRfpInput = z.infer<typeof submitRfpSchema>
