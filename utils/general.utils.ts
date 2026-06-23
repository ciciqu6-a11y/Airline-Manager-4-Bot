import { Page } from "@playwright/test";

require('dotenv').config();

export class GeneralUtils {
    username : string;
    password : string;
    page : Page;

    constructor(page : Page) {
        this.username = process.env.EMAIL!;
        this.password = process.env.PASSWORD!;
        this.page = page;
    }

    public static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fungsi jeda acak agar jeda waktu antar-aksi tidak kaku
    public static async randomSleep(min: number, max: number) {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fungsi klik tiruan manusia: cek visibilitas, acak koordinat di dalam tombol, tambah jeda tekan
    public static async humanClick(page: Page, selectorOrLocator: any) {
        // Jika input berupa string selector, ubah jadi locator
        const locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
        
        // Cek fungsionalitas & Honeypot (harus visible dan enabled)
        await locator.waitFor({ state: 'visible', timeout: 7000 });
        const box = await locator.boundingBox();
        
        if (box) {
            // Mengacak koordinat klik di dalam area tombol (tidak pas di tengah terus)
            const x = box.x + box.width * (0.25 + Math.random() * 0.5);
            const y = box.y + box.height * (0.25 + Math.random() * 0.5);
            
            // Simulasikan gerakan mouse meluncur ke target
            await page.mouse.move(x, y, { steps: 8 });
            
            // Simulasikan penekanan tombol mouse (mousedown -> delay -> mouseup)
            await page.mouse.down();
            await this.randomSleep(80, 210); // Jeda menekan tombol 80-210ms (mirip jari manusia asli)
            await page.mouse.up();
        } else {
            // Fallback aman jika boundingBox gagal dideteksi namun elemen ada
            await locator.click();
        }
    }

    public async login(page: Page) {
        console.log('Logging in...')

        // BYPASS DETEKSI: Suntikkan script untuk menghapus flag otomatisasi sebelum masuk web
        await page.context().addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        await page.goto('https://www.airlinemanager.com/');
        await GeneralUtils.randomSleep(1500, 3000);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'PLAY FREE NOW' }));
        await GeneralUtils.randomSleep(1000, 2500);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log in' }));
        await GeneralUtils.randomSleep(800, 1500);

        await page.locator('#lEmail').fill(this.username);
        await GeneralUtils.randomSleep(500, 1200);
        
        await page.locator('#lPass').fill(this.password);
        await GeneralUtils.randomSleep(1000, 2000);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log In', exact: true }));
        console.log('Logged in successfully!');
    }
}
