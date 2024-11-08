import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { HomePage } from '../pages';

dotenv.config();

test.describe('Clinical Views - Configure and Edit Tab Definition', () => {
  test('should configure dashboard and edit tab definition', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Navigate to the Home page', async () => {
      await homePage.gotoHome();
      await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/clinical-views-builder`);
    });

    await test.step('Click on "Create a new clinical view"', async () => {
      await page.getByRole('button', { name: 'Create a new clinical view' }).click();
    });

    await test.step('Import dummy schema and verify options', async () => {
      await page.getByRole('button', { name: 'Input dummy schema' }).click();

      await expect(page.getByRole('button', { name: 'First Menu' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Second Menu' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Clinical view submenu' })).toBeVisible();
    });
    await test.step('Click "First Menu" and configure dashboard', async () => {
      await page.getByRole('button', { name: 'First Menu' }).click();
      await page.getByRole('button', { name: 'Configure dashboard' }).click();

      await page.getByLabel('Select Widget').selectOption('encounter-list-table-tabs');

      await page.locator('input#tabName').fill('TabA');
      await page.locator('input#displayTitle').fill('TabB');

      await page.getByRole('button', { name: 'Create Submenu' }).click();
      await expect(page.locator('text=Success!')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Configure columns', async () => {
      await page.getByRole('button', { name: 'Configure columns' }).click();
      await page.getByRole('combobox', { name: 'Form:' }).click();
      await page.getByText('Mental Health Assessment Form').click();
      await page.getByLabel('Select concept').selectOption('167006AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      await page.getByPlaceholder('e.g. Visit title').fill('a');
      await page.getByRole('button', { name: 'Create Submenu' }).click();
    });

    await test.step('Edit tab definition', async () => {
      await page.getByLabel('Edit tab definition').click();
      await page.getByLabel('Tab name').fill('TitleA');
      await page.getByLabel('Header title').fill('TitleB');
      await page.getByRole('button', { name: 'Save', exact: true }).click();

      await expect(page.locator('text=Tab edited successfully')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Delete tab definition', async () => {
      await page.getByLabel('Delete tab definition').click();
      await expect(page.getByRole('heading', { name: 'Are you sure you want to' })).toBeVisible();
      await expect(page.getByRole('dialog').getByText('Menu Slot : first-menu-slot')).toBeVisible();
      await expect(page.getByText('Tab name : TitleA')).toBeVisible();
      await expect(page.getByText('Header title : TitleB')).toBeVisible();

      await page.getByRole('button', { name: 'Delete configuration' }).click();
      await expect(page.getByText('Tab configuration deleted')).toBeVisible();
    });
  });
});
