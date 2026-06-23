import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

require('dotenv').config();

export class FuelUtils {
    maxFuelPrice : number;
    maxCo2Price : number;
    page : Page;

    constructor(page : Page) {
        this.maxFuelPrice = parseInt(process.env.MAX_FUEL_PRICE!);
        this.maxCo2Price = parseInt(process.env.MAX_CO2_PRICE!);
        this.page = page;

        console.log("Max Fuel Price: " + this.maxFuelPrice);
        console.log("Max Co2 Price: " + this.maxCo2Price);
    }

    public async buyFuel() {
        console.log('Buying Fuel...')

        const getCurrentFuelPrice = async () => {
            let fuelText = await this.page.getByText('Total price$').locator('b > span').innerText();
            fuelText = fuelText.replaceAll(',', '');
            return parseInt(fuelText);
        }

        const getCurrentHolding = async () => {
            let holdingText = await this.page.locator('#holding').innerText();
            holdingText = holdingText.replaceAll(',', '');
            return parseInt(holdingText);
        }

        const getEmptyFuel = async () => {
            const emptyText = (await this.page.locator('#remCapacity').innerText()).replaceAll(',', '')
            return parseInt(emptyText);
        }

        const emptyFuel = await getEmptyFuel();
        if(emptyFuel === 0) {
            console.log('Fuel tank is already full.');
            return;
        }

        const curFuelPrice = await getCurrentFuelPrice();
        const curHolding = await getCurrentHolding();

        console.log('Current Fuel Price: ' + curFuelPrice);

        // Beli bensin jika harga di bawah batas maksimum yang ditentukan pengguna
        if(curFuelPrice < this.maxFuelPrice) {
            const emptyFuelCapacity = (await this.page.locator('#remCapacity').innerText()).replaceAll(',', '');

            // KOREKSI: Ganti ke humanClick dan gunakan simulasi mengetik lambat
            await GeneralUtils.humanClick(this.page, this.page.getByPlaceholder('Amount to purchase'));
            await GeneralUtils.randomSleep(500, 1200);
            
            await this.page.getByPlaceholder('Amount to purchase').press('Control+a');
            await GeneralUtils.randomSleep(400, 900);
            
            await this.page.getByPlaceholder('Amount to purchase').pressSequentially(emptyFuelCapacity, { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Purchase' }));

            console.log('Bought Fuel Successfully! Amount of fuel bought: ' + emptyFuelCapacity + ' Litres');
        }
        // Kondisi darurat jika stok kritis (< 2M) meskipun harga agak mahal
        else if(curHolding < 2000000 && curFuelPrice < 1250) {
            await GeneralUtils.humanClick(this.page, this.page.getByPlaceholder('Amount to purchase'));
            await GeneralUtils.randomSleep(500, 1200);
            
            await this.page.getByPlaceholder('Amount to purchase').press('Control+a');
            await GeneralUtils.randomSleep(400, 900);
            
            await this.page.getByPlaceholder('Amount to purchase').pressSequentially('2000000', { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Purchase' }));

            console.log('Bought Fuel Successfully! Amount of fuel bought: 2000000 Litres (Emergency Buy)');
        } 
    }

    public async buyCo2() {
        console.log('Buying CO2...')

        const getCurrentCo2Price = async () => {
            let co2Text = await this.page.getByText('Total price$').locator('b > span').innerText();
            co2Text = co2Text.replaceAll(',', '');
            return parseInt(co2Text);
        }

        const getCurrentHolding = async () => {
            let holdingText = await this.page.locator('#holding').innerText();
            holdingText = holdingText.replaceAll(',', '');
            return parseInt(holdingText);
        }

        const getEmptyCO2 = async () => {
            const emptyText = (await this.page.locator('#remCapacity').innerText()).replaceAll(',', '')
            return parseInt(emptyText);
        }

        const emptyCo2 = await getEmptyCO2();
        if(emptyCo2 === 0) {
            console.log('CO2 tank is already full.');
            return;
        }

        const curCo2Price = await getCurrentCo2Price();
        const curHolding = await getCurrentHolding();

        console.log('Current Co2 Price: ' + curCo2Price);

        // Beli CO2 jika harga di bawah harga maksimum target
        if(curCo2Price < this.maxCo2Price) {
            const emptyCo2Capacity = (await this.page.locator('#remCapacity').innerText()).replaceAll(',', '');

            // KOREKSI: Ganti ke humanClick dan pressSequentially
            await GeneralUtils.humanClick(this.page, this.page.getByPlaceholder('Amount to purchase'));
            await GeneralUtils.randomSleep(500, 1200);
            
            await this.page.getByPlaceholder('Amount to purchase').press('Control+a');
            await GeneralUtils.randomSleep(400, 900);
            
            await this.page.getByPlaceholder('Amount to purchase').pressSequentially(emptyCo2Capacity, { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Purchase' }));

            console.log('Bought Co2 Successfully! Amount of co2 bought: ' + emptyCo2Capacity);
        }
        // Kondisi darurat jika stok kuota emisi kritis (< 1M)
        else if(curHolding < 1000000 && curCo2Price < 180) {
            await GeneralUtils.humanClick(this.page, this.page.getByPlaceholder('Amount to purchase'));
            await GeneralUtils.randomSleep(500, 1200);
            
            await this.page.getByPlaceholder('Amount to purchase').press('Control+a');
            await GeneralUtils.randomSleep(400, 900);
            
            await this.page.getByPlaceholder('Amount to purchase').pressSequentially('1000000', { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Purchase' }));

            console.log('Bought Co2 Successfully! Amount of co2 bought: 1000000 (Emergency Buy)');
        }
    }
}
