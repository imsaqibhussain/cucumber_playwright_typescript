import 'dotenv/config';
import { Given, Then, When } from '@cucumber/cucumber';
// import { expect } from '@playwright/test';
import { AllOrdersPage } from '../header';
import { Login } from '../page-objects/portal-login-logout/login-page';
import { Utilities } from '../page-objects/utilities';
import { config } from '.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../setup/expected/expected-ts.conf';
import { SignupPage } from '../page-objects/customer-portal/signup-page';
import { PaymentEligibleScheduler } from '../page-objects/payment-platform-integration/PaymentEligibleScheduler';
// import * as fs from 'fs';

import { page } from '../features/support/hooks';
import { PayWithPlanPay } from '../page-objects/merchant-checkout/pay-with-planpay-page';
import { ScreensValidation } from '../page-objects/merchant-checkout/screens_validation';
import { debugPlan } from '../page-objects/payment-platform-integration/debug-plan';
import { PlanCancellation } from '../page-objects/merchant-portal/plan-cancellation';
import { calculations } from '../page-objects/merchant-checkout/calculations';
import { Orderplacement } from '../page-objects/merchant-checkout/order-placement-page';
import { databaseConnectDisconnect } from '../page-objects/backend-configuration/database-connect-disconnect';
const dbconnection = new databaseConnectDisconnect();

const signUp = new SignupPage();
const login = new Login();
const allOrders = new AllOrdersPage();
const paymentEligible = new PaymentEligibleScheduler();
const pay = new PayWithPlanPay();
const screenValidation = new ScreensValidation();
const debug_plan = new debugPlan();
const order_placement = new Orderplacement();
const cancel_plan = new PlanCancellation();
const utility = new Utilities();
Given(
  'As a user I can navigate to the {string} merchant on the {string} application',
  { timeout: 90 * 10000 },
  async function (merchant_name, application_name) {
    console.log('application name:... ', application_name);
    const login = new Login();
    expectedConfig.LocalEnv.merchantName = merchant_name;
    expectedConfig.merchantDetails.merchantName = merchant_name;
    expectedConfig.LocalEnv.applicationName = application_name;
    await page.goto(`${process.env.PLANPAY_CHECKOUT_URL}`, { timeout: 10000 });
    await dbconnection.getMerchantDetails(merchant_name);
    await login.merchant_selection(merchant_name);
  }
);

