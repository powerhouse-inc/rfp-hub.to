import type { GrantPool } from './types'

/**
 * Projects the canonical GrantPool into a DAOstar DAOIP-5 GrantPool JSON-LD
 * document. Spec: https://daostar.org/EIPs/daoip-5
 *
 * The canonical model is insulated; this projection absorbs any upstream
 * schema drift without altering the core Document Model.
 *
 * Dedicated to the public domain under CC0 — see SCHEMA-LICENSE.md.
 */
export function toDaoip5(pool: GrantPool): Record<string, unknown> {
  return {
    '@context': 'https://www.daostar.org/context/DAOIP-5.jsonld',
    '@id': `urn:rfp-hub:pool:${pool.id}`,
    '@type': 'GrantPool',
    type: 'GrantPool',
    name: pool.name ?? undefined,
    description: pool.description ?? undefined,
    grantFundingMechanism: pool.grantFundingMechanism ?? undefined,
    isOpen: pool.isOpen,
    closeDate: pool.closeDate ?? undefined,
    openDate: pool.openDate ?? undefined,
    applicationsURI: pool.applicationsURI ?? undefined,
    governanceURI: pool.governanceURI ?? undefined,
    attestationIssuersURI: pool.attestationIssuersURI ?? undefined,
    requiredCredentials: pool.requiredCredentials,
    totalGrantPoolSize: pool.totalGrantPoolSize.map((fa) => ({ amount: fa.amount })),
    totalGrantPoolSizeInUSD: pool.totalGrantPoolSizeInUSD ?? undefined,
    minGrant: pool.minGrant.map((fa) => ({ amount: fa.amount })),
    maxGrant: pool.maxGrant.map((fa) => ({ amount: fa.amount })),
    email: pool.email ?? undefined,
    image: pool.image ?? undefined,
    coverImage: pool.coverImage ?? undefined,
    extensions: pool.extensions ?? undefined,
    sameAs: pool.sameAs.length > 0 ? pool.sameAs : undefined,
    keywords: [...pool.categories, ...pool.tags],
    grantSystemRef: pool.grantSystemRef ?? undefined,
  }
}

/**
 * Projects the canonical GrantPool into a schema.org/MonetaryGrant JSON-LD
 * document. Spec: https://schema.org/MonetaryGrant
 */
export function toSchemaOrgGrant(pool: GrantPool): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MonetaryGrant',
    '@id': `urn:rfp-hub:pool:${pool.id}`,
    name: pool.name ?? undefined,
    description: pool.description ?? undefined,
    url: pool.applicationsURI ?? pool.briefingURI ?? undefined,
    funder: pool.grantSystemRef
      ? {
          '@type': 'Organization',
          identifier: pool.grantSystemRef,
        }
      : undefined,
    amount: pool.totalGrantPoolSizeInUSD
      ? {
          '@type': 'MonetaryAmount',
          value: pool.totalGrantPoolSizeInUSD,
          currency: 'USD',
        }
      : undefined,
    validThrough: pool.closeDate ?? undefined,
    validFrom: pool.openDate ?? undefined,
    about: [...pool.categories, ...pool.tags].map((t: string) => ({
      '@type': 'Thing',
      name: t,
    })),
    image: pool.image ?? undefined,
    email: pool.email ?? undefined,
    sameAs: pool.sameAs.length > 0 ? pool.sameAs : undefined,
    dateModified: pool.updatedAt,
    dateCreated: pool.createdAt,
  }
}
