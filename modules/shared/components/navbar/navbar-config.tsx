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
        label: 'Submit',
        href: '/submit',
        isActive: (currentPath) => currentPath.startsWith('/submit'),
      },
      {
        label: 'API',
        href: '/api-docs',
        isActive: (currentPath) => currentPath.startsWith('/api-docs'),
      },
    ],
    authComponent: 'loginButton',
  },
}

export const getNavbarConfig = (_pathname: string): NavbarConfig => {
  return NAVBAR_CONFIGS['/rfp-hub']
}
