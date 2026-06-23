import { test } from '@playwright/test';
import { GeneralUtils } from '../utils/general.utils';
import { FuelUtils } from '../utils/fuel.utils';
import { CampaignUtils } from '../utils/campaign.utils';
import { FleetUtils } from '../utils/fleet.utils';
import { MaintenanceUtils } from '../utils/maintenance.utils';

require('dotenv').config();

test('All Operations', async ({ page }) => {
  test.setTimeout(120000); // Naikkan ke 120 detik karena pengetikan lambat dan dynamic delay

  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);

  // 1. Selalu lakukan Login di awal
  await generalUtils.login(page);
  await GeneralUtils.randomSleep(4000, 7000);

  // KOREKSI 3: Definisikan daftar modul tugas sebagai fungsi terpisah
  const taskFuel = async () => {
    console.log('[Task] Executing Fuel & CO2 Module...');
    await GeneralUtils.humanClick(page, page.locator('#mapMaint > img').first());
    await GeneralUtils.randomSleep(1500, 3000);
    await fuelUtils.buyFuel();
    await GeneralUtils.randomSleep(1200, 2500);
    await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Co2' }));
    await GeneralUtils.randomSleep(1500, 3000);
    await fuelUtils.buyCo2();
    await GeneralUtils.randomSleep(1000, 2000);
    await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  };

  const taskCampaign = async () => {
    console.log('[Task] Executing Marketing Campaign Module...');
    await GeneralUtils.humanClick(page, page.locator('div:nth-child(5) > #mapMaint > img'));
    await GeneralUtils.randomSleep(2000, 3500);
    await campaignUtils.createCampaign();
    await GeneralUtils.randomSleep(1200, 2500);
    await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  };

  const taskMaintenance = async () => {
    console.log('[Task] Executing Plane Repair Module...');
    await GeneralUtils.humanClick(page, page.locator('div:nth-child(4) > #mapMaint > img'));
    await GeneralUtils.randomSleep(2000, 4000);
    await maintenanceUtils.checkPlanes();
    await GeneralUtils.randomSleep(1500, 3000);
    await maintenanceUtils.repairPlanes();
    await GeneralUtils.randomSleep(1500, 3000);
    await GeneralUtils.humanClick(page, page.locator('#popup > .modal-dialog > .modal-content > .modal-header > div > .glyphicons'));
  };

  const taskDepart = async () => {
    console.log('[Task] Executing Fleet Departure Module...');
    await GeneralUtils.humanClick(page, page.locator('#mapRoutes').getByRole('img'));
    await GeneralUtils.randomSleep(3000, 5000);
    await fleetUtils.departPlanes();
  };

  // Masukkan modul ke dalam daftar array tugas
  const operationalTasks = [taskFuel, taskCampaign, taskMaintenance, taskDepart];

  // Algoritma Fisher-Yates untuk mengacak urutan isi array secara merata
  for (let i = operationalTasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [operationalTasks[i], operationalTasks[j]] = [operationalTasks[j], operationalTasks[i]];
  }

  // Eksekusi tugas satu per satu berdasarkan urutan yang sudah diacak secara acak
  console.log('--- Starting Randomized Task Order ---');
  for (const task of operationalTasks) {
    await task();
    await GeneralUtils.randomSleep(3000, 6000); // Jeda santai sebelum pindah ke menu utama tugas berikutnya
  }
  console.log('--- All Randomized Tasks Finished ---');

  // Selesai //
  await GeneralUtils.randomSleep(2000, 4000);
  page.close();
});
