import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class MaintenanceUtils {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Menyimulasi pergerakan kursor mouse yang halus dari posisi saat ini ke koordinat target.
     * Menggunakan konsep interpolasi linear dengan sedikit noise acak agar lintasannya tidak lurus kaku.
     */
    private async humanMouseMove(targetX: number, targetY: number) {
        // Ambil ukuran viewport saat ini sebagai perkiraan posisi awal acak jika kursor belum terinisiasi
        const steps = Math.floor(Math.random() * 5) + 5; // 5-10 langkah pergerakan peluncuran kursor
        
        // Skenario kasaran pergerakan mouse dari posisi sekitar layar saat ini
        // Playwright tidak punya API untuk getMousePosition, jadi kita simulasikan koordinat acak ke target
        let currentX = targetX + (Math.random() * 200 - 100);
        let currentY = targetY + (Math.random() * 200 - 100);

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            // Rumus kelengkungan fana agar gerakan tidak garis lurus matematika sempurna
            const noiseX = (Math.random() - 0.5) * 5;
            const noiseY = (Math.random() - 0.5) * 5;
            
            const x = currentX + (targetX - currentX) * t + noiseX;
            const y = currentY + (targetY - currentY) * t + noiseY;

            await this.page.mouse.move(x, y);
            await this.page.waitForTimeout(Math.floor(Math.random() * 20) + 10); // Jeda mikro antar koordinat
        }
        
        // Pastikan kursor benar-benar mendarat tepat di titik akhir
        await this.page.mouse.move(targetX, targetY);
    }

    private async openPlanPanel() {
        const planButton = this.page.getByRole('button', { name: ' Plan' });
        await planButton.waitFor({ state: 'visible', timeout: 15000 });
        
        const box = await planButton.boundingBox();
        if (box) {
            await this.humanMouseMove(box.x + box.width / 2, box.y + box.height / 2);
        }
        await GeneralUtils.humanClick(this.page, planButton);
    }

    /**
     * Menyimulasi pergerakan scroll manusia yang acak (chaotic smooth scrolling).
     * Bisa mendadak cepat, pelan, putus-putus, bahkan kelewatan lalu naik lagi.
     */
    private async chaoticHumanScroll(targetY: number) {
        const steps = Math.floor(Math.random() * 4) + 3; 
        let currentScroll = 0;
        const scrollStyle = Math.floor(Math.random() * 4);
        const totalDistance = targetY > 0 ? targetY + 100 : targetY - 100; 
        const baseDelta = totalDistance / steps;

        for (let j = 0; j < steps; j++) {
            let deltaY = baseDelta;
            let delay = Math.floor(Math.random() * 100) + 50; 

            switch (scrollStyle) {
                case 0: 
                    if (j === Math.floor(steps / 2)) {
                        await GeneralUtils.randomSleep(400, 800); 
                    }
                    break;
                case 1: 
                    deltaY = baseDelta * (0.5 + (j / steps));
                    delay = Math.max(30, delay - (j * 15));
                    break;
                case 2: 
                    deltaY = baseDelta * (1.5 - (j / steps));
                    delay = delay + (j * 20);
                    break;
                case 3: 
                    if (j === steps - 1) {
                        await this.page.mouse.wheel(0, baseDelta + (targetY > 0 ? 80 : -80));
                        await GeneralUtils.randomSleep(300, 600); 
                        await this.page.mouse.wheel(0, targetY > 0 ? -80 : 80);
                        continue;
                    }
                    break;
            }

            await this.page.mouse.wheel(0, deltaY);
            currentScroll += deltaY;
            await this.page.waitForTimeout(delay);
        }
    }

    private async humanScrollToElement(element: any) {
        const box = await element.boundingBox();
        const viewport = this.page.viewportSize();

        if (box && viewport) {
            if (box.y + box.height > viewport.height || box.y < 0) {
                const targetY = box.y < 0 ? box.y - 50 : (box.y + box.height) - viewport.height + 100;
                await this.chaoticHumanScroll(targetY);
                await GeneralUtils.randomSleep(500, 1000);
            }
        }
    }

    /**
     * Fitur baru: Melakukan scroll balik ke atas secara penuh (mentok) secara bertahap.
     */
    private async scrollBackToTop() {
        console.log("Melakukan scroll balik ke atas secara manusiawi...");
        // Tarik roda mouse ke atas (nilai negatif) beberapa kali dengan sentakan acak
        const upSteps = Math.floor(Math.random() * 3) + 4; // 4 sampai 6 kali usapan ke atas
        for (let k = 0; k < upSteps; k++) {
            const scrollAmount = -(Math.floor(Math.random() * 200) + 200); // mengusap ke atas sekitar -200px sampai -400px
            await this.page.mouse.wheel(0, scrollAmount);
            await GeneralUtils.randomSleep(100, 250); // jeda singkat antar usapan
        }
        await GeneralUtils.randomSleep(800, 1500); // Berhenti sejenak setelah sampai di paling atas
    }

    public async repairPlanes() {
        await this.openPlanPanel();
        await GeneralUtils.randomSleep(1000, 2000);
        
        const bulkRepairButton = this.page.getByRole('button', { name: ' Bulk repair' });
        const boxRepair = await bulkRepairButton.boundingBox();
        if (boxRepair) {
            await this.humanMouseMove(boxRepair.x + boxRepair.width / 2, boxRepair.y + boxRepair.height / 2);
        }
        await GeneralUtils.humanClick(this.page, bulkRepairButton);
        await GeneralUtils.randomSleep(1000, 2000);
        
        await this.page.locator('#repairPct').selectOption('30');
        await GeneralUtils.randomSleep(1000, 2500);
        
        const noPlaneExists = await this.page.getByText('There are no aircraft worn to').isVisible();
        if (!noPlaneExists) {
            const planBulkRepairButton = this.page.getByRole('button', { name: 'Plan bulk repair' });
            const boxPlanRepair = await planBulkRepairButton.boundingBox();
            if (boxPlanRepair) {
                await this.humanMouseMove(boxPlanRepair.x + boxPlanRepair.width / 2, boxPlanRepair.y + boxPlanRepair.height / 2);
            }
            await GeneralUtils.humanClick(this.page, planBulkRepairButton);
        }
    }

    public async checkPlanes() {
        await this.openPlanPanel();
        await GeneralUtils.randomSleep(1000, 2000);
        
        const bulkCheckButton = this.page.getByRole('button', { name: ' Bulk check' });
        const boxCheck = await bulkCheckButton.boundingBox();
        if (boxCheck) {
            await this.humanMouseMove(boxCheck.x + boxCheck.width / 2, boxCheck.y + boxCheck.height / 2);
        }
        await GeneralUtils.humanClick(this.page, bulkCheckButton);
        
        await GeneralUtils.randomSleep(3000, 4500);
        
        let clicked = false;
        let didScroll = false; // Flag untuk mencatat apakah script pernah melakukan scroll ke bawah

        const dangerPlaneCards = this.page.locator('.bg-white:has(.text-danger)');
        const dangerChecksExists = await dangerPlaneCards.first().isVisible();
        
        if (dangerChecksExists) {
            let count = await dangerPlaneCards.count();        
            
            for (let i = 0; i < count; i++) {
                const cardElement = dangerPlaneCards.nth(i);

                // Cek koordinat untuk menentukan apakah butuh scroll
                const boxBefore = await cardElement.boundingBox();
                const viewport = this.page.viewportSize();
                if (boxBefore && viewport && (boxBefore.y + boxBefore.height > viewport.height || boxBefore.y < 0)) {
                    didScroll = true; // Tandai bahwa kita terpaksa melakukan scroll ke area bawah
                }

                // Jalankan human scroll dinamis
                await this.humanScrollToElement(cardElement);
                
                await cardElement.scrollIntoViewIfNeeded();
                await GeneralUtils.randomSleep(300, 600);

                // Gerakkan kursor mouse ke kartu pesawat secara halus sebelum mengklik
                const boxCard = await cardElement.boundingBox();
                if (boxCard) {
                    await this.humanMouseMove(boxCard.x + boxCard.width / 2, boxCard.y + boxCard.height / 2);
                }

                await GeneralUtils.humanClick(this.page, cardElement);
                clicked = true;

                await GeneralUtils.randomSleep(900, 1800);
            }
        }

        if (clicked) {
            // --- 🚀 FITUR SCROLL BALIK KE ATAS BERAKSI ---
            // Hanya lakukan scroll balik ke atas jika sebelumnya script pernah melakukan scroll ke bawah
            if (didScroll) {
                await this.scrollBackToTop();
            } else {
                await GeneralUtils.randomSleep(1000, 2000);
            }
            
            // Gerakkan kursor ke tombol final 'Plan bulk check' yang kini sudah kembali terlihat di atas
            const planBulkCheckButton = this.page.getByRole('button', { name: 'Plan bulk check' });
            const boxFinal = await planBulkCheckButton.boundingBox();
            if (boxFinal) {
                await this.humanMouseMove(boxFinal.x + boxFinal.width / 2, boxFinal.y + boxFinal.height / 2);
            }

            await GeneralUtils.humanClick(this.page, planBulkCheckButton);
        }
    }
}
