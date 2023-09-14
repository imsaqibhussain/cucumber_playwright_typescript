import 'dotenv/config';
import { Given, When, Then } from '@cucumber/cucumber';
import { Login } from '../page-objects/portal-login-logout/login-page';
import { CreateMarchant } from '../page-objects/admin-portal/create-merchant';
import { config } from '../setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../header';
import { DownloadReports } from '../page-objects/admin-portal/download-reports';

import { CreateSubMarchant } from '../page-objects/admin-portal/create-submerchant';
import { merchantsConfig } from '../setup/expected/merchant-ts.conf';
import { AddPaymentGateway } from '../page-objects/admin-portal/add-payment-gateway';
import { AdminValidation } from '../page-objects/admin-portal/post-validation-merchant';

const login = new Login();
const downloadPlanReports = new DownloadReports();
const createNewMarchant = new CreateMarchant();
const addPaymentGateway = new AddPaymentGateway();
const createSubMarchant = new CreateSubMarchant();
const adminValidation = new AdminValidation();

Given(
  'As an {string} admin user for {string} I can successfully login to the {string} application',
  { timeout: 90 * 1000 },
  async function (userRole, merchantName, applicationName) {
    expectedConfig.LocalEnv.applicationName = applicationName;
    expectedConfig.LocalEnv.merchantName = merchantName;
    let email: any;
    let password: any;
    if (userRole === 'PlanPay Admin') {
      email = process.env.PLANPAYADMIN_EMAIL;
      password = process.env.PLANPAYADMIN_PASSWORD;
    }
    await login.login(
      email,
      password,
      'true',
      applicationName,
      `${config.LocalEnv.env}`,
      `${process.env.PLANPAY_NEXT_URL}`
    );
  }
);
When(
  'I can successfully {string} a merchant with {string} setting and {string} fee and {string} deposit type and {string} value',
  async function (
    operationName,
    defaultPaymentdeadline,
    feePercentage,
    depositType,
    depositValue
  ) {
    await createNewMarchant.CreateMarchant(
      defaultPaymentdeadline,
      feePercentage,
      depositType,
      depositValue
    );
  }
);

When(
  'I can successfully download {string} from {string} to {string}',
  async function (reportName, startDate, endDate) {
    await downloadPlanReports.downloadPlan(reportName, startDate, endDate);
  }
);

When(
  'I can successfully {string} a merchant in country {string} with a {string} group with {string} defaultPaymentdeadline setting, {string} deposit type and {string} value, {string} serviceFees, {string} markUpFeePercentage and {string} transactionFeeIncludedSalesTax',
  async function (
    operationName,
    merchantCountry,
    groupStatus,
    defaultPaymentdeadline,
    depositType,
    depositValue,
    serviceFeePercentage,
    markUpFeePercentage,
    transactionFeeIncludedSalesTax
  ) {
    // const path='tests/setup/configurations/merchants-products-configuration/Merchant Hotels345';
    // await utility.createFolder(path);

    merchantsConfig.LocalEnv.operationName = operationName;
    if (operationName == 'create') {
      await createNewMarchant.createNewMerchant(
        merchantCountry,
        groupStatus,
        defaultPaymentdeadline,
        depositType,
        depositValue,
        serviceFeePercentage,
        markUpFeePercentage,
        transactionFeeIncludedSalesTax
      );
    }
  }
);

//add sub merchant
When(
  'I can successfully {string} {string} sub-merchant in country {string}',
  async function (operationName, nSubMerchants, merchantCountry) {
    // const path='tests/setup/configurations/merchants-products-configuration/Merchant Hotels345';
    // await utility.createFolder(path);
    merchantsConfig.LocalEnv.operationType = 'create-submerchant';
    await createNewMarchant.navigateToMerchantDetailScreen();
    for (let i = 0; i < nSubMerchants; i++) {
      merchantsConfig.LocalEnv.nSubmerchant = i;
      await createSubMarchant.createSubMerchant(merchantCountry);
    }
  }
);

//add payment gateway
When(
  'I can successfully {string} a new {string} Payment Gateway with {string} currency',
  async function (operationName, vendor, currency) {
    merchantsConfig.LocalEnv.operationType = operationName;
    await createNewMarchant.navigateToMerchantDetailScreen();
    await addPaymentGateway.addPyamentGateway(vendor, currency);
  }
);

When(
  'I can successfully {string} merchant Payment Platform with currency {string} to the gateway',
  async function (operationName, currency) {
    await createNewMarchant.navigateToMerchantDetailScreen();
    await addPaymentGateway.addPlatformConfiguration(currency);
  }
);

Then(
  'I can carry out post validate operations on {string} on {string}',
  async function (screens, applicationName) {
    expectedConfig.LocalEnv.applicationName = applicationName;
    await createNewMarchant.navigateToMerchantDetailScreen();
    if (screens.includes('merchant-details')) {
      console.log('Screen Name => Merchant Details');
      await adminValidation.validateMerchant();
    }

    if (screens.includes('submerchants-details')) {
      console.log('Screen Name => Sub Merchant Details');
      await adminValidation.validateSubMerchant();
    }

    if (screens.includes('payment-gateway-details')) {
      console.log('Screen Name => Payment Gateway Details');
      await adminValidation.validatePaymentGateway();
    }
  }
);
