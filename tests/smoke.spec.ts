import { expect, test } from '@playwright/test'

const ROUTES = [
  { path: '/', heading: 'The open index of web3' },
  { path: '/rfps', heading: 'Grant pools' },
  { path: '/publishers', heading: 'Publishers' },
  // /submit disabled in production; omitted from smoke (app/submit/page.tsx)
  { path: '/exports', heading: 'Six ways to consume the hub' },
  { path: '/api-docs', heading: 'GraphQL API' },
]

test.describe('Page smoke tests', () => {
  for (const route of ROUTES) {
    test(`loads ${route.path}`, async ({ page }) => {
      const response = await page.goto(route.path)
      expect(response?.ok()).toBeTruthy()
      await expect(page.locator('h1').first()).toContainText(route.heading, { ignoreCase: true })
    })
  }
})

test.describe('Navigation', () => {
  test('top nav links work and land on the right page', async ({ page }) => {
    await page.goto('/')

    const navLinks = [
      { label: 'RFPs', expectUrl: /\/rfps/, expectHeading: 'Grant pools' },
      { label: 'Publishers', expectUrl: /\/publishers/, expectHeading: 'Publishers' },
      { label: 'Exports', expectUrl: /\/exports/, expectHeading: 'Six ways to consume' },
    ]

    for (const link of navLinks) {
      await page.goto('/')
      await page.getByRole('link', { name: link.label, exact: true }).first().click()
      await expect(page).toHaveURL(link.expectUrl)
      await expect(page.locator('h1').first()).toContainText(link.expectHeading, {
        ignoreCase: true,
      })
    }
  })

  test('no stale Vetra branding or Try Beta CTA', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).not.toContainText(/try our beta/i)
    await expect(body).not.toContainText(/vetra/i)
  })
})
