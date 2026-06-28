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

    public async getCurrentBalance() {
        const accountBalanceElement = this.page.locator('#headerAccount');
        if (await accountBalanceElement.count()) {
            const balanceText = await accountBalanceElement.first().innerText().catch(() => '');
            const parsed = parseInt(balanceText.replaceAll(',', '').trim(), 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }

        const accountLabel = this.page.getByText('Account', { exact: true }).first();
        if (await accountLabel.count()) {
            const balanceText = await accountLabel.locator('..').locator('div').first().innerText().catch(() => '');
            const parsed = parseInt(balanceText.replaceAll(',', '').replace(/[^0-9]/g, '').trim(), 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }

        return 0;
    }

    public async buyFuel() {
        console.log('Buying Fuel...')

        const fuelInput = this.page.getByPlaceholder('Amount to purchase');

        const getCurrentFuelPrice = async () => {
            let fuelText = await this.page.getByText('Total price$').locator('b > span').innerText();
            fuelText = fuelText.replaceAll(',', '');
            return parseInt(fuelText);
        }

        const getCurrentFuelUnitPrice = async () => {
            await GeneralUtils.humanClick(this.page, fuelInput);
            await GeneralUtils.randomSleep(500, 1200);

            await fuelInput.press('Control+a');
            await GeneralUtils.randomSleep(400, 900);
            await fuelInput.pressSequentially('1000', { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(800, 1400);

            const totalPrice = await getCurrentFuelPrice();
            return totalPrice > 0 ? totalPrice : 0;
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

        const getCurrentBalance = async () => {
            const accountBalanceElement = this.page.locator('#headerAccount');
            try {
                await accountBalanceElement.first().waitFor({ state: 'visible', timeout: 10000 });
            } catch {
                // continue to fallback if the header account element is not ready
            }

            if (await accountBalanceElement.count()) {
                const balanceText = await accountBalanceElement.first().innerText().catch(() => '');
                const parsed = parseInt(balanceText.replaceAll(',', '').trim(), 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
            }

            const accountLabel = this.page.getByText('Account', { exact: true }).first();
            if (await accountLabel.count()) {
                const balanceText = await accountLabel.locator('..').locator('div').first().innerText().catch(() => '');
                const parsed = parseInt(balanceText.replaceAll(',', '').replace(/[^0-9]/g, '').trim(), 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
            }

            return 0;
        }

        const currentBalance = await getCurrentBalance();
        console.log('Current Balance: ' + currentBalance);

        const emptyFuel = await getEmptyFuel();
        if(emptyFuel === 0) {
            console.log('Fuel tank is already full.');
            return;
        }

        const unitPrice = await getCurrentFuelUnitPrice();
        const curHolding = await getCurrentHolding();

        console.log('Current Fuel Unit Price (per 1000): ' + unitPrice);
        console.log('Current Balance: ' + currentBalance);

        const calculatePurchaseAmount = (capacity: number, balance: number, pricePer1000Liters: number) => {
            if (pricePer1000Liters <= 0 || balance <= 0) {
                return 0;
            }

            // Hitung total biaya jika membeli full kapasitas tangki yang kosong
            const fullCostForCapacity = (capacity / 1000) * pricePer1000Liters;
            
            // Jika uang cukup untuk memenuhi kapasitas kosong tangki, beli semuanya
            if (balance >= fullCostForCapacity) {
                return capacity;
            }

            // Jika uang tidak cukup, gunakan setengah dari balance saat ini (balance / 2)
            const halfBudget = Math.floor(balance / 2);
            
            // Rumus: (Setengah Uang ÷ Harga per 1000 Liter) * 1000 Liter agar presisi ke satuan Liter/Lbs
            const affordableLiters = Math.floor((halfBudget / pricePer1000Liters) * 1000);
            
            return Math.max(0, Math.min(capacity, affordableLiters));
        }

        const fillFuel = async (amountToBuy: number, label: string) => {
            if (amountToBuy <= 0) {
                console.log('Skipped fuel purchase because computed amount is zero or insufficient balance.');
                return;
            }

            await GeneralUtils.humanClick(this.page, fuelInput);
            await GeneralUtils.randomSleep(500, 1200);

            await fuelInput.press('Control+a');
            await GeneralUtils.randomSleep(400, 900);

            await fuelInput.pressSequentially(amountToBuy.toString(), { delay: Math.floor(Math.random() * 80) + 40 });
            await GeneralUtils.randomSleep(1000, 2000);

            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: ' Purchase' }));
            console.log(`Bought Fuel Successfully! Amount of fuel bought: ${amountToBuy} Litres${label}`);
        }

        if(unitPrice > 0 && unitPrice < this.maxFuelPrice) {
            const purchaseAmount = calculatePurchaseAmount(emptyFuel, currentBalance, unitPrice);
            await fillFuel(purchaseAmount, '');
        }
        else if(curHolding < 2000000 && unitPrice > 0 && unitPrice < 1250) {
            const suggestedAmount = 2000000;
            const purchaseAmount = calculatePurchaseAmount(suggestedAmount, currentBalance, unitPrice);
            await fillFuel(purchaseAmount, ' (Emergency Buy)');
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
