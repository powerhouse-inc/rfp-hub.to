import { expect, test } from '@playwright/test'

test.describe('RFPs list', () => {
  test('renders sample grant pools with lifecycle badges', async ({ page }) => {
    await page.goto('/rfps')
    await expect(page.locator('h1').first()).toContainText('Grant pools')
    await expect(page.getByRole('heading', { level: 3, name: /Standard RFP Object/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Optimism Retro Funding/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Gitcoin Grants/i })).toBeVisible()

    // Every card with OPEN lifecycle gets an "Open" badge; expect at least one.
    const openBadges = page.getByText('Open', { exact: true })
    expect(await openBadges.count()).toBeGreaterThan(0)
  })

  test('search filter narrows results via URL state', async ({ page }) => {
    await page.goto('/rfps')
    const search = page.getByPlaceholder(/search grants by name/i)
    await search.fill('Gitcoin')

    await expect(page).toHaveURL(/[?&]q=Gitcoin/)
    await expect(page.getByRole('heading', { level: 3, name: /Gitcoin Grants/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Optimism Retro Funding/i })).toHaveCount(0)
  })

  test('lifecycle filter works', async ({ page }) => {
    await page.goto('/rfps')
    await page.getByLabel('Status').selectOption('UPCOMING')
    await expect(page).toHaveURL(/[?&]lifecycle=UPCOMING/)
    await expect(page.getByRole('heading', { level: 3, name: /Optimism Retro Funding/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Gitcoin Grants/i })).toHaveCount(0)
  })

  test('clicking a card opens detail with DAOIP-5 export', async ({ page }) => {
    await page.goto('/rfps')
    // Wait for at least one card to be rendered before trying to click.
    await page
      .getByRole('heading', { level: 3, name: /Standard RFP Object/i })
      .first()
      .waitFor()
    // The whole card is an <a> wrapping the heading; click the link.
    await page.locator('a', { has: page.getByRole('heading', { level: 3, name: /Standard RFP Object/i }) }).first().click()

    await expect(page).toHaveURL(/\/rfps\/sample-ef-rfp-hub$/)
    await expect(page.locator('h1').first()).toContainText('Standard RFP Object')

    await page.getByRole('button', { name: /show exports/i }).click()
    await page.getByRole('button', { name: /DAOIP-5 GrantPool/i }).click()
    // Scope to <article> so the Next.js dev-error overlay's own <pre> doesn't
    // match as a sibling.
    await expect(page.locator('article pre').first()).toContainText(
      'daostar.org/context/DAOIP-5',
    )
  })
})

test.describe('Submit form', () => {
  test('disabled submit + login prompt when signed out', async ({ page }) => {
    await page.goto('/submit')
    await expect(page.getByText(/sign in to submit/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /submit grant pool/i })).toBeDisabled()
  })

  test('form fields present', async ({ page }) => {
    await page.goto('/submit')
    // react-hook-form registers inputs by `name=`; that's the stable selector.
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('textarea[name="description"]')).toBeVisible()
    await expect(page.locator('select[name="grantFundingMechanism"]')).toBeVisible()
    await expect(page.locator('select[name="lifecycle"]')).toBeVisible()
  })
})

test.describe('Home page', () => {
  test('hero + stats bar + how-it-works render', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Canonical superset of DAOIP-5/i)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /standard rfp object/i }).first(),
    ).toBeVisible()
    await expect(page.getByText(/Six pieces, one hub/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /CC0 schema, AGPL code/i })).toBeVisible()
  })

  test('API preview shows multiple export surfaces', async ({ page }) => {
    await page.goto('/')
    const pre = page.locator('pre').first()
    await expect(pre).toContainText('query OpenRFPs')
    await expect(pre).toContainText('/snapshots/latest.json')
    await expect(pre).toContainText('daoip-5.jsonld')
  })
})

test.describe('Exports', () => {
  test('exports page lists all six surfaces', async ({ page }) => {
    await page.goto('/exports')
    await expect(page.getByRole('heading', { name: 'Nightly JSON snapshots' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'RSS + Atom feeds' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Webhooks' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'IPFS + Swarm mirrors' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'JSON-LD projections' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Operation log replay' })).toBeVisible()
  })
})
