import { test, expect } from '@playwright/test'

test('homepage hero and navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fast, private image tools')
  await page.getByRole('link', { name: 'Convert' }).click()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Convert')
})