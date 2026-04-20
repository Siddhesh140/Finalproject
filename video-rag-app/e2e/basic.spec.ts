import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to auth page', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.click('text=Get Started')
    await expect(page).toHaveURL(/auth/)
  })

  test('should show auth forms', async ({ page }) => {
    await page.goto('http://localhost:5173/auth')
    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.locator('text=Sign Up')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.click('text=Get Started')
    await page.waitForURL(/auth/)
  })
})