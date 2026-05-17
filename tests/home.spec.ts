import { test, expect } from '@playwright/test';

test('TripNest AI planner page loads', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await expect(page.getByText('English')).toBeVisible();
  await expect(page.getByText('Plan My Escape ✨')).toBeVisible();
});

test('Language selector works on planner', async ({ page }) => {
  await page.goto('https://tripnest-ai.vercel.app/home');

  await page.getByText('हिन्दी').click();

  await expect(page.getByText('मेरी ट्रिप बनाएं ✨')).toBeVisible();
});