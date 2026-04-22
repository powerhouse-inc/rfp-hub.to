import Link from 'next/link'
import React from 'react'
import { cn } from '@/modules/shared/lib/utils'
import type { RouteWithDynamicPages } from '@/modules/shared/types/routes'

interface NavbarBrandProps {
  isAchraPage?: boolean
  isotypeLogo?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  logotype?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  logotypeClassName?: string
  logoHref?: RouteWithDynamicPages
}

/**
 * Text-first brand mark. Renders "RFP/Hub" as a mono wordmark by default.
 * If an SVG logotype is passed, it takes precedence.
 */
export function NavbarBrand({
  isotypeLogo: IsotypeLogo,
  logotype: Logotype,
  logotypeClassName,
  logoHref = '/',
}: NavbarBrandProps) {
  return (
    <div className="flex items-center gap-4 px-2 md:gap-6 md:px-4">
      <Link href={logoHref} className="group flex items-center gap-2 hover:opacity-80">
        {Logotype ? (
          <>
            {typeof IsotypeLogo === 'function' && <IsotypeLogo className="h-7 w-7 md:hidden" />}
            {typeof Logotype === 'function' && (
              <Logotype className={cn('hidden h-7 md:block', logotypeClassName)} />
            )}
          </>
        ) : (
          <span className="flex items-center font-mono text-sm font-medium tracking-tight text-foreground">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
            RFP/Hub
          </span>
        )}
      </Link>
    </div>
  )
}
