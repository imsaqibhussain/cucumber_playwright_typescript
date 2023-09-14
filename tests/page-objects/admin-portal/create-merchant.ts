import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../../setup/configurations/test-data-ts.conf';
// import { first } from 'remeda';
import { merchantsConfig } from '../../setup/expected/merchant-ts.conf';
// import { databaseConnectDisconnect } from '../backend-configuration/database-connect-disconnect';
// const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';
export class CreateMarchant {
  merchantName = '#text-merchants-name';
  merchantEmail = '#text-merchants-email';
  merchantNumber = '#phone-phone-number';
  merchantSupportEmail = '#text-merchants-support-email';
  customerSupportEmail = '#text-customer-support-email';
  merchantPageUrl = '#text-merchant-website-url';
  defaultPaymentdeadline = '#number-default-payment-deadline-in-days';
  feePercentage = '#serviceFeePercentage';
  // defaultMinimumDepositType = '#select-default-minimum-deposit-type';
  defaultMinimumDepositType = '#select-default-minimum-deposit-type';
  depositValue = '#number-default-minimum-deposit-value';
  merchantBillingAddress = '#text-line-1';
  suburb = '#line2';
  state = '#text-state';
  city = '#text-city';
  postCode = '#text-postcode';
  status = '//li[@data-value="';
  merchantCountry = '#searchableSelect-country';
  merchantcurrencyCode = '//li[@data-value="';
  createMerchantButton = '#create-merchant';
  merchantGroup = '#searchableSelect-merchant-group';
  googleAnalyticsId = '#text-google-analytics-measurement-id';
  nextButton = '//button[@data-planpay-test-id="next"]';
  serviceFee = '#number-service-fee-percentage';
  markupFee = '#number-default-markup-fee-percentage';
  transactionFee = '#number-default-transaction-fee-included-sales-tax';
  saveButton = '//button[@data-planpay-test-id="save"]';
  createNewGroup = '//button[@data-planpay-test-id="create-new-group"]';
  textGroupName = '#text-group-name';
  createGroup = '//button[@data-planpay-test-id="create-group"]';
  saveBtn = '//button[@data-planpay-test-id="save"]';

  async navigateToCreateMerchantsScreen() {
    await page.waitForSelector(this.createMerchantButton);
    await page.locator(this.createMerchantButton).click();
  }

  async createNewMerchant(
    merchantCountry: any,
    groupStatus: any,
    defaultPaymentdeadline: any,
    depositType: string,
    depositValue: any,
    serviceFeePercentage: any,
    markUpFeePercentage: any,
    transactionFeeIncludedSalesTax: any
  ) {
    await this.navigateToCreateMerchantsScreen();
    await page.waitForSelector(this.merchantGroup);

    console.log('Merchant Group Status =>', groupStatus);

    if (groupStatus == 'New') {
      const rNum = await utility.enterRandomNumber(4);
      merchantsConfig.merchant.groupName =
        'merchant_' + `${config.merchants.merchantName}` + rNum;
      console.log('------------Adding New Group----------');
      await page.waitForSelector(this.createNewGroup);
      await page.locator(this.createNewGroup).click();
      await page.fill(this.textGroupName, merchantsConfig.merchant.groupName);
      await page.locator(this.createGroup).click();
    } else if (groupStatus == 'Existing') {
      await page.waitForSelector(this.merchantGroup);
      await page.locator(this.merchantGroup).click();
      console.log(await page.locator(this.merchantGroup).count());
    }

    console.log(
      '----------------------Entering Business Details------------------'
    );
    await this.enterBusinessInformation();
    await utility.delay(2000);
    await page.waitForSelector(this.nextButton);
    await page.locator(this.nextButton).first().click();

    console.log(
      '----------------------Entering Payment Information------------------'
    );
    await this.enterPaymentInformation(
      defaultPaymentdeadline,
      depositType,
      depositValue
    );
    await utility.delay(2000);
    await page.locator(this.nextButton).nth(1).click();

    console.log(
      '----------------------Entering Billing Details------------------'
    );
    await this.enterBillingDetails(
      serviceFeePercentage,
      markUpFeePercentage,
      transactionFeeIncludedSalesTax,
      merchantCountry
    );

    await page.locator(this.saveBtn).click();
    await utility.delay(1000);

    await this.getCreatedMerchant();

    console.log('merchantsConfig ', merchantsConfig);
    const path =
      'tests/setup/configurations/merchants-products-configuration/' +
      merchantsConfig.merchant.name;
    await utility.createFolder(path);

    await utility.writeIntoJsonFile(
      merchantsConfig.merchant.name,
      merchantsConfig,
      'configurations/merchants-products-configuration/' +
        merchantsConfig.merchant.name
    );

    await utility.saveMerchantToCommon(merchantsConfig.merchant.id);
    // await dbconnection.get_createdmerchant();
  }

