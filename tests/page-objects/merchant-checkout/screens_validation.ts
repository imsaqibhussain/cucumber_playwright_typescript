import { expect } from '@playwright/test';
// import * as mysql from 'mysql';
import { page } from '../../features/support/hooks';
import { InstalmentPaidConfirmation } from '../notification-service/installmentPaidConfirmation';
import { PlanCompletionConfirmation } from '../notification-service/planCompletionConfirmation';
import { EmailTemplates } from '../notification-service/emailTemplates';
// import { BookingCofirmation } from '../notification-service/bookingConfirmation';
import { OrderValidation } from '../merchant-checkout/order_validation';
import { AllOrdersPage } from '../customer-portal/all-orders-page';
import { ReportPage } from '../merchant-portal/transaction-reporting';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { paymentPlatformTransaction } from '../events-transactions/payment-platform-transaction/payment-platform-transaction';
import { planRefunded } from '../events-transactions/payment-platform-transaction/planRefunded';
import { AdminOrderValidation } from '../admin-portal/order_validation';
// import { eventsTransactions } from '../backend-configuration/events-transactions';
import { planCancellationConfirmation } from '../../page-objects/notification-service/planCancellationConfirmation';
import { mailinatorLogin } from '../notification-service/login';
// import { eventsTransactionsDueRequestedSucceeded } from '../../page-objects/events-transactions/events-transactions-due-requested-succeeded/events-transactions-due-requested-succeeded';

// const eventsTransactionsSucceeded = new eventsTransactionsDueRequestedSucceeded();
const m_login = new mailinatorLogin();
const planCompletionConfirmation = new PlanCompletionConfirmation();
const installmentPaidConfirmation = new InstalmentPaidConfirmation();
const EmailTemplatesConfirmation = new EmailTemplates();
// const confirmBooking = new BookingCofirmation();
const order_validation = new OrderValidation();
const allorderpage = new AllOrdersPage();
// const calculation = new calculations();
// const events_and_transaction = new eventsTransactions();
const cancelConfirm = new planCancellationConfirmation();
const adminPortal = new AdminOrderValidation();
const payment_platform_transaction = new paymentPlatformTransaction();
const plan_Refunded = new planRefunded();
import { Login } from '../portal-login-logout/login-page';
import { Utilities } from '../utilities';
import { calculations } from './calculations';
// import { kMaxLength } from 'buffer';
// import { LogoutPage } from '../portal-login-logout/logout-page';
const runReport = new ReportPage();
const login = new Login();
// const logout = new LogoutPage();
const utility = new Utilities();

export class ScreensValidation {
  verifyInstallmentslocator = '#installment_number';
  verifyInstallmentAmountlocator = '#Installment_Amount';
  RemainderDesc_Summary =
    "(//span[contains(@class,'MuiTypography-root MuiTypography-overline')])[2]";
  RemainderDesc_Widget =
    '(//span[contains(@class,"planpay-MuiTypography-root planpay-MuiTypography-overline")])[2]';
  bookingTotalSummary = '#Total_Cost';
  fullNameLocator = '#customer_name';
  installmentError = "//div[@class='planpay-MuiStack-root css-1xhj18k']";
  priceWidget = 'strong';
  pricePreviewFetch = '#price_preview_fetch';
  // '(//p[contains(@class,"planpay-MuiTypography-root planpay-MuiTypography-body1 css-9l3uo3")])';
  // planpayNotAvailable = "//div[@class='css-ydonnk']/span[1]";
  // planpayNotAvailable =
  // "//body/div[@id='root']/div[@class='adversarialWrapper']/div[@class='MuiGrid-root MuiGrid-container css-1cbhj1q']/div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-md-6 css-1iztu0x']/div[contains(@class,'MuiBox-root css-1crygsc')]/div[@class='MuiBox-root css-tr0r3x']/div[@class='MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 MuiAccordion-root MuiAccordion-rounded Mui-expanded css-2phtsc']/div[@class='MuiCollapse-root MuiCollapse-vertical MuiCollapse-entered css-c4sutr']/div[@class='MuiCollapse-wrapper MuiCollapse-vertical css-hboir5']/div[@class='MuiCollapse-wrapperInner MuiCollapse-vertical css-8atqhb']/div[@role='region']/div[@class='MuiAccordionDetails-root css-i1a7ls']/div/div/div/div/div/div[@class='planpay-MuiStack-root css-ydonnk']/span[1]";
  planpayNotAvailable =
    "//div[@class='planpay-MuiStack-root css-ydonnk']/span[1]";
  currencyLocator = '#currencyCode';
  deposit = '[data-planpay-test-id="first_instalment_amount"]';
  merchantName = '[data-planpay-test-id="merchant_name"]';
  productQuantity = '//span[@data-planpay-test-id="item_quantity"]';
  productname = '[data-planpay-test-id="item_name"]';
  totalCost = '[data-planpay-test-id="Total_Cost"]';
  firstInstalment = '[data-planpay-test-id="due_today"]';
  firstInstalmentPercentage =
    '[data-planpay-test-id="first_instalment_percentage"]';
  instalment_number = '[data-planpay-test-id="instalment_number"]';
  instalment_amount = '[data-planpay-test-id="instalment_amount"]';
  currencyCode = '[data-planpay-test-id="currencyCode"]';
  plan_frequency = '[data-planpay-test-id="plan_frequency"]';
  next_instalment_date = '[data-planpay-test-id="next_instalment_date"]';
  last_instalment_date = '[data-planpay-test-id="last_instalment_date"]';
  cadence_day = '[data-planpay-test-id="cadence_day"]';

