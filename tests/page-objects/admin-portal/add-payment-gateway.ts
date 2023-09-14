import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../../setup/configurations/test-data-ts.conf';
import { merchantsConfig } from '../../setup/expected/merchant-ts.conf';
// const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
import { CreateMarchant } from '../admin-portal/create-merchant';
const createMerchant = new CreateMarchant();

export class AddPaymentGateway {
  saveBtn = '//button[@data-planpay-test-id="save"]';
  addPaymentBtn = '//button[@data-planpay-test-id="add-payment-gateway"]';
  vendor = '//input[@data-planpay-test-id="vendor"]';
  currency = '#searchableSelect-allowed-currency';
  label = '#text-label';
  PublicKey = '#text-public-key';
  stripeSecretKey = '#text-secret-key';
  stripeWebhookSecret = '#text-webhook-secret';
  adyenApikey = '#text-api-key';
  adyenMerchAcc = '#text-merchant-account';
  adyenHMACkey = '#text-hmac-key';
  adyenClientkey = '#text-client-key';
  adyenAPiUrlPrefix = '#text-api-url-prefix';
  braintreeMerchId = '#text-merchant-id';
  braintreeMerchAcc = '#text-merchant-account-id';
  // braintreePublicKey='#text-public-key';
  braintreePrivateKey = '#text-privatekey';
  createBtn = '//button[@data-planpay-test-id="create"]';
  addPlatformConfigBtn =
    '//button[@data-planpay-test-id="add-payment-platform"]';
  selectPlatform = '#select-payment-platform';
  selectCurrency = '#searchableSelect-currency';
  markupFeePercentage = '#number-markup-fee-percentage';
  transactionFee = '#number-transaction-fee-included-sales-tax';
  savePlatformBtn =
    '//button[@data-planpay-test-id="add-merchant-payment-platform"]';

  async addPyamentGateway(vendor: any, currency: any) {
    const rNum = await utility.enterRandomNumber(4);
    const labelText = vendor + '_' + currency + '_' + rNum;
    await page.waitForSelector(this.addPaymentBtn);
    await page.locator(this.addPaymentBtn).click();
    await page.locator(this.vendor).click({ force: true });
    await page.locator('li:text("' + vendor + '")').click({ force: true });
    await page.locator(this.currency).click({ force: true });
    await page.locator('li:text("' + currency + '")').click({ force: true });
    await page.fill(this.label, labelText);

    if (vendor == 'Stripe') {
      const publicKey = process.env.STRIPE_MN_AUD_PUBLIC_KEY;
      const secretKey = process.env.STRIPE_MN_AUD_SECRET_KEY;
      const webhookKey = process.env.STRIPE_MN_AUD_WEBHOOK_SECRET;
      await page.fill(this.PublicKey, publicKey);
      await page.fill(this.stripeSecretKey, secretKey);
      await page.fill(this.stripeWebhookSecret, webhookKey);
    }

    if (vendor == 'BrainTree') {
      const brainTreePublicKey = process.env.BRAINTREE_ENT_AUD_PUBLIC_KEY;
      const merchantId = process.env.BRAINTREE_ENT_AUD_MERCHANT_ID;
      const merchantAcc = process.env.BRAINTREE_ENT_AUD_MERCHANT_ACCOUNT_ID;
      const brainTreePrivateKey = process.env.BRAINTREE_ENT_AUD_PRIVATE_KEY;

      await page.fill(this.braintreeMerchId, merchantId);
      await page.fill(this.braintreeMerchAcc, merchantAcc);
      await page.fill(this.PublicKey, brainTreePublicKey);
      await page.fill(this.braintreePrivateKey, brainTreePrivateKey);
    }

    if (vendor == 'Adyen') {
      const adyenApikey = process.env.ADYEN_ENT_API_KEY;
      const adyenmerchantAcc = process.env.ADYEN_ENT_MERCHANT_ACCOUNT;
      const adyenhmacKey = process.env.ADYEN_ENT_HMAC_KEY;
      const adyenClientKey = process.env.ADYEN_ENT_CLIENT_KEY;
      const adyenApiurlprefix = process.env.ADYEN_ENT_API_URL_PREFIX;

      await page.fill(this.adyenApikey, adyenApikey);
      await page.fill(this.adyenMerchAcc, adyenmerchantAcc);
      await page.fill(this.adyenHMACkey, adyenhmacKey);
      await page.fill(this.adyenClientkey, adyenClientKey);
      await page.fill(this.adyenAPiUrlPrefix, adyenApiurlprefix);
    }
    await page.click(this.createBtn);
    utility.delay(2000);

    await createMerchant.savePaymentPlatformToExpected(labelText, currency);
  }

  async addPlatformConfiguration(currency: any) {
    await page.waitForSelector(this.addPlatformConfigBtn);
    await page.locator(this.addPlatformConfigBtn).click();

    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('merchant id', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );

    console.log(
      'merchantpaymentplatform length',
      merchantsConfig.MerchantPaymentPlatform.length
    );
    const label =
      merchantsConfig.MerchantPaymentPlatform[
        merchantsConfig.MerchantPaymentPlatform.length - 1
      ].label;
    const currency =
      merchantsConfig.MerchantPaymentPlatform[
        merchantsConfig.MerchantPaymentPlatform.length - 1
      ].currency;
    await page.locator(this.selectPlatform).click({ force: true });
    await page.locator('li:text("' + label + '")').click({ force: true });

    await page.locator(this.selectCurrency).click({ force: true });
    if (
      (await page.locator('li:text("' + currency + '")').isVisible()) !== true
    ) {
      console.log('The currency option is not available or already addded!');
    } else {
      await page.locator('li:text("' + currency + '")').click({ force: true });
      await page.locator(this.savePlatformBtn).click();
    }
  }
}
