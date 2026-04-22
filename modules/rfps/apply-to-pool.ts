import { getEndpoint, gqlAt } from '@/modules/shared/client'

/** Switchboard mounts each subgraph at `/graphql/<subgraph-name>` (e.g. `apply-to` from rfp-hub-app). */
export function getApplyToSubgraphUrl(): string {
  const e = getEndpoint().replace(/\/$/, '')
  const base = e.replace(/\/graphql\/?$/, '')
  return `${base}/graphql/apply-to`
}

export type ApplyToPoolData = {
  driveId: string
  applicationId: string
  projectId: string
  driveSlug: string
  redirectUrl: string
}

type ApplyToPoolResult = {
  success: boolean
  data: ApplyToPoolData | null
  errors: string[]
}

type GqlResult = { applyToPool: ApplyToPoolResult }

const MUTATION = `mutation ApplyToPool($input: ApplyToPoolInput!) {
  applyToPool(input: $input) {
    success
    data {
      driveId
      applicationId
      projectId
      driveSlug
      redirectUrl
    }
    errors
  }
}`

export type ApplyToPoolArgs = {
  grantPoolId: string
  applicantName: string
  applicantEmail?: string
}

/**
 * Provisions an applicant Connect drive + pre-filled application via the rfp-hub-app `apply-to` subgraph.
 * `applicantName` is required so the drive display name, slug, and project identity stay
 * distinct across multiple applicants applying to the same pool.
 */
export async function applyToPool(
  args: ApplyToPoolArgs,
): Promise<ApplyToPoolResult> {
  const url = getApplyToSubgraphUrl()
  const data = await gqlAt<GqlResult>(url, MUTATION, {
    input: {
      grantPoolId: args.grantPoolId,
      applicantName: args.applicantName,
      applicantEmail: args.applicantEmail || null,
    },
  })
  return data.applyToPool
}