When(
  'I can successfully checkout items {string} with {string} having {string} date with currency {string} and selected settings {string},{string},{string}, {string} plan with a {string} user with {string} card and verifying the booking {string} on applications for the merchant {string} on {string} application',
  { timeout: 9000 * 1000 },
  async function (
    producItem: any,
    Quantity: any,
    redemptionDate: any,
    checkoutCurrency: any,
    depositSetting: any,
    installmentType_checkout_widget: any,
    installmentType_checkout_summary: any,
    InstalmentDay: any,
    userCategory: any,
    cardType: any,
    validationApplications_onCheckout: any,
    merchantName: any,
    applicationName: any
  ) {
    console.log('checkoutCurrency: ==> ', checkoutCurrency);
    expectedConfig.flags.cancelPlanFlag = 'false';
    expectedConfig.planSummary.checkoutCurrency = checkoutCurrency;
    expectedConfig.flags.blockedCheckout = 'false';
    expectedConfig.flags.blockedPayInstalment = 'false';
    expectedConfig.LocalEnv.applicationName = applicationName;
    expectedConfig.LocalEnv.installmentType = installmentType_checkout_widget;
    expectedConfig.LocalEnv.merchantName = merchantName;
    expectedConfig.planSummary.checkoutType = 'customer-checkout';
    expectedConfig.latePayments = [];
    expectedConfig.planSummary.selectedInstallmentPeriod =
      installmentType_checkout_widget;
    expectedConfig.planDetails.items = [];

    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    const expectedJsonpath = 'expected/customer-checkout/' + merchant;

    //at checkout, marking evenprocessor error flag to false
    const commonDetails = await utility.readCustomerDetails();
    commonDetails.eventProcessorError = 'false';
    utility.writeIntoJsonFile(
      'eventProcessor_errors',
      commonDetails,
      'expected'
    );
    const data: any = await order_placement.placeOrder(
      producItem,
      Quantity,
      redemptionDate,
      merchantName,
      installmentType_checkout_widget,
      validationApplications_onCheckout,
      depositSetting,
      checkoutCurrency
    );

    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log('\x1b[31m Checkout is blocked \x1b[37m');
      const data = await utility.callExpectedJson();
      data.flags.blockedCheckout = 'true';
      await utility.writeIntoJsonFile(
        'expected-values',
        data,
        expectedJsonpath
      );
    } else {
      data.fees = expectedConfig.fees;
      data.merchantDetails = expectedConfig.merchantDetails;
      if (userCategory === 'New') {
        const screens = validationApplications_onCheckout.split(',');
        const emailAddress = await signUp.signupOperation(
          `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
          screens,
          'true'
        );
        expectedConfig.customer.Email = emailAddress;
        data.customer = expectedConfig.customer;
        data.merchantDetails = expectedConfig.merchantDetails;

        await utility.writeIntoJsonFile(
          'expected-values',
          data,
          expectedJsonpath
        );
      }
      console.log('\u001b[1;33mRunning ' + userCategory + ' User Scenario');

      if (userCategory === 'Existing') {
        console.log('----Reading email from common details json file----');
        const customerEmail = await utility.readCustomerDetails();
        const Email = customerEmail.customer.Email;
        console.log('Extracted Email: \x1b[37m' + Email);
        // expectedConfig.planSummary.paymentMethod =
        //   expectedJson.planSummary.paymentMethod;
        data.customer = customerEmail.customer;
        //assign the latest value
        expectedConfig.customer = customerEmail.customer;
        //calling login function
        let password: any;
        if (customerEmail.isResetFlag == 'true') {
          password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
        } else {
          password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
        }
        await login.submitLoginWithParameters(
          expectedConfig.customer.Email,
          // `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
          password,
          'true',
          'customer-portal',
          config.LocalEnv.env
        );
      }

      expectedConfig.LocalEnv.installmentType =
        installmentType_checkout_summary;

      await pay.payNow(
        installmentType_checkout_summary,
        InstalmentDay,
        validationApplications_onCheckout,
        data,
        cardType,
        ''
      );
      if (expectedConfig.flags.blockedCheckout != 'true') {
        /*
        const testCaseErrCheck = await utility.checkForError();
        console.log('testCaseErrCheck:' + testCaseErrCheck);
        if (testCaseErrCheck == 'fail') {
          await expect(testCaseErrCheck).toEqual('pass');
        }
        console.log(expectedConfig.planSummary.message);
        */
      } else {
        console.log('\x1b[31m Checkout is blocked \x1b[37m');
        const data = await utility.callExpectedJson();
        data.flags.blockedCheckout = 'true';
        await utility.writeIntoJsonFile(
          'expected-values',
          data,
          expectedJsonpath
        );
      }
    }
  }
);

When(
  'As a Merchant, I can retry the failed transactions for the {string} plan for {string}  using {string} checkout',
  { timeout: 90 * 10000 },
  async function (planid, merchantName, checkoutType) {
    const data = await utility.readJsonFile(
      'expected/' + checkoutType + '/' + merchantName + '/expected-values.json'
    );
    let planidForTest = planid;
    if (planid == '') {
      planidForTest = data.planSummary.planID;
    }

    expectedConfig.LocalEnv.applicationName = 'merchant-portal';
    expectedConfig.LocalEnv.merchantName = merchantName;
    expectedConfig.merchantDetails.merchantName = merchantName;
    await login.login(
      `${process.env.ADMIN_PORTAL_USER}`,
      `${process.env.USER_PASSWORD_ALICE}`,
      'true',
      'merchant-portal',
      config.LocalEnv.env,
      `${process.env.PLANPAY_NEXT_URL}`
    );

    await allOrders.latePaymentRetRy(
      data,
      planidForTest,
      merchantName
      // checkoutType
    );
  }
);

