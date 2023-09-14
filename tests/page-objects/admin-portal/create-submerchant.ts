import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../../setup/configurations/test-data-ts.conf';
import { merchantsConfig } from '../../setup/expected/merchant-ts.conf';
// const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
import { CreateMarchant } from '../admin-portal/create-merchant';
const createMerchant = new CreateMarchant();

export class CreateSubMarchant {
  merchantPageUrl = '#text-merchant-page-url';
  merchantCountry = '#searchableSelect-country';
  nextButton = '//button[@data-planpay-test-id="next"]';
  saveBtn = '//button[@data-planpay-test-id="save"]';
  addSubMerchantBtn = '//button[@data-planpay-test-id="add-sub-merchant"]';
  generateRandomCode = '//button[@data-planpay-test-id="generate-random-code"]';
  externalCodeText = '//input[@data-planpay-test-id="external-code"]';

  async navigateToMerchantDetailScreen() {
    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('Merchant ID from common JSON =>', common.merchant.id);

    const data = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );
    merchantsConfig.merchant = data.merchant;

    // console.log('merchantConfig extracted from file', merchantsConfig);
    const url = process.env.PLANPAY_NEXT_URL;
    const website = `${url}/portal/admin/merchants/${common.merchant.id}`;
    console.log('website ', website);
    await page.goto(website, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.once('load', () => console.log('Page loaded!'));
  }

  async createSubMerchant(merchantCountry: any) {
    await page.waitForSelector(this.addSubMerchantBtn);
    await page.locator(this.addSubMerchantBtn).click();
    await page.locator(this.generateRandomCode).click();
    const externalCode = await page.locator(this.externalCodeText).innerText();
    console.log('externalCode', externalCode);
    console.log(
      '----------------------Entering Business Information Sub-Merchant------------------'
    );
    await createMerchant.enterBusinessInformation();
    await page.fill(
      this.merchantPageUrl,
      `${config.merchants.merchantPageUrl}`
    );

    await utility.delay(2000);
    await page.waitForSelector(this.nextButton);
    await page.locator(this.nextButton).first().click();

    console.log(
      '----------------------Entering Billing Details Sub-Merchant------------------'
    );
    await createMerchant.enterBillingDetails('', '', '', merchantCountry);

    merchantsConfig.subMerchants[
      merchantsConfig.LocalEnv.nSubmerchant
    ].externalCode = externalCode;
    console.log('merchantConfig before saving', merchantsConfig);
    await page.locator(this.saveBtn).click();
    await utility.delay(1000);

    await createMerchant.getCreatedSubMerchant();

    await utility.writeIntoJsonFile(
      merchantsConfig.merchant.name,
      merchantsConfig,
      'configurations/merchants-products-configuration/' +
        merchantsConfig.merchant.name
    );
  }
}
