// UI Verification Tests
// Screenshot key UI elements to verify visibility

const { test, expect } = require('@playwright/test');

test.describe('UI Verification', () => {
  test('main game UI elements exist', async ({ page }) => {
    await page.goto('file:///index.html');
    
    // Verify main elements
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#coins')).toBeVisible();
    
    // Screenshot for verification
    await page.screenshot({ path: 'output/ui-main.png' });
  });

  test('achievement detail modal opens', async ({ page }) => {
    await page.goto('file:///index.html');
    
    // Click achievement gauge card to open modal
    const gaugeCard = page.locator('.achievement-gauge-card');
    if (await gaugeCard.isVisible()) {
      await gaugeCard.click();
      await page.waitForTimeout(500);
      
      // Check if modal is visible
      const modal = page.locator('#achievementDetailModal');
      await expect(modal).toBeVisible();
      
      // Screenshot for verification
      await page.screenshot({ path: 'output/ui-achievement-detail.png' });
    }
  });
});