Then(
  'I can carry out post validate operations on {string} on applications for the merchant {string} using {string} checkout',
  { timeout: 90 * 10000 },

  async function (postValidationApplications, merchantName, checkoutType) {
    console.log('testing!.');

    // const expecteddata = await utility.readJsonFile(
    //   'expected/' +
    //     checkoutType +
    //     '/' +
    //     merchantName +
    //     '/expected-values.json'
    // );
    // await utility.delay(3000);
    // expecteddata.planSummary.checkoutType= checkoutType;
    // await utility.writeIntoJsonFile('expected-values',
    // expecteddata,
    // 'expected/'+checkoutType+'/' +merchantName);
    // await utility.delay(3000);z
    expectedConfig.planSummary.checkoutType = checkoutType;
    expectedConfig.merchantDetails.merchantName = merchantName;
    await utility.assignJsontoExpectedConf(merchantName);
    console.log(
      'expectedConfig.flags ',
      expectedConfig.flags.blockedPayInstalment
    );

    if (
      expectedConfig.flags.blockedPayInstalment == 'true' &&
      expectedConfig.planSummary.planStatus == 'Late'
    ) {
      await utility.delay(4000);
      console.log('*** Post Validation ****');
      expectedConfig.LocalEnv.applicationName == 'merchant-testing';
      if (
        postValidationApplications.includes(
          'events-transactions-due-requested-failed'
        ) ||
        postValidationApplications.includes(
          'CustomerPaymentFailedSendCustomerNotification'
        )
      ) {
        await screenValidation.validateScreens(
          postValidationApplications,
          merchantName
        );
      } else {
        console.log('\x1b[31m  Payment is blocked \x1b[37m');
      }
    } else if (expectedConfig.flags.blockedPayInstalment == 'true') {
      console.log(
        'expectedConfig.flags.blockedCheckout',
        expectedConfig.flags.blockedCheckout
      );
      console.log('\x1b[31m  Payment is blocked \x1b[37m');
    } else {
      if (expectedConfig.flags.blockedCheckout == 'true') {
        console.log(
          '\x1b[33m Couldnt Proceed Validations as Checkout is Blocked \x1b[37m '
        );
      } else {
        console.log(postValidationApplications);

        await utility.delay(4000);
        console.log('*** Post Validation ****');
        expectedConfig.LocalEnv.applicationName == 'merchant-testing';
        if (
          expectedConfig.planSummary.planStatus != 'Late' &&
          (postValidationApplications.includes(
            'events-transactions-due-requested-failed'
          ) ||
            postValidationApplications.includes(
              'CustomerPaymentFailedSendCustomerNotification'
            ))
        ) {
          console.log('Late case validation are blocked');
        } else {
          await screenValidation.validateScreens(
            postValidationApplications,
            merchantName
          );
        }
      }
    }
  }
);

