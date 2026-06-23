import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class FleetUtils {
    page : Page;
    maxTry : number;

    constructor(page : Page) {
        this.page = page;
        this.maxTry = 8;
    }

    public async departPlanes() {
        let departAllVisible = await this.page.locator('#departAll').isVisible();
        console.log('Looking if there are any planes to be departed...')

        let count = 0; 
        while(departAllVisible && count < this.maxTry) {
            console.log('Departing 20 or less...');

            let departAll = this.page.locator('#departAll');
            
            // KOREKSI 4: Tunggu respons API rute penerbangan asli selesai diproses jaringan
            await Promise.all([
                this.page.waitForResponse(response => 
                    response.url().includes('route') && response.status() === 200, 
                    { timeout: 10000 }
                ).catch(() => console.log('Timeout waiting for API, doing fallback sleep')),
                GeneralUtils.humanClick(this.page, departAll)
            ]);

            // Tambahkan jeda santai manusia pasca-klik (proses berpikir/animasi)
            await GeneralUtils.randomSleep(1500, 3000);
            
            const cantDepartPlane = await this.page.getByText('×Unable to departSome A/C was').isVisible();
            if(cantDepartPlane)
                break;

            departAllVisible = await this.page.locator('#departAll').isVisible();
            count++;
        }
        console.log('Departed operations finished.');
    }
}
