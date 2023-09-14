import 'dotenv/config';
import {
  config,
  Given,
  When,
  Then,
  Login,
  LogoutPage,
  SearchPage,
  expectedConfig,
  ReportPage,
} from '../header';
import { page } from '../features/support/hooks';
//import { OrderValidation } from '../page-objects/merchant-checkout/order_validation';
import { OrderPage } from '../page-objects/merchant-portal/order-details-page';

const login = new Login();
const logout = new LogoutPage();
const searchPage = new SearchPage();
const orderPage = new OrderPage();
const runReport = new ReportPage();
//const order_validation = new OrderValidation();

Given(
  'As a user with Role {string} for {string} I can successfully login to the {string} application',
  { timeout: 200 * 1000 },
  async function (userRole, merchantName, applicationName) {
    expectedConfig.LocalEnv.applicationName = applicationName;
    expectedConfig.LocalEnv.merchantName = merchantName;
    expectedConfig.merchantDetails.merchantName = merchantName;

    console.log('testing!......');
    let userEmail = '';
    let password = '';
    if (userRole == 'PlanPay Admin') {
      userEmail = `${process.env.PLANPAYADMIN_EMAIL}`;
      password = `${process.env.PLANPAYADMIN_PASSWORD}`;
    } else if (userRole == 'Merchant Admin') {
      userEmail = `${process.env.MERCHANTADMIN_EMAIL}`;
      password = `${process.env.MERCHANTADMIN_PASSWORD}`;
    } else if (userRole == 'Merchant Supervisor') {
      userEmail = `${process.env.MERCHANTSUPERVISOR_EMAIL}`;
      password = `${process.env.MERCHANTSUPERVISOR_PASSWORD}`;
    } else if (userRole == 'Merchant Agent') {
      userEmail = `${process.env.MERCHANTAGENT_EMAIL}`;
      password = `${process.env.MERCHANTAGENT_PASSWORD}`;
    }
    await login.login(
      userEmail,
      password,
      'true',
      applicationName,
      config.LocalEnv.env,
      `${process.env.PLANPAY_NEXT_URL}`
    );
  }
);

When(
  'I can verify the {string} details for {string} nOrders using {string} checkout',
  { timeout: 200 * 1000 },
  async function (detailsScreen, nOrders, checkoutType) {
    expectedConfig.planSummary.checkoutType = checkoutType;
    for (let i = 0; i < nOrders; i++) {
      const rowNumber = '//div[@data-rowindex=' + i + ']';
      const rowData = await page.locator(rowNumber).innerText();

      console.log('\u001b[1;33m Row ' + Number(i + 1), 'Data\u001b[1;37m.');
      const formatRowData = rowData.split(/\r?\n/);
      await orderPage.printEachPlanDetails(
        rowNumber,
        formatRowData,
        detailsScreen
      );
    }
    //await order_validation.validateOrder(); ///////// remove this and uncomment above code
  }
);

When(
  'I can successfully search based on the {string} value on the merchant Portal application and {string} verify',
  { timeout: 100 * 1000 },
  async (fieldValue, verifyOperation) => {
    // await searchPage.submitOperation(
    //   'Search',
    //   fieldName,
    //   fieldValue,
    //   verifyOperation
    // );
    await searchPage.navigateToSearchScreen(
      'Search',
      fieldValue,
      verifyOperation
    );
  }
);

When(
  'I can successfully filter based on {string} value on the merchant Portal application and {string} verify',
  async (fieldValue, verifyOperation) => {
    await searchPage.submitOperation(
      'Filter',
      'Status',
      fieldValue,
      verifyOperation
    );
  }
);

When(
  'I can successfully download a transaction report for month {string} using format {string}', //belong to download transcript file
  { timeout: 80 * 1000 },
  async (transactionMonth, reportFormat) => {
    console.log('step file');
    await runReport.downloadReport(transactionMonth, reportFormat);
  }
);

Then(
  'As a merchant I can successfully logout from application', //belong to download transcript file
  { timeout: 200 * 1000 },
  async function () {
    await logout.logout();
  }
);
