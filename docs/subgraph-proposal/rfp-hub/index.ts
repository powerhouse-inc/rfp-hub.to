import { BaseSubgraph } from '@powerhousedao/reactor-api'
import type { DocumentNode } from 'graphql'
import { schema } from './schema.js'
import { createResolvers } from './resolvers.js'

/**
 * Public, unauthenticated subgraph exposing the RFP Hub index.
 *
 * Reads live off the document-model's namespace via `findDocuments`. No
 * relational namespace is created here — every query is a thin projection
 * over the canonical Rfp / Publisher documents so the index is always in sync.
 *
 * If the hub grows beyond a few thousand RFPs, move the list/search path to a
 * dedicated indexer table (see README.md).
 */
export class RfpHubSubgraph extends BaseSubgraph {
  name = 'rfp-hub'
  typeDefs: DocumentNode = schema
  resolvers: Record<string, unknown> = {}
  additionalContextFields = {}

  async onSetup() {
    this.resolvers = createResolvers({ reactor: this.reactor })
  }

  async onDisconnect() {
    // nothing to clean up — pure read layer
  }
}
