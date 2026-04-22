import { NextResponse } from 'next/server'
import { serverGql } from '@/modules/shared/lib/server-fetch'

export const revalidate = 300

interface RawPool {
  id: string
  state: {
    global: {
      name: string | null
      description: string | null
      applicationsURI: string | null
      briefingURI: string | null
      lifecycle: string
      closeDate: string | null
      updatedAt?: string
    }
  }
  lastModifiedAtUtcIso?: string
}

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<'
      ? '&lt;'
      : c === '>'
        ? '&gt;'
        : c === '&'
          ? '&amp;'
          : c === "'"
            ? '&apos;'
            : '&quot;',
  )
}

/**
 * RSS 2.0 feed of the hub's grant pools, newest first. Integrators can plug
 * this directly into any feed reader or trigger system (Zapier, IFTTT).
 */
export async function GET(req: Request) {
  try {
    const data = await serverGql<{
      GrantPool: { findDocuments: { items: RawPool[] } }
    }>(
      `query Feed {
        GrantPool {
          findDocuments {
            items {
              id
              state { global {
                name description applicationsURI briefingURI
                lifecycle closeDate
              } }
            }
          }
        }
      }`,
    )

    const origin = new URL(req.url).origin
    const items = data.GrantPool.findDocuments.items
      .slice()
      .sort((a, b) => {
        const ax = a.state.global.closeDate ?? ''
        const bx = b.state.global.closeDate ?? ''
        return bx.localeCompare(ax)
      })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RFP Hub · Grant pools</title>
    <link>${origin}/rfps</link>
    <atom:link href="${origin}/api/feeds/rfps.rss" rel="self" type="application/rss+xml" />
    <description>Open index of web3 funding opportunities. DAOIP-5 aligned.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items
  .map((p) => {
    const g = p.state.global
    const link = `${origin}/rfps/${p.id}`
    const titleLabel = g.lifecycle === 'OPEN' ? '[OPEN] ' : g.lifecycle === 'UPCOMING' ? '[UPCOMING] ' : ''
    const pub = g.closeDate ? new Date(g.closeDate).toUTCString() : new Date().toUTCString()
    return `    <item>
      <title>${esc(`${titleLabel}${g.name ?? 'Untitled'}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${esc(g.description ?? '')}</description>
    </item>`
  })
  .join('\n')}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'content-type': 'application/rss+xml; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        'access-control-allow-origin': '*',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'feed unavailable', detail: (err as Error).message },
      { status: 503 },
    )
  }
}
