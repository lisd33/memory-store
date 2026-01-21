import { test, expect } from '@playwright/test';

const closeIntro = async (page) => {
  const skip = page.locator('.intro-skip');
  if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skip.click();
  }
};

test.describe('Mobile flows', () => {
  test('home renders and no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await closeIntro(page);
    await expect(page.locator('main.shell')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth > 1,
    );
    expect(hasOverflow).toBeFalsy();
  });

  test('CTA opens new capsule form', async ({ page }) => {
    await page.goto('/');
    await closeIntro(page);
    await page.getByRole('button', { name: /新增碎片/ }).click();
    await expect(page.locator('#new-title')).toBeVisible();
  });

  test('capsule detail opens and saves', async ({ page }) => {
    await page.goto('/');
    await closeIntro(page);
    const firstCapsule = page.locator('.capsule-fallback').first();
    await firstCapsule.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#detail-note').click();
    await page.locator('#detail-note').press('End');
    await page.locator('#detail-note').type(' · mobile check');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 2000 });
  });
});
