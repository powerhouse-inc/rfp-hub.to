import Link from 'next/link'
import { PowerhouseLogoIsotype } from '../svgs'

const footerLinks = {
  hub: [
    { label: 'RFPs', href: '/rfps' },
    { label: 'Publishers', href: '/publishers' },
    { label: 'Submit', href: '/submit' },
  ],
  resources: [
    { label: 'API', href: '/api-docs' },
    { label: 'Spec (DAOIP-5)', href: 'https://daostar.org/EIPs/daoip-5' },
    { label: 'GitHub', href: 'https://github.com/powerhouse-inc/rfp-hub-app' },
  ],
  ecosystem: [
    { label: 'Ethereum Foundation', href: 'https://ethereum.foundation' },
    { label: 'Powerhouse', href: 'https://powerhouse.inc' },
  ],
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h5 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h5>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <Link
              href="/"
              className="flex items-center font-mono text-sm font-medium tracking-tight"
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
              RFP/Hub
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The open index of web3 funding opportunities.
            </p>
          </div>
          <FooterLinkGroup title="Hub" links={footerLinks.hub} />
          <FooterLinkGroup title="Resources" links={footerLinks.resources} />
          <FooterLinkGroup title="Ecosystem" links={footerLinks.ecosystem} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <Link
            href="https://powerhouse.inc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Built by Powerhouse <PowerhouseLogoIsotype className="size-4" />
          </Link>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            AGPL-3.0 · Open source
          </div>
        </div>
      </div>
    </footer>
  )
}
