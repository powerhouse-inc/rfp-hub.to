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
        label: 'Governance',
        href: '/governance',
        isActive: (currentPath) => currentPath.startsWith('/governance'),
      },
      {
        label: 'Exports',
        href: '/exports',
        isActive: (currentPath) => currentPath.startsWith('/exports'),
      },
      {
        label: 'Submit',
        href: '/submit',
        isActive: (currentPath) => currentPath.startsWith('/submit'),
      },
    ],
    authComponent: 'loginButton',
  },
}

export const getNavbarConfig = (_pathname: string): NavbarConfig => {
  return NAVBAR_CONFIGS['/rfp-hub']
}
