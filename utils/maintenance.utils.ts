import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class MaintenanceUtils {
    page : Page;

    constructor(page : Page) {
        this.page = page;
    }

    public async repairPlanes() {
        // SOLUSI KOREKSI: Hapus icon khusus, cari tombol mengandung kata 'Plan'
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan', exact: false }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        // SOLUSI KOREKSI: Cari tombol mengandung kata 'Bulk repair'
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Bulk repair', exact: false }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        await this.page.locator('#repairPct').selectOption('60');
        await GeneralUtils.randomSleep(1000, 2500);
        
        const noPlaneExists = await this.page.getByText('There are no aircraft worn to').isVisible();
        if(!noPlaneExists) {
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan bulk repair', exact: false }));
        }
    }

    public async checkPlanes() {
        // SOLUSI KOREKSI: Hapus icon khusus
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan', exact: false }));
        await GeneralUtils.randomSleep(1000, 2000);
        
        // SOLUSI KOREKSI: Cari tombol mengandung kata 'Bulk check'
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Bulk check', exact: false }));
        await GeneralUtils.randomSleep(2000, 4000);
        
        let clicked = false;

        const dangerChecksExits = await this.page.locator('.bg-white > .text-danger').first().isVisible();
        if(dangerChecksExits) {
            const allCheckHoursDanger = this.page.locator('.bg-white > .text-danger');
            let count = await allCheckHoursDanger.count();        
            for(let i = 0; i < count; i++) {
                const element = allCheckHoursDanger.nth(i);
                await GeneralUtils.humanClick(this.page, element);
                clicked = true;
                await GeneralUtils.randomSleep(600, 1500);
            }
        }

        if(clicked) {
            await GeneralUtils.randomSleep(1000, 2000);
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Plan bulk check', exact: false }));
        }
    }
}

