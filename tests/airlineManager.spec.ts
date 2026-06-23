import { test } from '@playwright/test';
import { GeneralUtils } from '../utils/general.utils';
import { FuelUtils } from '../utils/fuel.utils';
import { CampaignUtils } from '../utils/campaign.utils';
import { FleetUtils } from '../utils/fleet.utils';
import { MaintenanceUtils } from '../utils/maintenance.utils';

require('dotenv').config();

test('All Operations', async ({ page }) => {
  test.setTimeout(90000); // Naikkan ke 90 detik karena ada simulasi delay manusia

  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);

  // Login dengan bypass Stealth //
  await generalUtils.login(page);
  await GeneralUtils.randomSleep(3000, 5000);

  // Fuel Operations //
  await GeneralUtils.humanClick(page, page.locator('#mapMaint > img').first());
  await GeneralUtils.randomSleep(1500, 3000);
  await fuelUtils.buyFuel();

  await GeneralUtils.randomSleep(1000, 2500);
  await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Co2' }));
  await GeneralUtils.randomSleep(1000, 2000);
  await fuelUtils.buyCo2();

  await GeneralUtils.randomSleep(1000, 2500);
  await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  // End //

  // Campaign Operations //
  await GeneralUtils.randomSleep(2000, 4000);
  await GeneralUtils.humanClick(page, page.locator('div:nth-child(5) > #mapMaint > img'));
  await GeneralUtils.randomSleep(1500, 3000);
  await campaignUtils.createCampaign();

  await GeneralUtils.randomSleep(1000, 2000);
  await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  // End //

  // Repair Planes //
  await GeneralUtils.randomSleep(2000, 4000);
  await GeneralUtils.humanClick(page, page.locator('div:nth-child(4) > #mapMaint > img'));
  await GeneralUtils.randomSleep(1500, 3000);
  
  await maintenanceUtils.checkPlanes();
  await GeneralUtils.randomSleep(1500, 3000);
  await maintenanceUtils.repairPlanes();
  await GeneralUtils.randomSleep(1500, 3000);

  await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  // End //

  // Depart Planes //
  await GeneralUtils.randomSleep(2000, 4000);
  await GeneralUtils.humanClick(page, page.locator('#mapRoutes').getByRole('img'));
  await GeneralUtils.randomSleep(3000, 5000);

  await fleetUtils.departPlanes();
  // End //

  await GeneralUtils.randomSleep(2000, 4000);
  await page.close();
});
