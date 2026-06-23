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

    public static async humanClick(page: Page, selectorOrLocator: any) {
        const locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
        await locator.waitFor({ state: 'visible', timeout: 7000 });
        const box = await locator.boundingBox();
        
        if (box) {
            // Membidik area tengah tombol dengan variasi acak (25% hingga 75% dari lebar/tinggi)
            const x = box.x + box.width * (0.25 + Math.random() * 0.5);
            const y = box.y + box.height * (0.25 + Math.random() * 0.5);
            await page.mouse.move(x, y, { steps: 8 });
            await page.mouse.down();
            await this.randomSleep(80, 200);
            await page.mouse.up();
        } else {
            await locator.click();
        }
    }

    public async login(page: Page) {
        console.log('Logging in with keystroke dynamics...')

        await page.goto('https://www.airlinemanager.com/');
        await GeneralUtils.randomSleep(2000, 4000);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'PLAY FREE NOW' }));
        await GeneralUtils.randomSleep(1500, 3000);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log in' }));
        await GeneralUtils.randomSleep(1000, 2000);

        // Mengetik email per karakter dengan dynamic delay
        await page.locator('#lEmail').click();
        await page.locator('#lEmail').pressSequentially(this.username, { delay: Math.floor(Math.random() * 100) + 50 });
        await GeneralUtils.randomSleep(600, 1500);
        
        // Mengetik password per karakter dengan dynamic delay
        await page.locator('#lPass').click();
        await page.locator('#lPass').pressSequentially(this.password, { delay: Math.floor(Math.random() * 100) + 50 });
        await GeneralUtils.randomSleep(1000, 2500);

        await GeneralUtils.humanClick(page, page.getByRole('button', { name: 'Log In', exact: true }));
        console.log('Logged in successfully!');
    }
}