  async validateScreens(validationScreens: any, merchantName: any) {
    expectedConfig.LocalEnv.merchantName = merchantName;
    await utility.delay(2000);

    const expectedValues = await utility.commonJsonReadFunc('expectedFile');
    const commonDetails = await utility.readCustomerDetails();
    const eventProcessorValues = await utility.readEventProcessorValues();

    let x = expectedValues.paidPayments.length - 1;
    if (x < 0) {
      x = 0;
    }
    const installmentPaidEmailSubject = [];
    let installmentFailedEmailSubject = '';
    if (expectedValues.latePayments.length > 0) {
      installmentFailedEmailSubject =
        'Declined payment ' + expectedValues.latePayments[0].instalment;
    }

    while (x != 0) {
      const upcomingPaymentNumber =
        expectedValues.paidPayments[expectedValues.paidPayments.length - x]
          .instalment;
      installmentPaidEmailSubject.push(
        'Payment ' + upcomingPaymentNumber + ' received'
      );
      x = x - 1;
    }

    let validationScreen: any = [];
    if (validationScreens.includes(',')) {
      validationScreen = await validationScreens.split(',');
    } else {
      validationScreen.push(validationScreens);
    }
    expectedConfig.merchantDetails = expectedValues.merchantDetails;
    expectedConfig.planDetails = expectedValues.planDetails;
    expectedConfig.planSummary = expectedValues.planSummary;
    expectedConfig.customer = expectedValues.customer;

    //let verifyFlag = config.LocalEnv.verifyFlag;
    // console.log("verifyFlag for booking email" + verifyFlag);
    for (let i = 0; i < (await validationScreen.length); i++) {
      let eventErrorExists = 'false';

      if (eventProcessorValues.length > 0) {
        for (let a = 0; a < eventProcessorValues.length; a++) {
          if (
            eventProcessorValues[a].handlerName == validationScreen[i] &&
            commonDetails.eventProcessorError === 'true'
          ) {
            eventErrorExists = 'true';
            console.log(
              '\x1b[31m	 Error count againt ' +
                validationScreen[i] +
                ' is greater than one \x1b[37m	'
            );
          }
        }
      }
      // const customerEmail = await utility.readExpectedValue(); //reading email from json file
      if (validationScreen[i] === 'transactionReport') {
        await login.login(
          `${process.env.USER_EMAIL_ALICE}`,
          `${process.env.USER_PASSWORD_ALICE}`,
          'true',
          'merchant-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        const nameOfMonth = new Date().toLocaleString('default', {
          month: 'long',
        });
        await runReport.downloadReport(nameOfMonth, 'PDF');
      }

      if (
        validationScreen[i] === 'PlanCreatedSendCustomerNotification' &&
        eventErrorExists === 'false'
      ) {
        const subject = "You've got a Plan";
        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedConfig.customer.Email,
          subject,
          validationScreen[i],
          'false'
        );
      }

