import { Inter, JetBrains_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { RenownProvider } from '@/modules/shared/components/renown/renown-provider'
import { Toaster } from '@/modules/shared/components/ui/sonner'
import { ThemeProvider } from '@/modules/shared/providers/theme-provider'
import { Footer } from '@/shared/components/footer/footer'
import Navbar from '@/shared/components/navbar/navbar'
import { QueryClientProvider } from '@/shared/providers/query-client'
import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'RFP Hub',
  description: 'The open index of web3 funding opportunities.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Calling headers() opts this layout into dynamic rendering,
  // ensuring process.env is read at request time, not build time.
  await headers()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} bg-background antialiased`}>
        <Script
          id="runtime-env"
          strategy="beforeInteractive"
        >{`window.__ENV=${JSON.stringify({
          NEXT_PUBLIC_SWITCHBOARD_URL:
            process.env.SWITCHBOARD_URL ||
            process.env.GRAPHQL_ENDPOINT ||
            process.env.NEXT_PUBLIC_SWITCHBOARD_URL ||
            '',
          NEXT_PUBLIC_RFP_HUB_DRIVE_ID:
            process.env.RFP_HUB_DRIVE_ID || process.env.NEXT_PUBLIC_RFP_HUB_DRIVE_ID || '',
          NEXT_PUBLIC_RENOWN_URL:
            process.env.RENOWN_URL || process.env.NEXT_PUBLIC_RENOWN_URL || '',
        })}`}</Script>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <QueryClientProvider>
              <RenownProvider appName="rfp-hub" url={process.env.NEXT_PUBLIC_RENOWN_URL}>
                <div className="items-right flex min-h-screen flex-col">
                  <Navbar />
                  {/* pt-16 offsets the fixed-position navbar (h-16) so page
                    headings don't slide under it. */}
                  <main className="flex-1 pt-16">{children}</main>
                  <Footer />
                </div>
              </RenownProvider>
              <Toaster />
            </QueryClientProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
