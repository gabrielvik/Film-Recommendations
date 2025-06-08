import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('CinematIQ Application', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/CinematIQ/i)
    
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for movie cards on homepage
    await expect(page.locator('[data-testid="movie-card"]')).toHaveCount(6, { timeout: 10000 })
  })

  test('should navigate to discover page', async ({ page }) => {
    await page.goto('/')
    
    // Click on Discover link
    await page.click('text=Discover')
    
    // Check URL
    await expect(page).toHaveURL('/discover')
    
    // Check page content
    await expect(page.locator('h1')).toContainText('Discover Movies')
  })

  test('should search for movies', async ({ page }) => {
    await page.goto('/search')
    
    // Enter search term
    await page.fill('input[placeholder*="Search"]', 'Batman')
    
    // Wait for search results
    await expect(page.locator('[data-testid="movie-card"]')).toHaveCount.gt(0, { timeout: 10000 })
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile navigation
    const mobileMenuButton = page.locator('[aria-label="Toggle menu"]')
    await expect(mobileMenuButton).toBeVisible()
    
    // Open mobile menu
    await mobileMenuButton.click()
    await expect(page.locator('nav')).toBeVisible()
  })
})