      if (
        validationScreen[i] ===
          'CustomerPaymentSucceededSendCustomerNotification' &&
        expectedValues.planSummary.totalNoOfInstallments !=
          expectedValues.paidPayments.length &&
        eventErrorExists === 'false' &&
        expectedValues.flags.blockedPayInstalment === 'false'
      ) {
        console.log('CustomerPaymentSucceededSendCustomerNotification');

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedValues.customer.Email,
          installmentPaidEmailSubject,
          validationScreen[i],
          'true'
        );
      }

      if (
        validationScreen[i] ===
          'CustomerAdvancePaymentSucceededSendCustomerNotification' &&
        expectedValues.planSummary.totalNoOfInstallments !=
          expectedValues.paidPayments.length &&
        eventErrorExists === 'false'
      ) {
        console.log('CustomerAdvancePaymentSucceededSendCustomerNotification');

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedValues.customer.Email,
          installmentPaidEmailSubject,
          validationScreen[i],
          'true'
        );
      }

      if (
        validationScreen[i] === 'CustomerPlanChangedSendCustomerNotification' &&
        expectedValues.planSummary.totalNoOfInstallments !=
          expectedValues.paidPayments.length &&
        eventErrorExists === 'false'
      ) {
        console.log('CustomerPlanChangedSendCustomerNotification');

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedValues.customer.Email,
          'Your plan has changed',
          validationScreen[i],
          'true'
        );
      }
      // if (
      //   validationScreen[i] === 'instalmentPaidEmail' &&
      //   expectedValues.planDetails.totalNoOfInstallments !=
      //     expectedValues.paidPayments.length
      // ) {
      //   console.log('instalmentPaidEmail');
      //   await EmailTemplatesConfirmation.verifyEmailTemplates(
      //     expectedValues.customer.Email,
      //     installmentPaidEmailSubject,
      //     validationScreen[i],
      //     'false'
      //   );
      // }

      if (
        validationScreen[i] === 'PlanCompletedSendCustomerNotification' &&
        expectedValues.planSummary.planStatus == 'Completed' &&
        eventErrorExists === 'false'
      ) {
        const subject = 'Your Plan is complete';
        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedConfig.customer.Email,
          subject,
          validationScreen[i],
          'false'
        );
      }

      if (
        validationScreen[i] === 'PlanCreatedSendMerchantNotification' &&
        eventErrorExists === 'false'
      ) {
        const subject = "You've sold a Plan";
        const merchantName = expectedValues.merchantDetails.merchantName;
        console.log('merchnt name ', merchantName);

        const merchantConfiguration = await utility.commonJsonReadFunc(
          'jsonFile'
        );
        const merchantEmail =
          merchantConfiguration.merchant.merchantSupportEmail;

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          merchantEmail,
          subject,
          validationScreen[i],
          'false'
        );
      }

      if (
        validationScreen[i] === 'PlanCompletedSendMerchantNotification' &&
        eventErrorExists === 'false'
      ) {
        // const subject = "Your Customer's Plan is complete";
        const subject =
          expectedValues.customer.firstName +
          ' ' +
          expectedValues.customer.lastName +
          ' has completed a plan';
        const merchantConfiguration = await utility.commonJsonReadFunc(
          'jsonFile'
        );
        const merchantEmail =
          merchantConfiguration.merchant.merchantSupportEmail;

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          merchantEmail,
          subject,
          validationScreen[i],
          'false'
        );
      }

      if (
        validationScreen[i] === 'PlanCancelledSendMerchantNotification' &&
        eventErrorExists === 'false'
      ) {
        await m_login.mailinatorlogin();
        const subject = "Your Customer's Plan is cancelled";
        const merchantConfiguration = await utility.commonJsonReadFunc(
          'jsonFile'
        );
        const merchantEmail =
          merchantConfiguration.merchant.merchantSupportEmail;

        await EmailTemplatesConfirmation.verifyEmailTemplates(
          merchantEmail,
          subject,
          validationScreen[i],
          'false'
        );
      }
      if (validationScreen[i] === 'admin-portal') {
        await login.login(
          `${process.env.PLANPAYADMIN_EMAIL}`,
          `${process.env.PLANPAYADMIN_PASSWORD}`,
          'true',
          'admin-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        console.log('testing!...');
        await adminPortal.validateOrder();
      }

      if (
        validationScreen[i] ===
          'CustomerPaymentFailedSendCustomerNotification' &&
        eventErrorExists === 'false' &&
        expectedValues.flags.blockedPayInstalment === 'false'
      ) {
        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedValues.customer.Email,
          installmentFailedEmailSubject,
          validationScreen[i],
          'false'
        );
      }

      if (validationScreen[i] == 'merchant-portal') {
        await login.login(
          `${process.env.MERCHANTADMIN_EMAIL}`,
          `${process.env.MERCHANTADMIN_PASSWORD}`,
          'true',
          'merchant-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        await order_validation.validateOrder(); //merchantName ->in argument
        if (expectedConfig.planSummary.planStatus == 'Cancelled') {
          await utility.merchantPortalOrderDetailsPage();
          await cancelConfirm.verifyOrderStatusFromMerchantPortal();
        }
      }
      if (validationScreen[i] == 'customer-portal') {
        const customerData = await utility.readJsonFile(
          'expected/common-details.json'
        );
        let password: any;
        if (customerData.isResetFlag == 'true') {
          password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
        } else {
          password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
        }
        await login.login(
          expectedValues.customer.Email,
          password,
          // `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
          'true',
          'customer-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        await allorderpage.navigateAndVerifyOrder(
          validationScreen[i],
          'Upcoming-Payments,All orders',
          'Summary,Details',
          merchantName,
          expectedValues.planDetails.producItem
        );
        if (expectedConfig.planSummary.planStatus == 'Cancelled') {
          await utility.customerPortalOrderDetailsPage();
          await cancelConfirm.verifyOrderStatusFromCustomerPortal();
        }
        // await logout.logout();
      }
      if (
        validationScreen[i] == 'successfulInstallmentPaidEmail' &&
        expectedValues.planSummary.totalNoOfInstallments !=
          expectedValues.planSummary.noOfInstallmentsPaid
      ) {
        //totalnumberintalment>=2
        await installmentPaidConfirmation.verifyPaidInstallment(
          expectedValues.customer.Email,
          installmentPaidEmailSubject
        );
      }
      if (
        validationScreen[i] == 'successfulCompletionEmail' &&
        expectedValues.planSummary.totalNoOfInstallments ===
          expectedValues.planSummary.noOfInstallmentsPaid
      ) {
        console.log('');
        //totalnumberintslment===totalpaidintsalment
        await planCompletionConfirmation.verifyCompletionConfirmation(
          expectedValues.customer.Email
        );
      }

      if (validationScreen[i].includes('events-transactions')) {
        console.log(
          '-------------------events and transactions-------------------'
        );
        const path =
          '../../page-objects/events-transactions/' +
          expectedValues.planSummary.paymentPlatform_variant +
          '/' +
          validationScreen[i] +
          '/' +
          validationScreen[i] +
          '.ts';
        console.log('path:', path);
        const { eventsTransactionsRequest } = await import(path);
        const eventsTransactions_request =
          await new eventsTransactionsRequest();
        await eventsTransactions_request.eventsTransaction();
      }
      if (
        validationScreen[i] == 'PlanCancelledSendCustomerNotification' &&
        eventErrorExists === 'false'
      ) {
        const subject = 'Your Plan with PlanPay has been cancelled';
        await EmailTemplatesConfirmation.verifyEmailTemplates(
          expectedConfig.customer.Email,
          subject,
          validationScreen[i],
          'false'
        );
      }
      if (validationScreen[i] == 'paymentHistory-planRefunded') {
        await plan_Refunded.paymentPlanRefunded();
      }
      if (
        validationScreen[i] == 'paymentHistory-planCreated' ||
        validationScreen[i] == 'paymentHistory-payInstalment'
      ) {
        await payment_platform_transaction.verifyTransaction(
          validationScreen[i]
        );
      }
    }
  }

  async checkCadence(screenName: string) {
    if (screenName != 'Widget') {
      if (screenName == 'Summary') {
        this.installmentError = "//div[@class='MuiStack-root css-1xhj18k']";
      } else if (screenName == 'updateCadence') {
        this.installmentError =
          "//p[@class='MuiTypography-root MuiTypography-body1 css-jligq9']";
      } else {
        this.installmentError =
          "//div[@class='planpay-MuiStack-root css-1xhj18k']";
      }
      ('MuiStack-root css-1xhj18k');
    }
    console.log('-------------checkCadence-------------');
    let flag = 'false';
    let Msg = '';
    let instalmentAmount = Number(expectedConfig.planSummary.installmentAmount);
    if (screenName == 'price_preview_widget') {
      instalmentAmount = Number(
        expectedConfig.planSummary['Weekly'].instalmentAmount
      );
    }
    // data.planDetails.installmentAmount = 1020; // remove this
    if (
      expectedConfig.planSummary.paymentPlatform_variant == 'Managed' &&
      (instalmentAmount > 1000 ||
        Number(expectedConfig.depositSettings.depositExcludingRemainder) > 1000)
    ) {
      console.log('cond 1');
      flag = 'true';
      Msg =
        expectedConfig.planSummary.installmentPeriod +
        ' payments are not available for this checkout';
    }
    //if no of instalments are lessthan 1
    else if (Number(expectedConfig.planSummary.numberOfInstalment) < 1) {
      console.log('cond 2');

      flag = 'true';
      Msg =
        expectedConfig.planSummary.installmentPeriod +
        ' payments are not available for this checkout';
    }
    //if deposit is greater than max deposit
    else if (
      Number(expectedConfig.depositSettings.depositExcludingRemainder) >
      Number(expectedConfig.depositSettings.MaxDepositAmount)
    ) {
      console.log('cond 3');

      flag = 'true';
      Msg =
        'Due today needs to be $' +
        expectedConfig.depositSettings.MaxDepositAmount +
        ' or less to select the ' +
        expectedConfig.planSummary.installmentPeriod +
        ' option';
    }
    //if deposit is less than min deposit
    else if (
      Number(expectedConfig.depositSettings.depositExcludingRemainder) <
      Number(expectedConfig.depositSettings.requiredMinimumDeposit)
    ) {
      console.log('cond 4');

      flag = 'true';
      Msg =
        'Due today needs to be $' +
        expectedConfig.depositSettings.requiredMinimumDeposit +
        ' or more to select the ' +
        expectedConfig.planSummary.installmentPeriod +
        ' option';
    }

    if (flag == 'true') {
      if (screenName == 'price_preview_widget') {
        expectedConfig.flags.blockedCheckout = 'true';
        this.installmentError = '[data-test-id="plan-pay-widget-error-1"]';
        Msg = await page.locator(this.installmentError).innerText();
        expect(Msg).toEqual(
          'Oops! It seems like PlanPay could not create a plan for your holiday.'
        );
        console.log(
          '\x1b[31m Oops! It seems like PlanPay could not create a plan for your holiday. \x1b[37m'
        );
        return;
      }
      console.log('screenname ', screenName);
      if (screenName == 'Widget' || screenName == 'Summary') {
        console.log('*************here**************');
        return flag;
      }
      console.log('flag is true ');
      if (screenName == 'updateCadence') {
        expectedConfig.flags.updateCadenceblocked = 'true';
        console.log(
          'error value',
          await page.locator(this.installmentError).innerText()
        );
        await expect(
          await page.locator(this.installmentError).innerText()
        ).toEqual(
          expectedConfig.planSummary.installmentPeriod +
            ' frequency is not available. Please select a different frequency option.'
        );
      } else {
        expectedConfig.flags.blockedCheckout = 'true';
        if (expectedConfig.planSummary.installmentPeriod == 'Weekly') {
          // await utility.delay(3000)
          // await page.waitForLoadState()
          // await utility.delay(3000)
          // await page.waitForSelector(this.planpayNotAvailable);
          // await expect(page.locator(this.planpayNotAvailable)).toHaveText(
          //   'PlanPay is not available for this purchase.'
          // );

          const maxAttempts = 3; // Maximum number of attempts

          try {
            await page.waitForLoadState();
            await utility.delay(4000);

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                await page.waitForSelector(this.planpayNotAvailable);
                const element = await page.locator(this.planpayNotAvailable);
                await expect(element).toHaveText(
                  'PlanPay is not available for this purchase.'
                );
                break; // Exit the loop if the locator is found and the assertion passes
              } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                if (attempt < maxAttempts) {
                  console.log('Retrying...');
                  await page.waitForTimeout(2000); // Adjust the delay as needed
                } else {
                  throw new Error('Locator not found after multiple attempts');
                }
              }
            }
          } catch (error) {
            console.error('Error:', error.message);
          }

          console.log(
            '\x1b[33m PlanPay is not available for this purchase. \x1b[37m'
          );
        } else {
          await page.waitForLoadState();
          await page.waitForSelector(this.verifyInstallmentAmountlocator);
          await expect(
            page.locator(this.verifyInstallmentAmountlocator)
          ).toHaveText('');
          if (screenName == 'Summary') {
            console.log('here first');
            await page.locator(this.installmentError).first().isVisible();
          } else {
            await page.locator(this.installmentError).isVisible();
          }
          await expect(page.locator(this.verifyInstallmentslocator)).toHaveText(
            '--'
          );
          console.log('Break');
          if (screenName == 'Summary') {
            console.log(
              '\x1b[33m' +
                (await page
                  .locator(this.installmentError)
                  .first()
                  .innerText()) +
                '\x1b[37m'
            );
            await expect(
              await page.locator(this.installmentError).first().innerText()
            ).toEqual(Msg);
          } else {
            console.log(
              '\x1b[33m' +
                (await page.locator(this.installmentError).innerText()) +
                '\x1b[37m'
            );
            await expect(
              await page.locator(this.installmentError).innerText()
            ).toEqual(Msg);
          }
        }
      }
    }
  }

  async widgetAndSummaryValidation(screenName: string) {
    console.log(
      'currency symbol**********************',
      calculations.merchantCurrency
    );
    // let currency_sign = '$';
    // if (expectedConfig.planSummary.checkoutCurrency == 'GBP') {
    //   currency_sign = '£';
    // }
    await this.checkCadence(screenName);
    if (expectedConfig.flags.blockedCheckout != 'true') {
      console.log(
        '\n' +
          '%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m In Checkout ' +
          screenName +
          ' function \x1b[37m%%%%%%%%%%%%%%%%%%%%%%%%%' +
          '\n'
      );
      console.log(
        '\n' +
          '%%%%%%%%%%%%%%%%%%%\x1b[35m Actual Values on Planpay ' +
          screenName +
          ' Screen \x1b[37m%%%%%%%%%%%%%%%%%%%' +
          '\n'
      );
      if (screenName == 'Widget') {
        let expectedDeposit = await page.locator(this.deposit).innerText();
        expectedDeposit = expectedDeposit.replace(/[^0-9.]/g, '');
        await expect(
          expectedConfig.depositSettings.depositExcludingRemainder
        ).toEqual(expectedDeposit);
        const recieved = [];
        const fieldName = ['Installments', 'Installment Amount'];
        const expected = [];
        const cadenceOptions = ['weekly', 'fortnightly', 'monthly'];
        for (let i = 0; i < cadenceOptions.length; i++) {
          const cadence = await utility.capitalizeFirstLetter(
            cadenceOptions[i]
          );

          if (expectedConfig.planSummary[cadence].status == 'Not available') {
            recieved[0] = await page
              .locator('[data-planpay-test-id="' + cadence + '_not_available"]')
              .innerText();
            recieved[1] = '';
            expected[0] = 'Not available';
            expected[1] = '';
          } else {
            recieved[0] = await page
              .locator(
                '[data-planpay-test-id="' +
                  cadenceOptions[i] +
                  '_installment_number"]'
              )
              .innerText();

            recieved[1] = (
              await page
                .locator(
                  '[data-planpay-test-id="' +
                    cadenceOptions[i] +
                    '_installment_amount"]'
                )
                .innerText()
            ).replace(',', '');
            expected[0] =
              expectedConfig.planSummary[cadence].numberOfInstalment;
            expected[1] = expectedConfig.planSummary[cadence].instalmentAmount;
            console.log('expected[1] ', expected[1]);
            expected[1] =
              calculations.merchantCurrency.currencySymbol + expected[1];
            console.log('expected[1] ', expected[1]);
            console.log('expected[1] ', expected[1]);
          }
          console.log('expected ', expected);
          if (config.LocalEnv.verifyFlag == 'true') {
            await utility.matchValues(
              recieved,
              expected,
              fieldName,
              screenName + ' => ' + cadenceOptions[i],
              'merchant-testing'
            );
          } else {
            await utility.printExpectedValues(fieldName, recieved, 'widget');
          }
        }
      }
      if (screenName == 'Summary') {
        let expectedProduct = [];
        let recievedProduct = [];
        for (let i = 0; i < expectedConfig.planDetails.items.length; i++) {
          if (i == 0) {
            await recievedProduct.push(
              await page.locator(this.productname).first().innerText()
            );
          } else {
            await recievedProduct.push(
              await page.locator(this.productname).nth(i).innerText()
            );
          }
          await expectedProduct.push(
            expectedConfig.planDetails.items[i].description +
              '(' +
              expectedConfig.planDetails.productsQuantity[i] +
              '×)'
          );
        }
        expectedProduct = await expectedProduct.sort();

        recievedProduct = await recievedProduct.sort();
        if (config.LocalEnv.verifyFlag == 'true') {
          await utility.matchValues(
            recievedProduct,
            expectedProduct,
            'Product',
            'Checkout Summary',
            'merchant-testing'
          );
        }
        const expected = [];
        const recieved = [];
        const fieldName = [
          'Merchant Name',
          'Total Cost',
          'First Instalment',
          'firstInstalmentPercentage',
          'instalments',
          'Frequency',
          'Next inst date',
          'Last inst date',
          'cadence day',
        ];
        recieved[0] = await page.locator(this.merchantName).innerText();
        recieved[1] = await page.locator(this.totalCost).innerText();
        recieved[1] = await recieved[1].replace(',', '');
        recieved[1] =
          recieved[1] +
          (await page.locator(this.currencyCode).first().innerText());
        recieved[2] = await page.locator(this.firstInstalment).innerText();
        recieved[2] = recieved[2].replace(',', '');
        recieved[2] =
          recieved[2] +
          (await page.locator(this.currencyCode).nth(1).innerText());
        recieved[3] = await page
          .locator(this.firstInstalmentPercentage)
          .innerText();
        recieved[4] =
          (await page.locator(this.instalment_number).innerText()).replace(
            ',',
            ''
          ) +
          ' x' +
          (await page.locator(this.instalment_amount).innerText()).replace(
            ',',
            ''
          ) +
          ' ' +
          (await page.locator(this.currencyCode).nth(2).innerText());
        recieved[5] = await page.locator(this.plan_frequency).innerText();
        recieved[6] = await page.locator(this.next_instalment_date).innerText();
        recieved[7] = await page.locator(this.last_instalment_date).innerText();
        recieved[8] = await page.locator(this.cadence_day).innerText();
        if (expectedConfig.planSummary.installmentPeriod == 'Monthly') {
          recieved[8] = await utility.dateFormatHandling(recieved[8]);
        }
        expected[0] = expectedConfig.LocalEnv.merchantName;
        expected[1] =
          expectedConfig.planSummary.currencySymbol +
          expectedConfig.planSummary.totalCost +
          expectedConfig.planSummary.checkoutCurrency;
        let amount: number | string = expectedConfig.paidPayments[0].amount;
        if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
          amount =
            Number(expectedConfig.paidPayments[0].amount) +
            Number(expectedConfig.paidPayments[0].remainder);
        }
        expected[2] =
          expectedConfig.planSummary.currencySymbol +
          String(amount) +
          expectedConfig.planSummary.checkoutCurrency;
        expected[3] =
          '(' + expectedConfig.planSummary.percentageInstallmentPaid + '%)';
        expected[4] =
          expectedConfig.planSummary.numberOfInstalment +
          ' x' +
          expectedConfig.planSummary.currencySymbol +
          expectedConfig.planSummary.installmentAmount +
          ' ' +
          expectedConfig.planSummary.checkoutCurrency;
        expected[5] = '(' + expectedConfig.planSummary.installmentPeriod + ')';
        let nextInstDate = expectedConfig.UpcomingPayments[0].date;
        nextInstDate = await nextInstDate.split('/');
        let mon = await utility.getMonthName(Number(nextInstDate[1]), 'long');
        nextInstDate = nextInstDate[0] + ' ' + mon + ' ' + nextInstDate[2];
        expected[6] = nextInstDate;
        let lastDate =
          expectedConfig.UpcomingPayments[
            expectedConfig.UpcomingPayments.length - 1
          ].date;
        lastDate = await lastDate.split('/');
        mon = await utility.getMonthName(Number(lastDate[1]), 'long');
        lastDate = lastDate[0] + ' ' + mon + ' ' + lastDate[2];
        expected[7] = lastDate;
        expected[8] = expectedConfig.planSummary.InstallmentDay;
        if (
          expectedConfig.planSummary.installmentPeriod == 'Weekly' ||
          expectedConfig.planSummary.installmentPeriod == 'Fortnightly'
        )
          expected[8] = expected[8] + 's';
        if (config.LocalEnv.verifyFlag == 'true') {
          await utility.matchValues(
            recieved,
            expected,
            fieldName,
            'Checkout Summary',
            'merchant-testing'
          );
        } else {
          await utility.printExpectedValues(fieldName, recieved, 'summary');
        }
      }
    }
  }

  async additionalValidation(dueToday: string, installmentAmount: string) {
    const due_Today = Number(dueToday);
    console.log('inst_amount ', installmentAmount);

    installmentAmount = await installmentAmount.slice(0, -4);
    if (expectedConfig.planSummary.checkoutCurrency == 'GBP') {
      installmentAmount = await installmentAmount.replace('£', '');
    } else {
      installmentAmount = await installmentAmount.replace('$', '');
    }
    const inst_amount = Number(installmentAmount);
    console.log('inst_amount ', inst_amount);
    const planTotal = Number(expectedConfig.planSummary.totalCost);
    /*due today should be lessthan plantotal*/
    if (due_Today > planTotal) {
      await expect(
        await page.locator(this.installmentError).innerText()
      ).toEqual('The deposit amount must be less than the total cost');
      await expect(due_Today < planTotal).toBeTruthy();
      console.log('!!Deposit is lessthan Plan Total!!');
    }
    /*instalment amount should be +ve num */
    await expect(await Math.sign(inst_amount)).toEqual(1);
    console.log('!!Instalment Amount is positive!!');
  }
  async priceWidgetValidation() {
    if (expectedConfig.flags.blockedCheckout != 'true') {
      console.log('price widget validation');
      await page.waitForLoadState();
      await page.waitForSelector(this.priceWidget);
      let actual = await page.locator(this.priceWidget).first().innerText();
      actual = await actual.replace(/[^\d.]/g, ''); //removes non numeric characters except .
      let new_actual = Number(actual);
      new_actual = await utility.upto2Decimal(new_actual);

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          String(new_actual),
          expectedConfig.planSummary.priceWidget,
          'widget price',
          'Price Preview Widget',
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        console.log('Price Preview Widget');
      }
    }
  }

  async priceWidget2Validation() {
    if (expectedConfig.flags.blockedCheckout != 'true') {
      console.log('********price widget validation 2 ******');
      // await page.waitForSelector(this.pricePreviewFetch);
      // await utility.delay(8000);
      // const actual = await page.locator(this.pricePreviewFetch).innerText();
      // let expected = await utility.removeTrailingZeros(
      //   expectedConfig.planSummary.priceWidget
      // );
      // expected =
      //   '{"installmentAmount":' +
      //   expected +
      //   ',"frequency":"Weekly","currencyCode":"' +
      //   expectedConfig.planSummary.checkoutCurrency +
      //   '"}';

      // if (config.LocalEnv.verifyFlag === 'true') {
      //   await utility.matchValues(
      //     actual,
      //     expected,
      //     'widget price',
      //     'Price Preview Widget2',
      //     expectedConfig.LocalEnv.applicationName
      //   );
      // }
    }
  }

  async checkForPlanPayOption() {
    await this.checkCadence('price_preview_widget');
    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log('\x1b[33m Checkout is blocked \x1b[37m');
    }
  }
}
