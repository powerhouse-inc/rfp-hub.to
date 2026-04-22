import { z } from 'zod'

export const envSchema = z.object({
  // public env variables
  NEXT_PUBLIC_SWITCHBOARD_URL: z.url({
    error:
      'Must be a valid URL (e.g., http://localhost:4001/graphql) for the RFP Hub switchboard.',
  }),
  NEXT_PUBLIC_RFP_HUB_DRIVE_ID: z
    .string()
    .min(1, 'RFP Hub drive ID is required.')
    .default('rfp-hub'),
})
