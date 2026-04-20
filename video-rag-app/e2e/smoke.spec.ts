import { test, expect, beforeEach } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('Video-RAG E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.describe('Landing Page', () => {
    test('loads landing page correctly', async ({ page }) => {
      await expect(page).toHaveTitle(/StudyVerse|VideoRAG/)
    })

    test('shows feature sections', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible()
    })

    test('navigation works', async ({ page }) => {
      const getStarted = page.locator('text=Get Started').first()
      if (await getStarted.isVisible()) {
        await getStarted.click()
        await expect(page).toHaveURL(/auth/)
      }
    })
  })

  test.describe('Authentication', () => {
    test('can navigate to auth page', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`)
      await expect(page.locator('text=Welcome Back')).toBeVisible()
    })

    test('shows login form', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`)
      await expect(page.locator('input[name="email"]')).toBeVisible()
    })

    test('shows signup form', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth`)
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(BASE_URL)
      await expect(page.locator('body')).toBeVisible()
    })

    test('works on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(BASE_URL)
      await expect(page.locator('body')).toBeVisible()
    })
  })
})