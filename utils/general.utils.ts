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

    public static async randomSleep(min: number, max: number) {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fungsi utama untuk klik ala manusia.
     * Mengambil koordinat tengah tombol dan memberikan offset acak 
     * agar tidak selalu mengeklik titik pusat yang kaku.
     */
    public static async humanClick(page: Page, selectorOrLocator: any) {
        const locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
        
        // Timeout 15 detik agar bot lebih sabar menunggu elemen muncul di server yang lambat
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const box = await locator.boundingBox();
        
        if (box) {
            // Memberikan target klik di area tengah tombol dengan variasi acak 25%-75%
            const x = box.x + box.width * (0.25 + Math.random() * 0.5);
            const y = box.y + box.height * (0.25 + Math.random() * 0.5);
            
            await page.mouse.move(x, y, { steps: 8 });
            await page.mouse.down();
            await this.randomSleep(80, 200);
            await page.mouse.up();
        } else {
            // Fallback klik standar jika boundingBox tidak terdeteksi
            await locator.click();
        }
    }

    public async login(page: Page) {
        console.log('Logging in with keystroke dynamics...')

        await page.goto('https://www.airlinemanager.com/');
        await GeneralUtils.randomSleep(2000, 4000);

        // Klik tombol utama
        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'PLAY FREE NOW' }));
        await GeneralUtils.randomSleep(1500, 3000);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log in' }));
        await GeneralUtils.randomSleep(1000, 2000);

        // Mengetik email dengan delay acak tiap karakter (50-150ms)
        await page.locator('#lEmail').click();
        await page.locator('#lEmail').pressSequentially(this.username, { 
            delay: Math.floor(Math.random() * 100) + 50 
        });
        await GeneralUtils.randomSleep(600, 1500);
        
        // Mengetik password dengan delay acak
        await page.locator('#lPass').click();
        await page.locator('#lPass').pressSequentially(this.password, { 
            delay: Math.floor(Math.random() * 100) + 50 
        });
        await GeneralUtils.randomSleep(1000, 2500);

        // Klik Login
        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log In', exact: true }));
        console.log('Logged in successfully!');
    }
}
