import { test, expect } from '@playwright/test';

test('Planner page loads properly', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await expect(page.getByText('English')).toBeVisible();
  await expect(page.getByText('Plan My Escape ✨')).toBeVisible();
});

test('Language selector works', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await page.getByText('हिन्दी').click();

  await expect(page.getByText('मेरी ट्रिप बनाएं ✨')).toBeVisible();
});

test('City dropdown opens', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await page.getByPlaceholder('e.g., Delhi').click();

  await expect(page.getByText('Delhi')).toBeVisible();
});

test('Destination dropdown opens', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await page.getByPlaceholder('e.g., Goa').click();

  await expect(
    page.getByRole('button', { name: 'Goa Supported' })
  ).toBeVisible();
});
test('Validation error appears', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await page.getByText('Plan My Escape ✨').click();

  await expect(
    page.getByText(/Missing trip details|Trip details missing/i)
  ).toBeVisible();
});

test('Login page opens', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/login');

  await expect(page.getByText(/Google/i)).toBeVisible();
});

test('Dashboard route works', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/dashboard');

  await expect(page).toHaveURL(/dashboard/);
});

test('Mobile view loads properly', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });

  const page = await context.newPage();

  await page.goto('https://tripnest-ai.vercel.app/home');

  await expect(page.getByText('Plan My Escape ✨')).toBeVisible();

  await context.close();
});