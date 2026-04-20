import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL || 'http://localhost:8000/api';

test.describe('Video-RAG Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('homepage loads correctly', async ({ page }) => {
    await expect(page.locator('text=Video-RAG')).toBeVisible();
    await expect(page.locator('text=New Analysis')).toBeVisible();
  });

  test('can switch between link and upload modes', async ({ page }) => {
    const linkButton = page.locator('button:has-text("Link")');
    const uploadButton = page.locator('button:has-text("Upload")');
    
    await expect(linkButton).toBeVisible();
    await expect(uploadButton).toBeVisible();
    
    await uploadButton.click();
    await expect(page.locator('text=Click to upload')).toBeVisible();
    
    await linkButton.click();
    await expect(page.locator('input[type="url"]')).toBeVisible();
  });

  test('shows validation error for empty URL', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Start Processing")');
    await submitButton.click();
    
    await expect(page.locator('text=Please enter a video URL')).toBeVisible();
  });

  test('shows recent videos section', async ({ page }) => {
    await expect(page.locator('text=Recent Analyses')).toBeVisible();
  });

  test('empty state is shown when no videos', async ({ page }) => {
    await expect(page.locator('text=No videos yet')).toBeVisible();
  });
});

test.describe('API Health Checks', () => {
  test('backend health endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_URL.replace('/api', '')}/health`);
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual({ status: 'healthy' });
  });

  test('api root returns version info', async ({ request }) => {
    const response = await request.get(`${API_URL.replace('/api', '')}/`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('message');
  });

  test('videos endpoint returns array', async ({ request }) => {
    const response = await request.get(`${API_URL}/videos`);
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(await response.json())).toBeTruthy();
  });
});
