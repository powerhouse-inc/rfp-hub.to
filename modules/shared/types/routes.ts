import type { Route } from 'next'

/**
 * Permissive route type for RFP Hub nav. Allows any app route string.
 * Next's typedRoutes will still validate at consumer call-sites where needed.
 */
export type RouteWithDynamicPages = Route | string
