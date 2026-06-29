import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class MaintenanceUtils {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private async openPlanPanel() {
        const planButton = this.page.getByRole('button', { name: ' Plan' });
        await planButton.waitFor({ state: 'visible', timeout: 15000 });
        await GeneralUtils.humanClick(this.page, planButton);
    }

    public async repairPlanes() {
        await this.openPlanPanel();
        await GeneralUtils.randomSleep(1000, 2000);
        
        const bulkRepairButton = this.page.getByRole('button', { name: ' Bulk repair' });
        await GeneralUtils.humanClick(this.page, bulkRepairButton);
        await GeneralUtils.randomSleep(1000, 2000);
        
        await this.page.locator('#repairPct').selectOption('30');
        await GeneralUtils.randomSleep(1000, 2500);
        
        const noPlaneExists = await this.page.getByText('There are no aircraft worn to').isVisible();
        if (!noPlaneExists) {
            const planBulkRepairButton = this.page.getByRole('button', { name: 'Plan bulk repair' });
            await GeneralUtils.humanClick(this.page, planBulkRepairButton);
        }
    }

    public async checkPlanes() {
        // 1. Buka panel utama
        await this.openPlanPanel();
        await GeneralUtils.randomSleep(1000, 2000);
        
        // 2. Masuk ke menu Bulk Check
        const bulkCheckButton = this.page.getByRole('button', { name: ' Bulk check' });
        await GeneralUtils.humanClick(this.page, bulkCheckButton);
        
        // Menunggu data grid pesawat dimuat sepenuhnya secara natural
        await GeneralUtils.randomSleep(3000, 4500);
        
        let clicked = false;

        // 3. Cari kontainer kartu pesawat (.bg-white) yang memiliki teks kritis (.text-danger) di dalamnya
        const dangerPlaneCards = this.page.locator('.bg-white:has(.text-danger)');
        const dangerChecksExists = await dangerPlaneCards.first().isVisible();
        
        if (dangerChecksExists) {
            let count = await dangerPlaneCards.count();        
            
            for (let i = 0; i < count; i++) {
                const cardElement = dangerPlaneCards.nth(i);

                // Menggulung layar jika pesawat berada di baris bawah (aman untuk banyak pesawat)
                await cardElement.scrollIntoViewIfNeeded();
                
                // Jeda mikro seolah manusia memfokuskan mata kembali setelah layar bergeser
                await GeneralUtils.randomSleep(300, 700);

                // Klik pada area kartu pesawat menggunakan simulasi humanClick
                await GeneralUtils.humanClick(this.page, cardElement);
                clicked = true;

                // Jeda acak antar-klik pesawat agar tidak terdeteksi sebagai bot konstan
                await GeneralUtils.randomSleep(900, 1800);
            }
        }

        // 4. Eksekusi konfirmasi akhir jika ada pesawat yang terpilih
        if (clicked) {
            // Waktu jeda berpikir sebelum menekan tombol konfirmasi final
            await GeneralUtils.randomSleep(1500, 2500);
            
            const planBulkCheckButton = this.page.getByRole('button', { name: 'Plan bulk check' });
            await GeneralUtils.humanClick(this.page, planBulkCheckButton);
        }
    }
}
