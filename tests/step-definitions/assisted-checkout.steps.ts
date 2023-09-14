import 'dotenv/config';
import { When } from '@cucumber/cucumber';
import { Utilities } from '../page-objects/utilities';
import { expectedConfig } from '../setup/expected/expected-ts.conf';
// import * as fs from 'fs';
import { AssistedPlan } from '../page-objects/merchant-checkout/assisted-plan';
import { databaseConnectDisconnect } from '../page-objects/backend-configuration/database-connect-disconnect';

// import * as mysql from 'mysql';
const assistedPlan = new AssistedPlan();
const utility = new Utilities();
const dbconnection = new databaseConnectDisconnect();
//new PR
When(
  'I can successfully create a plan in {string} currency having {string} date and {string} plan total and selected settings {string},{string} and {string} plan with a {string} user using {string} using {string} card and verifying the booking {string} on applications for the merchant {string} on {string} application using {string}',

  { timeout: 90 * 10000 },
  async function (
    currencyCode: any,
    redemptionDate: any,
    planTotal: any,
    depositSetting: any,
    installmentType: any,
    InstalmentDay: any,
    userCategory: any,
    paymentMethod: any,
    cardType: any,
    validationApplications_assistedCheckout: any,
    merchantName: any,
    applicationName: any,
    poilcyType: any
  ) {
    expectedConfig.planSummary.paymentMode = paymentMethod; //saving payment mode (manual OR payment link)
    expectedConfig.planSummary.installmentPeriod = installmentType;
    expectedConfig.LocalEnv.applicationName = applicationName;
    expectedConfig.planSummary.selectedInstallmentPeriod = installmentType;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig.LocalEnv.installmentType = installmentType;
    const path =
      'configurations/merchants-products-configuration/' +
      merchantName +
      '/' +
      merchantName +
      '.json';
    const localMerchant = await utility.readJsonFile(path); //reading merchant config file
    expectedConfig.merchantDetails.merchantId = localMerchant.merchant?.id;
    expectedConfig.merchantDetails.merchantName = merchantName;
    await dbconnection.getMerchantDetails(merchantName);
    expectedConfig.LocalEnv.environment = 'PR';
    await assistedPlan.assistedPlan(
      redemptionDate,
      planTotal,
      depositSetting,
      installmentType,
      InstalmentDay,
      cardType,
      userCategory,
      validationApplications_assistedCheckout,
      currencyCode,
      poilcyType
    );
    await utility.delay(2000);
  }
);

//UAT
When(
  'I can successfully create a plan in {string} currency having {string} date and {string} plan total and selected settings {string},{string} and {string} plan with a {string} user with {string} card and verifying the booking {string} on applications for the merchant {string} on {string} application using {string}',
  { timeout: 90 * 10000 },
  async function (
    currencyCode: any,
    redemptionDate: any,
    planTotal: any,
    depositSetting: any,
    installmentType: any,
    InstalmentDay: any,
    userCategory: any,
    cardType: any,
    validationApplications_assistedCheckout: any,
    merchantName: any,
    applicationName: any,
    poilcyType: any
  ) {
    expectedConfig.planSummary.installmentPeriod = installmentType;
    expectedConfig.LocalEnv.applicationName = applicationName;
    expectedConfig.planSummary.selectedInstallmentPeriod = installmentType;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig.LocalEnv.installmentType = installmentType;
    const path =
      'configurations/merchants-products-configuration/' +
      merchantName +
      '/' +
      merchantName +
      '.json';
    const localMerchant = await utility.readJsonFile(path); //reading merchant config file
    expectedConfig.merchantDetails.merchantId = localMerchant.merchant?.id;
    expectedConfig.merchantDetails.merchantName = merchantName;
    await dbconnection.getMerchantDetails(merchantName);

    await assistedPlan.assistedPlan(
      redemptionDate,
      planTotal,
      depositSetting,
      installmentType,
      InstalmentDay,
      cardType,
      userCategory,
      validationApplications_assistedCheckout,
      currencyCode,
      poilcyType
    );
    await utility.delay(2000);
  }
);
