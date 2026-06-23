import { test } from '@playwright/test';
import { GeneralUtils } from '../utils/general.utils';
import { FuelUtils } from '../utils/fuel.utils';
import { CampaignUtils } from '../utils/campaign.utils';
import { FleetUtils } from '../utils/fleet.utils';
import { MaintenanceUtils } from '../utils/maintenance.utils';

require('dotenv').config();

test('All Operations', async ({ page }) => {
  // Timeout 3 menit agar aman untuk ketikan lambat dan delay manusia
  test.setTimeout(180000); 

  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);

  // Fungsi klik area kosong mendatar di bagian atas layar untuk menutup menu/peta
  const clickBlankSpaceTop = async () => {
    console.log('Mengeklik area kosong di atas layar untuk kembali/menutup menu...');
    // X diacak mendatar (200 - 600) untuk menghindari tombol pojok, Y tetap di atas (15 - 30)
    const randomX = Math.floor(Math.random() * (600 - 200 + 1) + 200);
    const randomY = Math.floor(Math.random() * (300 - 15 + 1) + 15);
    
    await page.mouse.move(randomX, randomY, { steps: 6 });
    await page.mouse.down();
    await GeneralUtils.randomSleep(80, 180);
    await page.mouse.up();
  };

  // 1. Proses Login Utama
  await generalUtils.login(page);
  await GeneralUtils.randomSleep(5000, 8000);

  // ==================== DEFINISI MODUL TUGAS ====================

  const taskFuel = async () => {
    console.log('[Task] Memulai Modul Bahan Bakar & CO2...');
    await GeneralUtils.humanClick(page, page.locator('#mapMaint > img').first());
    await GeneralUtils.randomSleep(2000, 4000);
    
    await fuelUtils.buyFuel();
    await GeneralUtils.randomSleep(1500, 3000);
    
    await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Co2' }));
    await GeneralUtils.randomSleep(2000, 4000);
    
    await fuelUtils.buyCo2();
    await GeneralUtils.randomSleep(1500, 3000);
    
    // Keluar menggunakan klik atas acak
    await clickBlankSpaceTop();
    console.log('[Task] Modul Bahan Bakar & CO2 Selesai.');
  };

  const taskCampaign = async () => {
    console.log('[Task] Memulai Modul Kampanye Pemasaran...');
    
    // KOREKSI UTAMA: Klik menu Finance terlebih dahulu sebelum masuk ke Marketing
    console.log('Membuka menu Finance...');
    await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Finance' }));
    await GeneralUtils.randomSleep(2000, 4000);

    // Buka sub-menu Marketing dan jalankan promosinya
    await GeneralUtils.humanClick(page, page.locator('div:nth-child(5) > #mapMaint > img'));
    await GeneralUtils.randomSleep(2500, 4500);
    await campaignUtils.createCampaign();
    await GeneralUtils.randomSleep(1500, 3000);
    
    // Keluar menggunakan klik atas acak
    await clickBlankSpaceTop();
    console.log('[Task] Modul Kampanye Pemasaran Selesai.');
  };

  const taskMaintenance = async () => {
    console.log('[Task] Memulai Modul Pemeliharaan & Perbaikan Pesawat...');
    await GeneralUtils.humanClick(page, page.locator('div:nth-child(4) > #mapMaint > img'));
    await GeneralUtils.randomSleep(2500, 4500);
    
    await maintenanceUtils.checkPlanes();
    await GeneralUtils.randomSleep(2000, 4000);
    
    await maintenanceUtils.repairPlanes();
    await GeneralUtils.randomSleep(2000, 4000);
    
    // Keluar menggunakan klik atas acak
    await clickBlankSpaceTop();
    console.log('[Task] Modul Pemeliharaan Selesai.');
  };

  const taskDepart = async () => {
    console.log('[Task] Memulai Modul Pelepasan Armada (Depart All)...');
    await GeneralUtils.humanClick(page, page.locator('#mapRoutes').getByRole('img'));
    await GeneralUtils.randomSleep(4000, 6000);
    
    await fleetUtils.departPlanes();
    await GeneralUtils.randomSleep(2000, 4000);
    
    // Keluar dari layar peta rute penerbangan menggunakan klik atas acak
    await clickBlankSpaceTop();
    console.log('[Task] Modul Pelepasan Armada Selesai.');
  };

  // ==================== PENGACAK TUGAS (TASK SHUFFLER) ====================

  const operationalTasks = [taskFuel, taskCampaign, taskMaintenance, taskDepart];

  // Mengacak urutan eksekusi tugas (Fisher-Yates Shuffle)
  for (let i = operationalTasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [operationalTasks[i], operationalTasks[j]] = [operationalTasks[j], operationalTasks[i]];
  }

  // ==================== EKSEKUSI UTAMA ====================

  console.log('--- Memulai Urutan Tugas yang Diacak ---');
  
  for (const task of operationalTasks) {
    await task();
    // Beri jeda santai sebelum masuk ke modul acak berikutnya
    await GeneralUtils.randomSleep(4000, 8000);
  }
  
  console.log('--- Seluruh Tugas Acak Berhasil Dieksekusi ---');

  // Penutupan Sesi Akhir
  await GeneralUtils.randomSleep(3000, 5000);
  await page.close();
});
