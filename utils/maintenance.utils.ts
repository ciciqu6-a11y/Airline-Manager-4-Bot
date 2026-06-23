import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class MaintenanceUtils {
    page : Page;

    constructor(page : Page) {
        this.page = page;
    }

    public async repairPlanes() {
        await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Plan")').first());
        await GeneralUtils.randomSleep(1000, 2000);
        
        await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Bulk repair")').first());
        await GeneralUtils.randomSleep(1000, 2000);
        
        await this.page.locator('#repairPct').selectOption('60');
        await GeneralUtils.randomSleep(1000, 2500);
        
        const noPlaneExists = await this.page.getByText('There are no aircraft worn to').isVisible();
        if(!noPlaneExists) {
            await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Plan bulk repair")').first());
        }
    }

    public async checkPlanes() {
        await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Plan")').first());
        await GeneralUtils.randomSleep(1000, 2000);
        
        await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Bulk check")').first());
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
            await GeneralUtils.humanClick(this.page, this.page.locator('button:has-text("Plan bulk check")').first());
        }
    }
}
