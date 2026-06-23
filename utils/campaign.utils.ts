import { Page } from "@playwright/test";
import { GeneralUtils } from "./general.utils";

export class CampaignUtils {
    page: Page;

    increaseAirlineReputation: boolean = false;
    campaignType: number = 1;
    campaignDuration: number = 4;

    constructor(page: Page) {
        if(process.env.INCREASE_AIRLINE_REPUTATION === 'true') {
            this.increaseAirlineReputation = true;
            this.campaignType = parseInt(process.env.CAMPAIGN_TYPE!);
            this.campaignDuration = parseInt(process.env.CAMPAIGN_DURATION!);
        }
        this.page = page;
    }

    private async createEcoFriendly() {
        // SOLUSI KOREKSI: Gunakan exact: false agar tidak terganggu oleh icon di dalam cell
        const isEcoFriendExists = await this.page.getByRole('cell', { name: 'Eco friendly', exact: false }).isVisible();
        if(!isEcoFriendExists) {
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'New campaign', exact: false }));
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('cell', { name: 'Eco-friendly Increases', exact: false }));
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: '$' }));
            console.log("Eco Friendly Campaign Created Successfully!");
        }
    }

    private async createReputation() {
        const campaignType = this.campaignType.toString();
        const durationOption = (Math.floor(this.campaignDuration / 4) || 1).toString();

        // SOLUSI KOREKSI: Deteksi teks maskapai tanpa icon
        const isAirlineReputationExists = await this.page.getByRole('cell', { name: 'Airline reputation', exact: false }).isVisible();
        if (!isAirlineReputationExists) {
            await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'New campaign', exact: false }));
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.getByRole('cell', { name: 'Increase airline reputation', exact: false }));
            await GeneralUtils.randomSleep(1000, 2000);
            
            await this.page.locator('#dSelector').selectOption(durationOption);
            await GeneralUtils.randomSleep(1000, 2000);
            
            await GeneralUtils.humanClick(this.page, this.page.locator(`tr:has(td:has-text("Campaign ${campaignType}")) .btn-danger`));
            console.log("Increased Airline Reputation Successfully!");
        }
    }

    public async createCampaign() {
        console.log('Create Campaign Started...')

        // SOLUSI KOREKSI: Mengganti tombol Marketing ber-icon ke penanda berbasis teks parsial
        await GeneralUtils.humanClick(this.page, this.page.getByRole('button', { name: 'Marketing', exact: false }));
        await GeneralUtils.randomSleep(1500, 3000);

        await this.createEcoFriendly();
        await GeneralUtils.randomSleep(1500, 3000);

        if(this.increaseAirlineReputation) {
            await this.createReputation();
        }

        console.log('Campaign Created Finished!');
    }
}
