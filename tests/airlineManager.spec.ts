import { test } from '@playwright/test';
import { GeneralUtils } from '../utils/general.utils';
import { FuelUtils } from '../utils/fuel.utils';
import { CampaignUtils } from '../utils/campaign.utils';
import { FleetUtils } from '../utils/fleet.utils';
import { MaintenanceUtils } from '../utils/maintenance.utils';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

test('All Operations', async ({ page }) => {
  // Timeout 3 menit karena simulasi ketikan dan delay manusia butuh waktu lebih lama
  test.setTimeout(180000);

  // ==============================================================
  // ⏱️ LOGIKA AUTOMATIC KEEPALIVE LOG (.TXT) - HANYA 1X DI TANGGAL 1
  // ==============================================================
  const hariIni = new Date();
  const tanggalUTC = hariIni.getUTCDate();

  if (tanggalUTC === 1) {
    const formatBulanIni = `${hariIni.getUTCFullYear()}-${String(hariIni.getUTCMonth() + 1).padStart(2, '0')}`;
    const logFilePath = path.join(__dirname, '../last-commit.txt'); 

    let sudahCommitBulanIni = false;

    if (fs.existsSync(logFilePath)) {
      const isiLog = fs.readFileSync(logFilePath, 'utf8');
      if (isiLog.includes(formatBulanIni)) {
        sudahCommitBulanIni = true;
      }
    }

    if (!sudahCommitBulanIni) {
      console.log(`[Keepalive] Sesi pertama Tanggal 1 terdeteksi. Menulis log baru untuk bulan: ${formatBulanIni}`);
      const kontenLogBaru = `Last Successful Keepalive Commit: ${formatBulanIni} (Executed at: ${hariIni.toISOString()} WIB/UTC)\n`;
      fs.writeFileSync(logFilePath, kontenLogBaru, 'utf8');
      console.log("[Keepalive] File 'last-commit.txt' berhasil diperbarui. Langkah .yml akhir yang akan melakukan push.");
    } else {
      console.log(`[Keepalive] Bot sudah menulis log sukses untuk bulan ${formatBulanIni} pada sesi sebelumnya. Melewati pembaruan file agar git bersih.`);
    }
  } else {
    console.log(`[Keepalive] Hari ini Tanggal ${tanggalUTC} UTC. Pembaruan log keepalive dilewati.`);
  }
  // ==============================================================

  // Variable Initialization
  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);
  // End //

  // Fungsi klik area kosong mendatar di bagian atas layar untuk menutup menu/peta
  const clickBlankSpaceTop = async () => {
    console.log('Mengeklik area kosong di atas layar untuk menutup menu...');
    const randomX = Math.floor(Math.random() * (600 - 200 + 1) + 200);
    const randomY = Math.floor(Math.random() * (30 - 15 + 1) + 15);
    
    await page.mouse.move(randomX, randomY, { steps: 6 });
    await page.mouse.down();
    await GeneralUtils.randomSleep(80, 180);
    await page.mouse.up();
  };

  // 1. Lokator ubin menu utama (Tiles) untuk pancingan anti-freeze
  const menuTiles = {
    fuel: page.locator('#mapMaint > img').first(),
    maintenance: page.locator('div:nth-child(4) > #mapMaint > img'),
    campaign: page.locator('div:nth-child(5) > #mapMaint > img'),
    depart: page.locator('#mapRoutes').getByRole('img')
  };

  // Fungsi pembantu untuk memancing ubin menu lain secara acak jika terjadi lag/freeze
  const triggerRandomMenuPoke = async (currentMenuKey: string) => {
    const keys = Object.keys(menuTiles).filter(key => key !== currentMenuKey);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    console.log(`[Anti-Freeze] Mengklik sekilas menu [${randomKey}] untuk memulihkan lag halaman...`);
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(800, 1500);
    
    // Klik menu pancingan
    await GeneralUtils.humanClick(page, menuTiles[randomKey]);
    await GeneralUtils.randomSleep(1500, 2500);
    
    // Langsung keluar tanpa menjalankan fungsinya
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(1000, 1800);
  };

  // Initial Login
  await generalUtils.login(page);
  await GeneralUtils.randomSleep(5000, 8000);

  // ==================== DEFINISI FUNGSI MODUL ====================

  const runFuel = async (attempt = 1) => {
    console.log(`[Task] Memulai Modul Bahan Bakar & CO2 (Percobaan ${attempt})...`);
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(1200, 2000);

    await GeneralUtils.humanClick(page, menuTiles.fuel);
    await GeneralUtils.randomSleep(2000, 4000);

    try {
      await page.getByPlaceholder('Amount to purchase').waitFor({ state: 'visible', timeout: 8000 });
    } catch (error) {
      console.log('[Task] Modul Fuel gagal terbuka/freeze.');
      if (attempt < 2) {
        await triggerRandomMenuPoke('fuel');
        await runFuel(attempt + 1);
        return;
      } else {
        throw new Error('Modul Fuel tetap gagal dimuat setelah pemancingan menu.');
      }
    }
    
    const currentBalance = await fuelUtils.getCurrentBalance();
    console.log('[Task] Current account balance before opening Fuel: ' + currentBalance);

    await fuelUtils.buyFuel();
    await GeneralUtils.randomSleep(1500, 3000);

    await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Co2' }));
    await GeneralUtils.randomSleep(2000, 4000);
    
    await fuelUtils.buyCo2();
    await GeneralUtils.randomSleep(1500, 3000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Bahan Bakar Selesai.');
  };

  const runMaintenance = async (attempt = 1) => {
    console.log(`[Task] Memulai Modul Pemeliharaan & Perbaikan Pesawat (Percobaan ${attempt})...`);
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(1200, 2000);

    await GeneralUtils.humanClick(page, menuTiles.maintenance);

    try {
      await page.getByRole('button', { name: ' Plan' }).waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.log('[Task] Modul Maintenance gagal terbuka/freeze.');
      if (attempt < 2) {
        await triggerRandomMenuPoke('maintenance');
        await runMaintenance(attempt + 1);
        return;
      } else {
        throw new Error('Modul Maintenance tetap gagal dimuat setelah pemancingan menu.');
      }
    }

    await GeneralUtils.randomSleep(1200, 2200);
    await maintenanceUtils.checkPlanes();
    await GeneralUtils.randomSleep(2000, 4000);
    
    await maintenanceUtils.repairPlanes();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Pemeliharaan Selesai.');
  };

  const runCampaign = async (attempt = 1) => {
    console.log(`[Task] Memulai Modul Kampanye Pemasaran (Percobaan ${attempt})...`);
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(1200, 2000);

    await GeneralUtils.humanClick(page, menuTiles.campaign);
    await GeneralUtils.randomSleep(2500, 4500);
    
    try {
      await page.getByRole('button', { name: ' Marketing' }).waitFor({ state: 'visible', timeout: 8000 });
    } catch (error) {
      console.log('[Task] Modul Kampanye gagal terbuka/freeze.');
      if (attempt < 2) {
        await triggerRandomMenuPoke('campaign');
        await runCampaign(attempt + 1);
        return;
      } else {
        throw new Error('Modul Kampanye tetap gagal dimuat setelah pemancingan menu.');
      }
    }

    await campaignUtils.createCampaign();
    await GeneralUtils.randomSleep(1500, 3000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Kampanye Pemasaran Selesai.');
  };

  const runDepart = async (attempt = 1) => {
    console.log(`[Task] Memulai Modul Pelepasan Armada (Percobaan ${attempt})...`);
    await clickBlankSpaceTop();
    await GeneralUtils.randomSleep(1200, 2000);

    await GeneralUtils.humanClick(page, menuTiles.depart);
    await GeneralUtils.randomSleep(4000, 6000);

    try {
      await page.locator('#routeList').waitFor({ state: 'attached', timeout: 10000 });
    } catch (error) {
      console.log('[Task] Modul Pelepasan Armada gagal terbuka/freeze.');
      if (attempt < 2) {
        await triggerRandomMenuPoke('depart');
        await runDepart(attempt + 1);
        return;
      } else {
        throw new Error('Modul Pelepasan Armada tetap gagal dimuat setelah pemancingan menu.');
      }
    }

    await fleetUtils.departPlanes();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Pelepasan Armada Selesai.');
  };

  // ==================== LOGIKA PENGACAKAN SEMI-STATIS ====================
  const initialTasks = [
    async () => await runFuel(),
    async () => await runMaintenance()
  ];

  // Acak urutan antara Fuel atau Maintenance duluan
  for (let i = initialTasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [initialTasks[i], initialTasks[j]] = [initialTasks[j], initialTasks[i]];
  }

  // --- EKSEKUSI ALUR AMAN ---
  console.log('--- Memulai Urutan Operasi Maskapai ---');

  // 1. Jalankan tugas awal yang sudah diacak (Fuel / Maintenance)
  for (const task of initialTasks) {
    await task();
    await GeneralUtils.randomSleep(5000, 9000); 
  }

  // 2. Selalu jalankan Marketing tepat sebelum armada terbang
  await runCampaign();
  await GeneralUtils.randomSleep(5000, 8000);

  // 3. Terbangkan semua pesawat di bagian paling akhir
  await runDepart();

  console.log('--- Seluruh Operasi Sukses Dieksekusi ---');

  // Selesai
  await GeneralUtils.randomSleep(3000, 5000);
  page.close();
});