// Then(
//   'I can process {string} payments with {string} order status and verifying the transaction {string} on applications',
//   { timeout: 90 * 1000 },
//   async (nTransactions, finalStatus, validationApplications) => {
//     const customerEmail = await utility.readExpectedValue(); //reading email from json file
//     const Email = customerEmail.customer.Email;
//     // let Email = "planpaytestingautomation7026@mailinator.com";
//     expectedConfig.LocalEnv.applicationName = 'merchant-testing';
//     expectedConfig.LocalEnv.merchantName = 'Merchant 0';
//     console.log('*********** n transactions : ' + nTransactions);
//     if (finalStatus == 'Completed') {
//       let tnTransactions = customerEmail.planDetails.noOfInstallmentsToBePaid;
//       console.log('no of instalment to be paid ' + tnTransactions);
//       if (!tnTransactions) {
//         tnTransactions =
//           (await customerEmail.planDetails.numberOfInstalment) -
//           customerEmail.planDetails.noOfInstallmentsPaid;
//         console.log('instalment to be paid from sub' + tnTransactions);
//       }
//     }
//     for (let i = 0; i < nTransactions; i++) {
//       const process_transaction = new ProcessTransaction();
//       console.log('Making ' + (i + 1) + ' Transaction');
//       await process_transaction.startApiCalls(
//         Email,
//         nTransactions,
//         finalStatus
//       );
//       await login.navigateToLoginScreen();
//       utility.delay(1000);
//       if (i == 0) {
//         const res = await login.submitLoginWithParameters(
//           Email,
//           `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
//           'true',
//           'customer-portal',
//           config.LocalEnv.env
//         );
//       }
//       await screenValidation.validateScreens(
//         validationApplications,
//         expectedConfig.LocalEnv.merchantName,
//         'Laptop,Sofa'
//       );
//       utility.delay(200000);
//     }
//   }
// );
/**Edit Billing Details  */
When(
  'I can successfully checkout items {string} with {string} having {string} date with {string} and selected settings {string},{string},{string}, {string} plan with a {string} user with {string} card and additional {string} for {string} and {string}',
  { timeout: 90000 * 1000 },
  async (
    producItem,
    Quantity,
    redemptionDate,
    checkoutCurrency,
    depositSetting,
    installmentType_checkout_widget,
    installmentType_checkout_summary,
    InstalmentDay,
    userCategory,
    defaultCardType,
    paymentMethods,
    merchantName,
    checkoutType
  ) => {
    expectedConfig.planSummary.checkoutCurrency = checkoutCurrency;
    expectedConfig.planSummary.checkoutType = checkoutType;

    const data: any = await order_placement.placeOrder(
      producItem,
      Quantity,
      redemptionDate,
      merchantName,
      installmentType_checkout_widget,
      '',
      depositSetting,
      checkoutCurrency
    );
    if (userCategory === 'New') {
      const screens: any = [];
      const emailAddress = await signUp.signupOperation(
        `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
        screens,
        'true'
      );
      data.customer = { Email: emailAddress }; //adding email address into data obj- To be saved in json file
      expectedConfig.customer.Email = emailAddress;
      //Assigning array to expected array to json array.
      data.customer = expectedConfig.customer;
      await utility.writeIntoJsonFile(
        'expected-values',
        JSON.stringify(data),
        'expected/customer-checkout/' + merchantName
      );
      // await fs.writeFile(
      //   'tests/setup/expected/customer-checkout/'+merchantName+'/expected-values.json',
      //   JSON.stringify(data),
      //   (err) => {
      //     if (err) console.log('Error writing file:', err);
      //   }
      // );
    }
    console.log('Running ' + userCategory + ' User Scenario!..\u001b[1;37m.');

    // if (userCategory === 'Existing') {
    //   console.log('----Reading email from json data file----');
    //   const customerEmail = await utility.readCustomerDetails();
    //   // const customerEmail = await utility.readExpectedValue(); //reading email from json file
    //   const Email = customerEmail.customer.Email;
    //   console.log('Extracted Email: ' + Email);
    //   // data.customer = { Email: customerEmail };
    //   data.customer = customerEmail.customer;
    //   //assign the latest value
    //   expectedConfig.customer.Email = Email;
    //   //calling login function
    //   await login.submitLoginWithParameters(
    //     expectedConfig.customer.Email,
    //     `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
    //     'true',
    //     expectedConfig.LocalEnv.applicationName,
    //     config.LocalEnv.env
    //   );
    // }
    PayWithPlanPay.crediCardChecking = 'creditCardChecking';
    console.log('*************adding payment methods***********');
    await pay.addPaymentMethod(paymentMethods);
    await console.log('right now calling verify payment method');
    await pay.verifyPaymentMethod(paymentMethods, defaultCardType);
    console.log(
      '----------- Payment methods added and verified successfully ----------'
    );
    // await pay.payNow(
    //   installmentType_checkout_summary,
    //   InstalmentDay,
    //   '',
    //   data,
    //   defaultCardType,
    //   paymentMethods
    // );
  }
);

Then(
  'I can process using debug endpoint {string} payments with {string} order status for the merchant {string} using {string} checkout',
  { timeout: 90 * 100000 },

  async (
    nTransactions: any,
    finalStatus: any,
    merchantName: string,
    checkoutType: string
  ) => {
    console.log('testing!....');
    expectedConfig.flags.blockedPayInstalment = 'false';
    expectedConfig.planSummary.checkoutType = checkoutType;
    await utility.assignJsontoExpectedConf(merchantName);
    if (expectedConfig.flags.blockedCheckout == 'false') {
      const Email = expectedConfig.customer.Email;
      expectedConfig.LocalEnv.applicationName = 'merchant-testing';
      expectedConfig.LocalEnv.merchantName =
        expectedConfig.merchantDetails.merchantName;
      const path =
        'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json';
      console.log('path : ', path);
      calculations.merchantConfiguration = await utility.readJsonFile(path);
      console.log('*********** n transactions : ' + nTransactions);

      if (
        nTransactions >
        Number(expectedConfig.planSummary.noOfInstallmentsToBePaid)
      ) {
        finalStatus = 'Completed';
      }

      if (finalStatus == 'Completed') {
        let tnTransactions = Number(
          expectedConfig.planSummary.noOfInstallmentsToBePaid
        );
        nTransactions = tnTransactions;
        console.log('no of installment to be paid ' + tnTransactions);
        if (!tnTransactions || tnTransactions == 0) {
          tnTransactions =
            (await Number(expectedConfig.planSummary.numberOfInstalment)) -
            Number(expectedConfig.planSummary.noOfInstallmentsPaid);
          nTransactions = tnTransactions;
          console.log('installment to be paid from sub' + tnTransactions);
        }
      }

      if (finalStatus == 'On Schedule') {
        console.log('*********** n transactions : ' + nTransactions);

        if (
          nTransactions >=
          Number(expectedConfig.planSummary.noOfInstallmentsToBePaid) - 1
        ) {
          nTransactions =
            Number(expectedConfig.planSummary.noOfInstallmentsToBePaid) - 1;
        }
      }

      for (let i = 0; i < nTransactions; i++) {
        if (
          expectedConfig.planSummary.totalNoOfInstallments !=
          expectedConfig.planSummary.noOfInstallmentsPaid
        ) {
          await debug_plan.debugPlanApiCalls(Email, nTransactions, finalStatus);
          if (expectedConfig.flags.blockedPayInstalment == 'true') {
            break;
          }
          if (
            nTransactions > 1 ||
            finalStatus === 'Completed' ||
            finalStatus === 'On Schedule'
          ) {
            console.log('Waiting for next transction to start...');
            await utility.delay(40000);
          }
        }

        console.log('Making ' + (i + 1) + ' Transaction');
      }
      // await paymentEligible.paymentEligbleScheduler();
    } else {
      console.log(
        '\x1b[33m Couldnt Process Payments as Checkout is Blocked \x1b[37m '
      );
    }
    expectedConfig.planSummary.operationType = '';
  }
);
Then(
  'I can process {string} late payments for the merchant {string} using {string} checkout',
  { timeout: 90 * 10000 },
  async function (latePayments, merchantName, checkoutType) {
    console.log('testing!..');
    await utility.delay(10000);
    await page.goto(`${process.env.PLANPAY_NEXT_URL}`);

    // expectedConfig.LocalEnv.applicationName = 'customer-portal'; // hard coded this
    const customerEmail = await utility.readJsonFile(
      'expected/' + checkoutType + '/' + merchantName + '/expected-values.json'
    );
    if (
      customerEmail.flags.blockedPayInstalment == 'false' &&
      customerEmail.flags.blockedCheckout == 'false'
    ) {
      expectedConfig.planSummary.checkoutType = checkoutType;
      // await utility.writeIntoJsonFile(
      //   'expected-values',
      //   expectedConfig,
      //   'expected/' +
      //     checkoutType +
      //     '/' +
      //     expectedConfig.merchantDetails.merchantName
      // );

      expectedConfig.merchantDetails.merchantName = merchantName;
      // const customerEmail = await utility.readExpectedValue(); //reading email from json file
      const Email = customerEmail.customer.Email;
      const planStatus = customerEmail.planSummary.planStatus;
      const latePaymentsData = customerEmail.latePayments;

      const data = await utility.readJsonFile('expected/common-details.json');
      let password: any;
      if (data.isResetFlag == 'true') {
        password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
      } else {
        password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
      }

      if (planStatus === 'Late' && latePaymentsData.length > 0) {
        await login.submitLoginWithParameters(
          Email,
          // `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
          password,
          'true',
          'customer-portal',
          config.LocalEnv.env
        );
        const count = customerEmail.paidPayments.length;
        await utility.delay(2000);
        const planId = customerEmail.planSummary.planID;
        const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${planId}`;
        await page.goto(plan);
        await utility.delay(4000);
        for (let i = 0; i < latePayments; i++) {
          await allOrders.processLate(count);
        }
      } else {
        console.log(
          '///////////////// There is no late payments /////////////////'
        );
      }
    } else {
      console.log('\x1b[31m  Payment is blocked \x1b[37m');
    }
  }
);
Then(
  'As a Merchant, I can cancel the plan with {string} {string} reason for {string} and verify {string} using {string} checkout',
  { timeout: 90 * 10000 },
  async function (
    cancellationReason,
    finalCancellation,
    merchantName,
    screens,
    checkoutType
  ) {
    await utility.delay(4000);
    //for independent cancel scenario we are assigning expectedJson all data into expected.conf.ts variables
    // const updatedData = await utility.readExpectedValue();
    expectedConfig.merchantDetails.merchantName = merchantName;
    expectedConfig.planSummary.checkoutType = checkoutType;
    await utility.assignJsontoExpectedConf(merchantName);

    // const updatedData  = await utility.readJsonFile('expected/customer-checkout/'+merchantName+'/expected-values.json');
    // expectedConfig.planDetails = updatedData.planDetails;
    // expectedConfig.planSummary = updatedData.planSummary;
    // expectedConfig.customer = updatedData.customer;
    // expectedConfig.UpcomingPayments = updatedData.UpcomingPayments;
    // expectedConfig.paidPayments = updatedData.paidPayments;
    // expectedConfig.merchantDetails = updatedData.merchantDetails;
    if (expectedConfig.flags.blockedCheckout == 'false') {
      expectedConfig.cancellationDetails.reason = String(cancellationReason);
      const path =
        'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json';
      calculations.merchantConfiguration = await utility.readJsonFile(path);

      expectedConfig.LocalEnv.merchantName = merchantName;
      await login.login(
        `${process.env.USER_EMAIL_ALICE}`,
        `${process.env.USER_PASSWORD_ALICE}`,
        'true',
        'merchant-portal',
        config.LocalEnv.env,
        `${process.env.PLANPAY_NEXT_URL}`
      );

      // const searchResults = await searchPage.submitOperation(
      //   'Search',
      //   'Plan ID',
      //   expectedConfig.planSummary.planID,
      //   'true'
      // );
      // await orderPage.orderDetails('', 1, searchResults);
      await utility.merchantPortalOrderDetailsPage();
      await cancel_plan.cancelPlan(
        cancellationReason,
        finalCancellation,
        screens
      );

      // if(postValidationApplications.includes('customer-portal')){
      //   await login.login(
      //     `${expectedConfig.customer.Email}`,
      //     `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
      //     'true',
      //     'customer-portal',
      //     config.LocalEnv.env,
      //     `${process.env.PLANPAY_NEXT_URL}`
      //   );
      //   await utility.customerPortalOrderDetailsPage()
      //   await cancelConfirm.verifyOrderStatusFromCustomerPortal()
      // }

      // if(validationApplications.includes('merchant-portal')){
      //   await login.login(
      //     `${process.env.USER_EMAIL_ALICE}`,
      //     `${process.env.USER_PASSWORD_ALICE}`,
      //     'true',
      //     'merchant-portal',
      //     config.LocalEnv.env,
      //     `${process.env.PLANPAY_NEXT_URL}`
      //   );
      //   await utility.merchantPortalOrderDetailsPage()
      //   await cancelConfirm.verifyOrderStatusFromMerchantPortal()
      // }
    } else {
      console.log('\x1b[33m Couldnt Cancel as Checkout is Blocked \x1b[37m ');
    }
  }
);

Then(
  'I can verify the transactions are balancing out for the {string} or the merchant {string} using {string} checkout',
  async function (planId: any, merchantName: any, checkoutType: any) {
    let actualPlanId;
    const data = await utility.readJsonFile(
      'expected/' + checkoutType + '/' + merchantName + '/expected-values.json'
    );
    if (planId) {
      actualPlanId = planId;
    } else {
      actualPlanId = data.planSummary.planID;
    }
    if (
      data.flags.blockedPayInstalment == 'true' &&
      data.planSummary.planStatus == 'On Schedule'
    ) {
      console.log('\x1b[31m  Payment is blocked \x1b[37m');
    } else {
      if (data.flags.blockedCheckout == 'false') {
        await dbconnection.getSumOfDebitCreditForTransction(actualPlanId);
      } else {
        console.log(
          '\x1b[33m Couldnt Process as Checkout is Blocked \x1b[37m '
        );
      }
    }
  }
);

Then(
  'I can move the plan {string} status {string} and {string}',
  async function (finalStatus: any, merchantName: any, checkoutType: any) {
    console.log('*** Event Transaction Eligible merchantPayable****');
    expectedConfig.LocalEnv.applicationName == 'merchant-testing';
    expectedConfig.merchantDetails.merchantName = merchantName;
    expectedConfig.planSummary.checkoutType = checkoutType;
    const data = await utility.commonJsonReadFunc('expectedFile');
    if (
      data.flags.blockedPayInstalment == 'true' &&
      data.planSummary.planStatus == 'On Schedule'
    ) {
      console.log('\x1b[31m  Payment is blocked \x1b[37m');
    } else {
      if (data.flags.blockedCheckout == 'false') {
        if (finalStatus == 'Completed') {
          console.log('-----------Calling payment Eligible API--------------');
          await paymentEligible.paymentEligbleScheduler();
        }
        data.flags.PaymentEligible = 'true';
        data.planSummary.planStatus = finalStatus;

        await utility.writeIntoJsonFile(
          'expected-values',
          data,
          'expected/' + checkoutType + '/' + merchantName
        );
        // await screenValidation.validateScreens(screenName, merchantName);
      } else {
        console.log(
          '\x1b[33m Couldnt Process as Checkout is Blocked \x1b[37m '
        );
      }
    }
  }
);
