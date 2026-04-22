import type { Rfp } from './types'

/**
 * Projects the canonical Rfp into a DAOstar DAOIP-5 GrantPool document.
 * Upstream spec: https://daostar.org/EIPs/daoip-5
 *
 * The canonical model is insulated; this projection absorbs any upstream
 * schema drift without altering the core document model.
 */
export function toDaoip5(rfp: Rfp): Record<string, unknown> {
  return {
    '@context': 'https://www.daostar.org/context/DAOIP-5.jsonld',
    '@id': `urn:rfp-hub:${rfp.id}`,
    '@type': 'GrantPool',
    type: 'GrantPool',
    name: rfp.title,
    description: rfp.summary,
    grantFundingMechanism: 'Request for Proposal',
    isOpen: rfp.status === 'OPEN',
    closeDate: rfp.deadline,
    grantPoolValue: rfp.fundingAmount
      ? { amount: rfp.fundingAmount, currency: rfp.fundingCurrency }
      : undefined,
    applicationsURI: rfp.sourceUrl,
    governingDocument: rfp.sourceUrl,
    relatedURIs: [rfp.sourceUrl, rfp.funderUrl].filter(Boolean),
    issuer: {
      '@type': 'Organization',
      name: rfp.funder,
      url: rfp.funderUrl,
    },
    keywords: rfp.categories,
    ecosystem: rfp.ecosystem,
    provenance: rfp.provenance,
  }
}

/**
 * Projects the canonical Rfp into a schema.org/MonetaryGrant document.
 * Upstream spec: https://schema.org/MonetaryGrant
 */
export function toSchemaOrgGrant(rfp: Rfp): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MonetaryGrant',
    '@id': `urn:rfp-hub:${rfp.id}`,
    name: rfp.title,
    description: rfp.summary,
    url: rfp.sourceUrl,
    funder: {
      '@type': 'Organization',
      name: rfp.funder,
      url: rfp.funderUrl,
    },
    amount: rfp.fundingAmount
      ? {
          '@type': 'MonetaryAmount',
          value: rfp.fundingAmount,
          currency: rfp.fundingCurrency,
        }
      : undefined,
    validThrough: rfp.deadline,
    about: rfp.categories.map((c) => ({ '@type': 'Thing', name: c })),
    provider: rfp.ecosystem ? { '@type': 'Thing', name: rfp.ecosystem } : undefined,
    dateModified: rfp.updatedAt,
    dateCreated: rfp.createdAt,
  }
}
