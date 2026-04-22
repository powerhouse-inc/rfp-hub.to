import type { CodegenConfig } from '@graphql-codegen/cli'

// see: https://plainenglish.io/blog/next-js-app-router-graphql-codegen-and-tanstack-query

const config: CodegenConfig = {
  // Points at the local RFP Hub switchboard. Override with NEXT_PUBLIC_SWITCHBOARD_URL
  // when running against a deployed instance.
  schema: process.env.NEXT_PUBLIC_SWITCHBOARD_URL || 'http://localhost:4001/graphql',
  overwrite: true,
  documents: ['./modules/**/*.gql', './modules/**/*.{tsx,ts}', './app/**/*.{tsx,ts}'],
  generates: {
    // Where the generated types and hooks file will be placed
    './modules/__generated__/graphql/gql-generated.ts': {
      plugins: [
        {
          add: {
            content: `/* eslint-disable */\n// @ts-nocheck`,
            placement: 'prepend',
          },
        },
        'typescript',
        'typescript-operations',
        // Important! The "add" plugin will inject this into our generated file.
        // This extends RequestInit['Headers'] to include the Next.js extended "fetch"
        // options for caching. This will allow for fine grained cache control
        // with our generated hooks.
        {
          add: {
            content: `
type FetchOptions = {
cache?: RequestCache;
next?: NextFetchRequestConfig;
};

            type RequestInit = {
              headers: (HeadersInit & FetchOptions) | FetchOptions;
            };`,
          },
        },
      ],
      config: {
        // Needed to support the updated React Query 5 API
        reactQueryVersion: 5,
        legacyMode: false,
        exposeFetcher: true,
        exposeQueryKeys: true,
        addSuspenseQuery: true,
        // Allows us to specify a custom fetcher function that will leverage
        // Next.js caching fetaures within our generated query hooks.
        fetcher: '@/shared/lib/fetcher#fetcher',
      },
    },
  },
}
export default config
