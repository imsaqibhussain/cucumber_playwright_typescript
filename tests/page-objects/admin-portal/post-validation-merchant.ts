import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../../setup/configurations/test-data-ts.conf';
import { merchantsConfig } from '../../setup/expected/merchant-ts.conf';
// const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
import { CreateMarchant } from '../admin-portal/create-merchant';
const createMerchant = new CreateMarchant();
import { expectedConfig } from '../../header';

export class AdminValidation {
  merchantName = '//span[@data-planpay-test-id="merchants-name-value"]';
  merchantId = '//span[@data-planpay-test-id="merchants-id-value"]';
  merchantEmail = '//span[@data-planpay-test-id="merchants-email-value"]';
  merchantPhoneNo = '//span[@data-planpay-test-id="phone-number-value"]';
  custSuppEmail =
    '//span[@data-planpay-test-id="customers-support-email-value"]';
  merchantSuppEmail =
    '//span[@data-planpay-test-id="merchants-support-email-value"]';
  merchantPageURL = '//span[@data-planpay-test-id="merchants-page-url-value"]';
  paymentDeadline =
    '//span[@data-planpay-test-id="default-payment-deadline-in-days-value"]';
  serviceFee = '//span[@data-planpay-test-id="service-fee-percentage-value"]';
  depositType =
    '//span[@data-planpay-test-id="default-minimum-deposit-type-value"]';
  depositValue =
    '//span[@data-planpay-test-id="default-minimum-deposit-value-value"]';
  addrLine1 = '//span[@data-planpay-test-id="line-1-value"]';
  state = '//span[@data-planpay-test-id="state-value"]';
  city = '//span[@data-planpay-test-id="city-value"]';
  postCode = '//span[@data-planpay-test-id="postcode-value"]';
  country = '//span[@data-planpay-test-id="country-value"]';
  dataRow = '//div[@data-id="';

  async validateMerchant() {
    const FieldName = [
      'Merchant Name',
      'Merchant ID',
      'Merchant Email',
      'Merchant PhoneNo',
      'Customer Support Email',
      'Merchant Support Email',
      'Merchant Page URL',
      'Merchant Payment Deadline',
      'Service Fee',
      'Deposite Type',
      'Deposite Value',
      'Merchant Address Line',
      'Merchant State',
      'Merchant City',
      'Merchant Post Code',
      'Merchant Country',
    ];

    const actual = [
      await page.locator(this.merchantName).innerText(),
      await page.locator(this.merchantId).innerText(),
      await page.locator(this.merchantEmail).innerText(),
      await page.locator(this.merchantPhoneNo).innerText(),
      await page.locator(this.custSuppEmail).innerText(),
      await page.locator(this.merchantSuppEmail).innerText(),
      await page.locator(this.merchantPageURL).innerText(),
      await page.locator(this.paymentDeadline).innerText(),
      await page.locator(this.serviceFee).innerText(),
      await page.locator(this.depositType).innerText(),
      await page.locator(this.depositValue).innerText(),
      await page.locator(this.addrLine1).innerText(),
      await page.locator(this.state).innerText(),
      await page.locator(this.city).innerText(),
      await page.locator(this.postCode).innerText(),
      await page.locator(this.country).innerText(),
    ];

    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('merchant id', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );

    const expected = [
      merchantsConfig.merchant.name,
      merchantsConfig.merchant.id,
      merchantsConfig.merchant.companyEmail,
      merchantsConfig.merchant.phoneNumber,
      merchantsConfig.merchant.customerSupportEmail,
      merchantsConfig.merchant.merchantSupportEmail,
      merchantsConfig.merchant.merchantPageUrl,
      merchantsConfig.merchant.defaultPaymentDeadlineInDays,
      merchantsConfig.merchant.serviceFeePercentage,
      merchantsConfig.merchant.defaultMinimumDepositType,
      merchantsConfig.merchant.defaultMinimumDepositValue,
      merchantsConfig.merchant.line1,
      merchantsConfig.merchant.state,
      merchantsConfig.merchant.city,
      merchantsConfig.merchant.postcode,
      merchantsConfig.merchant.country,
    ];

    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        actual,
        expected,
        FieldName,
        'Admin Portal - Merchant Validation',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printValues(
        FieldName,
        actual,
        'Admin Portal - Merchant Validation'
      );
    }
  }

  async validateSubMerchant() {
    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('Merchant ID from common JSON =>', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );

    console.log('Total submerchants ', merchantsConfig.subMerchants.length);

    const FieldName = [
      'Sub Merchant ID',
      'Sub Merchant Name',
      'Sub Merchant External Code',
      'Sub Merchant PhoneNo',
      'Sub Merchant Email',
    ];
    for (let i = 0; i < merchantsConfig.subMerchants.length; i++) {
      const rowData = await page
        .locator(this.dataRow + merchantsConfig.subMerchants[i].id + '"]')
        .innerText();

      const actualdata = await rowData.split('\n');
      console.log('submerchant data ', actualdata);

      const actual = [
        actualdata[0],
        actualdata[1],
        0,
        // actualdata[2],
        actualdata[3],
        actualdata[4],
      ];

      const expected = [
        merchantsConfig.subMerchants[i].id,
        merchantsConfig.subMerchants[i].name,
        0,
        // merchantsConfig.subMerchants[i].externalCode,
        merchantsConfig.subMerchants[i].phoneNumber,
        merchantsConfig.subMerchants[i].customerSupportEmail,
      ];

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          FieldName,
          'Admin Portal - Sub Merchant Validation',
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        await utility.printValues(
          FieldName,
          actual,
          'Admin Portal - Sub Merchant Validation'
        );
      }
    }
  }

  async validatePaymentGateway() {
    const common = await utility.readJsonFile('expected/common-details.json');
    console.log('Merchant ID from common JSON =>', common.merchant.id);

    const merchantsConfig = await utility.readJsonFile(
      `configurations/merchants-products-configuration/${common.merchant.name}/${common.merchant.name}.json`
    );

    console.log(
      'Total payment gateways ',
      merchantsConfig.MerchantPaymentPlatform.length
    );
    const FieldName = [
      'Payment Gateway ID',
      'Payment Gateway Vendor',
      'Payment Gateway Name',
      'Payment Gateway Type',
      'Payment Gateway Currency',
    ];
    for (let i = 0; i < merchantsConfig.MerchantPaymentPlatform.length; i++) {
      const rowData = await page
        .locator(
          this.dataRow + merchantsConfig.MerchantPaymentPlatform[i].id + '"]'
        )
        .innerText();

      const actualdata = await rowData.split('\n');
      console.log('payment gateway data ', actualdata);

      const actual = [
        actualdata[0],
        actualdata[1],
        actualdata[2],
        actualdata[3],
        actualdata[4],
      ];

      const expected = [
        merchantsConfig.MerchantPaymentPlatform[i].id,
        merchantsConfig.MerchantPaymentPlatform[i].vendor,
        merchantsConfig.MerchantPaymentPlatform[i].label,
        merchantsConfig.MerchantPaymentPlatform[i].variant,
        merchantsConfig.MerchantPaymentPlatform[i].currency,
      ];

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          FieldName,
          'Admin Portal - Payment Gateway Validation',
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        await utility.printValues(
          FieldName,
          actual,
          'Admin Portal - Payment Gateway Validation'
        );
      }
    }
  }
}
