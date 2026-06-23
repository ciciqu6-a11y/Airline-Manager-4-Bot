import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class MaintenanceUtils {
    page : Page;

    constructor(page : Page) {
        this.page = page;
    }

    public async repairPlanes() {
        // KOREKSI: Ganti ke humanClick
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Plan' }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Bulk repair' }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        await this.page.locator('#repairPct').selectOption('60');
        await GeneralUtils.randomSleep(1000, 2500);
        
        const noPlaneExists = await this.page.getByText('There are no aircraft worn to').isVisible();
        if(!noPlaneExists) {
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan bulk repair' }));
        }
    }

    public async checkPlanes() {
        // KOREKSI: Ganti ke humanClick
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Plan' }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Bulk check' }));
        await GeneralUtils.randomSleep(2000, 4000);
        
        let clicked = false;

        const dangerChecksExits = await this.page.locator('.bg-white > .text-danger').first().isVisible();
        if(dangerChecksExits) {
            const allCheckHoursDanger = this.page.locator('.bg-white > .text-danger');
            let count = await allCheckHoursDanger.count();        
            for(let i = 0; i < count; i++) {
                const element = allCheckHoursDanger.nth(i); // Menggunakan .nth(i) agar urut dan aman

                // KOREKSI: Ganti ke humanClick
                await GeneralUtils.humanClick(this.page, element);
                clicked = true;

                await GeneralUtils.randomSleep(600, 1500); // Jeda acak antar-klik pesawat rusak
            }
        }

        if(clicked) {
            await GeneralUtils.randomSleep(1000, 2000);
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan bulk check' }));
        }
    }
}
