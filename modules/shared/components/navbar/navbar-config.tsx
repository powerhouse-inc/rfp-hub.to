import type { NavbarConfig } from './types'

export const NAVBAR_CONFIGS: Record<string, NavbarConfig> = {
  '/rfp-hub': {
    logoHref: '/',
    navItems: [
      {
        label: 'RFPs',
        href: '/rfps',
        isActive: (currentPath) => currentPath.startsWith('/rfps'),
      },
      {
        label: 'Publishers',
        href: '/publishers',
        isActive: (currentPath) => currentPath.startsWith('/publishers'),
      },
      {
        label: 'Exports',
        href: '/exports',
        isActive: (currentPath) => currentPath.startsWith('/exports'),
      },
      // Hidden from production nav — direct /submit is also disabled in prod (see app/submit/page.tsx).
      // {
      //   label: 'Submit',
      //   href: '/submit',
      //   isActive: (currentPath) => currentPath.startsWith('/submit'),
      // },
    ],
    authComponent: 'loginButton',
  },
}

export const getNavbarConfig = (_pathname: string): NavbarConfig => {
  return NAVBAR_CONFIGS['/rfp-hub']
}
