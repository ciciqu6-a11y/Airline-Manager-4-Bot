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
  // Timeout global 4 menit untuk mengakomodasi proses retry jika server lag
  test.setTimeout(240000);

  // Variable Initialization
  const fuelUtils = new FuelUtils(page);
  const generalUtils = new GeneralUtils(page);
  const campaignUtils = new CampaignUtils(page);
  const fleetUtils = new FleetUtils(page);
  const maintenanceUtils = new MaintenanceUtils(page);

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
    } else {
      console.log(`[Keepalive] Bot sudah menulis log sukses untuk bulan ${formatBulanIni} pada sesi sebelumnya. Skip.`);
    }
  } else {
    console.log(`[Keepalive] Hari ini Tanggal ${tanggalUTC} UTC. Skip.`);
  }

  // ==============================================================
  // ⚙️ DEFINISI FUNGSI STEALTH & PENGECOH ORGANIK (ANTI-PATTERN)
  // ==============================================================

  const clickBlankSpaceTop = async () => {
    console.log('Mengeklik area kosong di atas layar untuk menutup menu...');
    const randomX = Math.floor(Math.random() * (600 - 200 + 1) + 200);
    const randomY = Math.floor(Math.random() * (30 - 15 + 1) + 15);
    await page.mouse.move(randomX, randomY, { steps: 6 });
    await page.mouse.down();
    await GeneralUtils.randomSleep(80, 180);
    await page.mouse.up();
  };

  const humanIdle = async () => {
    const durasiIdle = Math.floor(Math.random() * (12000 - 6000 + 1) + 6000); // Jeda 6-12 detik
    console.log(`[Stealth] Manusia terdistraksi sementara... Idle selama ${durasiIdle / 1000} detik.`);
    await page.waitForTimeout(durasiIdle);
  };

  const checkDashboard = async () => {
    console.log('[Stealth] Manusia sekadar mengeklik beranda untuk menyegarkan tampilan...');
    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
      await clickBlankSpaceTop();
      await GeneralUtils.randomSleep(1500, 3000);
    }
  };

  // Wrapper Fungsi Retry Global dengan Pengaman Pasca-Reload & Safe Error Type
  const executeWithRetry = async (taskName: string, taskFunction: () => Promise<void>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await taskFunction();
        return; 
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[⚠️ WARN] Gagal mengeksekusi ${taskName} pada percobaan ke-${attempt}/${maxRetries}. Error: ${errorMessage}`);
        
        if (attempt === maxRetries) {
          throw new Error(`[🚨 CRITICAL] ${taskName} gagal total setelah ${maxRetries} kali percobaan.`);
        }
        
        console.log(`[Retry System] Menyegarkan halaman karena kegagalan pada ${taskName}...`);
        await clickBlankSpaceTop();
        await page.reload();
        
        try {
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          await page.locator('#mapMaint').first().waitFor({ state: 'visible', timeout: 10000 });
          console.log('[Retry System] Halaman sukses dimuat ulang. Mencoba ulang modul...');
        } catch (loadError) {
          console.log('[Retry System] Server lambat merespon reload, melanjutkan percobaan dengan toleransi delay.');
        }
        
        await GeneralUtils.randomSleep(5000, 8000);
      }
    }
  };

  // ==================== DEFINISI FUNGSI MODUL GAME ====================

  const runFuel = async () => {
    console.log('[Task] Memulai Modul Bahan Bakar & CO2...');
    await GeneralUtils.humanClick(page, page.locator('#mapMaint > img').first());
    await GeneralUtils.randomSleep(3000, 5000);
    
    await fuelUtils.buyFuel();
    await GeneralUtils.randomSleep(2000, 4000);

    await GeneralUtils.humanClick(page, page.getByRole('button', { name: ' Co2' }));
    await GeneralUtils.randomSleep(3000, 5000);
    
    await fuelUtils.buyCo2();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Bahan Bakar Selesai.');
  };

  const runMaintenance = async () => {
    console.log('[Task] Memulai Modul Pemeliharaan & Perbaikan Pesawat...');
    await GeneralUtils.humanClick(page, page.locator('#mapMaint').locator('img').nth(2)); 
    await GeneralUtils.randomSleep(4000, 6000); 

    await maintenanceUtils.checkPlanes();
    await GeneralUtils.randomSleep(2000, 4000);
    
    await maintenanceUtils.repairPlanes();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Pemeliharaan Selesai.');
  };

  const runCampaign = async () => {
    console.log('[Task] Memulai Modul Kampanye Pemasaran...');
    await GeneralUtils.humanClick(page, page.locator('#mapMaint > img').nth(3));
    await GeneralUtils.randomSleep(3500, 5500);
    
    await campaignUtils.createCampaign();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Kampanye Pemasaran Selesai.');
  };

  const runDepart = async () => {
    console.log('[Task] Memulai Modul Pelepasan Armada (Depart All)...');
    await GeneralUtils.humanClick(page, page.locator('#mapRoutes').getByRole('img'));
    await GeneralUtils.randomSleep(4000, 6000);

    await fleetUtils.departPlanes();
    await GeneralUtils.randomSleep(2000, 4000);

    await clickBlankSpaceTop();
    console.log('[Task] Modul Pelepasan Armada Selesai.');
  };

  // ==================== ALUR UTAMA RUNNER ====================
  
  // 1. Login (Bypass Stealth & Keystroke Dynamics)
  await generalUtils.login(page);
  await GeneralUtils.randomSleep(6000, 9000);

  console.log('--- Memulai Urutan Operasi Maskapai (Organik) ---');

  // Menyiapkan modul acak awal
  const initialTasks = [
    { name: 'Modul Fuel', fn: runFuel },
    { name: 'Modul Maintenance', fn: runMaintenance }
  ];

  // Mengacak urutan penugasan (Fisher-Yates Shuffle)
  for (let i = initialTasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [initialTasks[i], initialTasks[j]] = [initialTasks[j], initialTasks[i]];
  }

  // 2. Jalankan Tugas Awal yang Sudah Diacak dengan Dukungan Auto-Retry & Jeda Acak
  for (const task of initialTasks) {
    await executeWithRetry(task.name, task.fn);
    await GeneralUtils.randomSleep(5000, 9000); 

    // Peluang 40% terjadi distraksi manusia setelah menyelesaikan sebuah menu
    if (Math.random() < 0.4) {
      if (Math.random() < 0.5) {
        await checkDashboard();
      } else {
        await humanIdle();
      }
    }
  }

  // 3. Kunci: Jalankan Pemasaran sebelum armada terbang + Proteksi Retry
  await executeWithRetry('Modul Campaign', runCampaign);
  await GeneralUtils.randomSleep(5000, 8000);

  // Peluang 30% mendadak idle/menunda sejenak sebelum menerbangkan armada
  if (Math.random() < 0.3) {
    await humanIdle();
  }

  // 4. Kunci: Terbangkan semua pesawat di bagian paling akhir + Proteksi Retry
  await executeWithRetry('Modul Depart All', runDepart);

  // Peluang 30% mengecek dashboard sekilas sebelum menutup aplikasi game
  if (Math.random() < 0.3) {
    await checkDashboard();
  }

  console.log('--- Seluruh Operasi Sukses Dieksekusi ---');

  await GeneralUtils.randomSleep(4000, 7000);
  
  // Menutup halaman dengan sinkronisasi async Promise yang bersih
  await page.close();
});