  async enterBusinessInformation() {
    let merchantPreReq = 'merchant_';
    if (merchantsConfig.LocalEnv.operationType == 'create-submerchant') {
      merchantPreReq = 'sub_merchant_';
    }
    const rNum = await utility.enterRandomNumber(4);
    const merchant_name =
      merchantPreReq + `${config.merchants.merchantName}` + rNum;
    const merchant_email = await utility.generateEmail(
      merchantPreReq + `${config.merchants.merchantEmail}`
    );
    const merchant_number = `${config.merchants.merchantNumber}`;
    const merchant_supemail = await utility.generateEmail(
      merchantPreReq + `${config.merchants.merchantSupportEmail}`
    );
    const merchant_cus_supemail = await utility.generateEmail(
      merchantPreReq + `${config.merchants.customerSupportEmail}`
    );
    const merchant_pageurl = `${config.merchants.merchantPageUrl}`;
    const merchant_google_id = `${config.merchants.googleAnalyticId}`;

    await page.waitForSelector(this.merchantName);
    await page.fill(this.merchantName, merchant_name);
    await page.fill(this.merchantEmail, merchant_email);
    await page.fill(this.merchantNumber, merchant_number);
    await page.fill(this.merchantSupportEmail, merchant_supemail);
    await page.fill(this.customerSupportEmail, merchant_cus_supemail);

    //will be removed once set from devs
    if (merchantsConfig.LocalEnv.operationType == 'create-submerchant') {
      await page.fill('#text-merchant-page-url', merchant_pageurl);
      merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant] = {};
      merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant].id =
        '';
      merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant].name =
        merchant_name;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].companyEmail = merchant_email;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].phoneNumber = merchant_number;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].merchantSupportEmail = merchant_supemail;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].customerSupportEmail = merchant_cus_supemail;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].merchantPageUrl = merchant_pageurl;
    } else {
      await page.fill(this.merchantPageUrl, merchant_pageurl);
      //will not be removed
      await page.fill(this.googleAnalyticsId, merchant_google_id);
      merchantsConfig.merchant.googleAnalyticsMeasurementID =
        merchant_google_id;
      merchantsConfig.merchant.name = merchant_name;
      merchantsConfig.merchant.companyEmail = merchant_email;
      merchantsConfig.merchant.phoneNumber = merchant_number;
      merchantsConfig.merchant.merchantSupportEmail = merchant_supemail;
      merchantsConfig.merchant.customerSupportEmail = merchant_cus_supemail;
      merchantsConfig.merchant.merchantPageUrl = merchant_pageurl;
    }
  }

  async enterPaymentInformation(
    defaultPaymentdeadline: any,
    depositType: any,
    depositValue: any
  ) {
    await page.waitForSelector(this.defaultPaymentdeadline);
    await page.fill(this.defaultPaymentdeadline, defaultPaymentdeadline);

    await page.waitForSelector(this.defaultMinimumDepositType);
    await page.locator(this.defaultMinimumDepositType).click({ force: true });
    console.log(
      'ul lisy count',
      await page
        .locator(
          '//ul[@class="MuiList-root MuiList-padding MuiMenu-list css-r8u8y9"]'
        )
        .count()
    );
    await page
      .locator(
        '//ul[@class="MuiList-root MuiList-padding MuiMenu-list css-r8u8y9"]'
      )
      .first()
      .click();
    // await page.locator('text=' + depositType).click();

    await page.waitForSelector(this.depositValue);
    await page.fill(this.depositValue, depositValue);

    merchantsConfig.merchant.defaultPaymentDeadlineInDays =
      defaultPaymentdeadline;
    merchantsConfig.merchant.defaultMinimumDepositType = depositType;
    merchantsConfig.merchant.defaultMinimumDepositValue = depositValue;
  }

  async enterBillingDetails(
    serviceFeePercentage: any,
    markUpFeePercentage: any,
    transactionFeeIncludedSalesTax: any,
    merchantCountry: any
  ) {
    let billingPreReq = 'billing_';
    if (merchantsConfig.LocalEnv.operationType == 'create-submerchant') {
      billingPreReq = 'sub_billing_';
    }
    const billing_address =
      billingPreReq + `${config.merchants.merchantBillingAddress}`;
    const billing_city = billingPreReq + String(`${config.merchants.city}`);
    const billing_postcode = `${config.merchants.postCode}`;
    const billing_state = billingPreReq + String(`${config.merchants.state}`);

    await page.waitForSelector(this.merchantBillingAddress);
    await page.fill(this.merchantBillingAddress, billing_address);

    await page.fill(this.city, billing_city);
    await page.fill(this.postCode, billing_postcode);
    await page.fill(this.state, billing_state);
    await page.waitForSelector(this.merchantCountry);

    await page.locator(this.merchantCountry).click();
    console.log('merchantCountry', merchantCountry);

    if (merchantsConfig.LocalEnv.operationType !== 'create-submerchant') {
      await page.getByText(merchantCountry).nth(1).click({ force: true });
      await page.fill(this.serviceFee, serviceFeePercentage);
      await page.fill(this.markupFee, markUpFeePercentage);
      await page.fill(this.transactionFee, transactionFeeIncludedSalesTax);

      merchantsConfig.merchant.serviceFeePercentage = serviceFeePercentage;
      // merchantsConfig.MerchantPaymentPlatform[0].MerchantPaymentPlatformCurrency[0].markupFeePercentage =
      //   markUpFeePercentage;
      // merchantsConfig.MerchantPaymentPlatform[0].MerchantPaymentPlatformCurrency[0].transactionFeeIncludedSalesTax =
      //   transactionFeeIncludedSalesTax;
      merchantsConfig.MerchantPaymentPlatformCurrency[0].markupFeePercentage =
        markUpFeePercentage;
      merchantsConfig.MerchantPaymentPlatformCurrency[0].transactionFeeIncludedSalesTax =
        transactionFeeIncludedSalesTax;
      merchantsConfig.merchant.line1 = billing_address;
      merchantsConfig.merchant.city = billing_city;
      merchantsConfig.merchant.postcode = billing_postcode;
      merchantsConfig.merchant.state = billing_state;
      merchantsConfig.merchant.country = merchantCountry;
    } else {
      await page
        .locator('li:text("' + merchantCountry + '")')
        .click({ force: true });
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].line1 = billing_address;
      merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant].city =
        billing_city;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].postcode = billing_postcode;
      merchantsConfig.subMerchants[
        merchantsConfig.LocalEnv.nSubmerchant
      ].state = billing_state;
    }
  }

  async getCreatedMerchant() {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT id FROM Merchant WHERE name = ${merchantsConfig.merchant.name}`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    if (results.length != 0) {
      console.log('Merchant Id', results[0].id);
    }

    merchantsConfig.merchant.id = results[0].id;
  }

  async getCreatedSubMerchant() {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT id FROM SubMerchant WHERE name = ${
        merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant].name
      }
      AND merchantid= ${merchantsConfig.merchant.id}`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    if (results.length != 0) {
      console.log('Sub Merchant Id', results[0].id);
    }

    merchantsConfig.subMerchants[merchantsConfig.LocalEnv.nSubmerchant].id =
      results[0].id;
  }

  async navigateToMerchantDetailScreen() {
    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('Merchant ID from common JSON =>', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );
    // console.log('merchantsConfig extracted from file', merchantsConfig);
    const url = process.env.PLANPAY_NEXT_URL;
    const website = `${url}/portal/admin/merchants/${common.merchant.id}`;
    console.log('website ', website);
    await page.goto(website, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.once('load', () => console.log('Page loaded!'));
  }

  async savePaymentPlatformToExpected(label: any, currency: any) {
    let dataObj = {};
    console.log('inside savePaymentPlatformToExpected');
    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('merchant id', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM PaymentPlatform WHERE label = ${label}
      AND merchantid= ${common.merchant.id}`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    if (results.length != 0) {
      console.log('payment platform result', results[0]);
    }
    dataObj = results[0];
    merchantsConfig.MerchantPaymentPlatform.push(dataObj);
    merchantsConfig.MerchantPaymentPlatform[
      merchantsConfig.MerchantPaymentPlatform.length - 1
    ].currency = currency;

    await utility.writeIntoJsonFile(
      merchantsConfig.merchant.name,
      merchantsConfig,
      'configurations/merchants-products-configuration/' +
        merchantsConfig.merchant.name
    );
  }
}
