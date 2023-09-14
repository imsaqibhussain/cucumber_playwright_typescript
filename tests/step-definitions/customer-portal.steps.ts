import 'dotenv/config';
import { profile } from '../page-objects/customer-portal/profile';
import {
  Given,
  When,
  Then,
  SignupPage,
  Login,
  resetPassword,
  ResetPasswordLink,
  AllOrdersPage,
  LogoutPage,
  config,
  UpdatePlan,
} from '../header';
import { expectedConfig } from '../setup/expected/expected-ts.conf';
import { Utilities } from '../page-objects/utilities';
import { WelcomeEmail } from '../page-objects/notification-service/welcomeEmail';
import { mailinatorLogin } from '../page-objects/notification-service/login';
import { calculations } from '../page-objects/merchant-checkout/calculations';
const welcome = new WelcomeEmail();
const signUp = new SignupPage();
const login = new Login();
const object_rp = new resetPassword();
const mailinator_rp = new ResetPasswordLink();
const allOrders = new AllOrdersPage();
const logoutPage = new LogoutPage();
const utility = new Utilities();
const myProfile = new profile();
const ml_login = new mailinatorLogin();
const update_plan = new UpdatePlan();
Given(
  'I can successfully signup to the {string} application with {string} keepMeSignedIn and {string} isSubscribed',
  { timeout: 90 * 10000 },
  async function (
    applicationName: any,
    keepMeSignedIn: any,
    isSubscribed: any
  ) {
    expectedConfig.LocalEnv.applicationName = applicationName;
    await login.navigateToLoginScreen(`${process.env.PLANPAY_NEXT_URL}`);
    await signUp.signupOperation(
      process.env.CUSTOMER_PORTAL_PASSWORD,
      'none',
      isSubscribed
    );
  }
);

Given(
  'As a {string} Customer portal user having {string} keepMeSignedIn setting I can successfully login to the {string} application for the merchant {string} using {string} checkout',
  { timeout: 90 * 10000 },
  async function (
    Email,
    keepMeSignedIn,
    applicationName,
    merchantName,
    checkoutType
  ) {
    console.log('testing!..');
    const data = await utility.readJsonFile(
      'expected/' + checkoutType + '/' + merchantName + '/expected-values.json'
    );
    const customer_data = await utility.readJsonFile(
      'expected/common-details.json'
    );
    expectedConfig.planSummary = data.planSummary;
    expectedConfig.planDetails = data.planDetails;
    expectedConfig.customer = customer_data.customer;
    expectedConfig.customerLog = customer_data.customerLog;
    expectedConfig.merchantDetails = data.merchantDetails;
    if (!Email.includes('planpaytestingautomation')) {
      Email = data.customer.Email;
    }
    let password: any;
    if (customer_data.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await login.login(
      Email,
      password,
      keepMeSignedIn,
      applicationName,
      config.LocalEnv.env,
      `${process.env.PLANPAY_NEXT_URL}`
    );
  }
);

When(
  'I can successfully verify the order details on {string} tab and {string}',
  { timeout: 90 * 10000 },
  async function (screenName, tabName) {
    config.LocalEnv.verifyFlag = 'true';
    await allOrders.tabDetails(tabName, screenName);
  }
);

When(
  'I can process on customer-portal {string} payments using operation {string} on for plans for {string} merchant and verify {string} using {string} checkout',
  { timeout: 90 * 10000 },
  async function (
    nTransactions,
    operation_type,
    merchantName,
    screens,
    checkoutType
  ) {
    console.log('checkoutType:. ', checkoutType);
    console.log(
      'expectedConfig.planSummary.paymentPlatform_variant',
      expectedConfig.planSummary.paymentPlatform_variant
    );
    console.log(
      'expectedConfig.planSummary.paymentPlatform_vendor',
      expectedConfig.planSummary.paymentPlatform_vendor
    );
    expectedConfig.skippedInstallment.splice(
      0,
      expectedConfig.skippedInstallment.length
    );

    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    if (expectedJson.flags.blockedCheckout == 'true') {
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Checkout is blocked you can`t processed further \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );
    } else if (expectedJson.flags.blockedPayInstalment == 'true') {
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Payment is blocked you can`t processed further \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );
    } else {
      let remaningInstallments = 0;
      if (expectedJson.latePayments.length > 0) {
        remaningInstallments =
          expectedJson.planSummary.noOfInstallmentsToBePaid -
          expectedJson.latePayments.length;
      } else {
        remaningInstallments =
          expectedJson.planSummary.noOfInstallmentsToBePaid;
      }

      if (nTransactions > Number(remaningInstallments)) {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m You can`t process ' +
            nTransactions +
            ' transactions. Because there is only ' +
            remaningInstallments +
            ' transactions required. \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );
        nTransactions = remaningInstallments;
      }

      if (operation_type === 'skip-instalment') {
        expectedConfig.LocalEnv.operationType = operation_type;
        console.log('skip-instalment');
        const path =
          'configurations/merchants-products-configuration/' +
          merchantName +
          '/' +
          merchantName +
          '.json';
        console.log('path : ', path);
        calculations.merchantConfiguration = await utility.readJsonFile(path);
        expectedConfig.planSummary.checkoutType = checkoutType;
        await allOrders.skipPyamentsPopup(
          expectedJson.planSummary.planID,
          nTransactions,
          screens,
          merchantName
        );
      }

      if (expectedJson.planSummary.planStatus === 'Completed') {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Plan is already completed   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );
      } else {
        if (operation_type === 'pay-instalment') {
          await allOrders.makePyamentsPopup(
            expectedJson.planSummary.planID,
            nTransactions,
            screens,
            merchantName
          );
        }

        if (operation_type === 'pay-instalment-late') {
          await allOrders.makePyamentsPopupLate(
            nTransactions,
            screens,
            merchantName,
            expectedJson
          );
        }
      }
    }
  }
);

When(
  'I can successfully add {string} with card status {string} for {string} plans for {string} merchant using {string} checkout',
  { timeout: 140 * 10000 },
  async function (
    paymentMethods,
    cardStatus,
    planID,
    merchantName,
    checkoutType
  ) {
    console.log('checkoutType: ', checkoutType);
    expectedConfig.merchantDetails.merchantName = merchantName;
    expectedConfig.planSummary.checkoutType = checkoutType;
    await utility.assignJsontoExpectedConf(merchantName);
    expectedConfig.planSummary.checkoutType = checkoutType;

    const data = await utility.commonJsonReadFunc('expectedFile');
    if (data.flags.blockedPayInstalment == 'true') {
      console.log('\x1b[31m  Payment is blocked \x1b[37m');
    } else {
      let password: any;
      if (data.isResetFlag == 'true') {
        password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
      } else {
        password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
      }
      await login.login(
        data.customer.Email,
        password,
        'true',
        'customer-portal',
        config.LocalEnv.env,
        `${process.env.PLANPAY_NEXT_URL}`
      );
      await allOrders.addPaymentCard(cardStatus, paymentMethods, planID);
    }
  }
);

When(
  'I can successfully update the plan cadence with {string} with {string} for {string} merchant and verify {string} using {string} checkout',
  { timeout: 140 * 10000 },
  async function (
    cadenceOption,
    InstalmentDay,
    merchantName,
    screens,
    checkoutType
  ) {
    expectedConfig.merchantDetails.merchantName = merchantName;
    expectedConfig.planSummary.checkoutType = checkoutType;
    await utility.assignJsontoExpectedConf(merchantName);
    expectedConfig.planSummary.installmentAmountRecap =
      expectedConfig.planSummary.installmentAmount;
    expectedConfig.planSummary.InstallmentDayRecap =
      expectedConfig.planSummary.InstallmentDay;
    expectedConfig.planSummary.cadenceRecap =
      expectedConfig.planSummary.installmentPeriod;
    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log(
        '\x1b[33m couldnt update cadence option as checkout is blocked \x1b[37m'
      );
    } else {
      if (
        expectedConfig.planSummary.planStatus == 'Completed' &&
        expectedConfig.UpcomingPayments.length == 0
      ) {
        console.log(
          '\x1b[33m couldnt update cadence option as plan is already completed \x1b[37m'
        );
      } else {
        await update_plan.updatePlan(cadenceOption, InstalmentDay, screens);
      }
    }
  }
);
Then(
  'login to the {string} & {string}',
  { timeout: 90 * 1000 },
  async function (applicationName, keepMeSignedIn) {
    const data = await utility.readJsonFile('expected/common-details.json');
    let password: any;
    if (data.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }

    await login.login(
      expectedConfig.customer.Email,
      // `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
      password,
      keepMeSignedIn,
      applicationName,
      config.LocalEnv.env,
      `${process.env.PLANPAY_NEXT_URL}`
    );
  }
);

Then(
  'As a user I can successfully logout',
  { timeout: 90 * 1000 },
  async function () {
    await logoutPage.logout();
  }
);

Given(
  'I can successfully reset my password for {string} on {string} application',
  { timeout: 90 * 10000 },
  async function (planPayUser, applicationName) {
    const data = await utility.readJsonFile('expected/common-details.json');
    let email: any = '';
    if (
      planPayUser.includes('testinator.com') ||
      planPayUser.includes('mailinator.com')
    ) {
      email = planPayUser;
    } else {
      email = data.customer.Email;
    }

    await login.navigateToLoginScreen(`${process.env.PLANPAY_NEXT_URL}`);
    await object_rp.forgotPassword(email);
    await mailinator_rp.resetPassword(email);
    await login.submitLoginWithParameters(
      email,
      `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`,
      'true',
      applicationName,
      'dev'
    );
    await object_rp.successfulLoginAssertion();
  }
);
Then(
  'I can successfully {string} profile details by updating the {string}',
  async function (operationName: any, fieldName: any) {
    await utility.delay(5000);
    console.log('Testing!...');
    //each value need to assign seprately
    expectedConfig.customerLog.Email = expectedConfig.customer.Email;
    expectedConfig.customerLog.firstName = expectedConfig.customer.firstName;
    expectedConfig.customerLog.lastName = expectedConfig.customer.lastName;
    expectedConfig.customerLog.phoneNumber =
      expectedConfig.customer.phoneNumber;

    await myProfile.myProfile(operationName, fieldName);

    await utility.delay(5000);
    await logoutPage.logout();
  }
);

Then(
  'I can carry out post validate operations on {string} on customer-portal',
  async function (validationApplications: any) {
    await utility.delay(6000);
    const screens: any = validationApplications.split(',');
    const commonDetails = await utility.readCustomerDetails();
    // const customerData = await utility.readJsonFile('expected/common-details.json');
    expectedConfig.customerLog = commonDetails.customerLog;
    expectedConfig.customer = commonDetails.customer;
    let password: any;
    if (commonDetails.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }

    for (let i = 0; i < screens.length; i++) {
      if (screens[i] == 'customer-portal') {
        await login.login(
          commonDetails.customer.Email,
          password,
          'true',
          'customer-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );

        if (commonDetails.planCreated == 'false') {
          console.log('Plan Created flag is :', commonDetails.planCreated);
          myProfile.validatePlans();
        }
      }

      if (screens[i] == 'customer-portal-profile') {
        await login.login(
          commonDetails.customer.Email,
          password,
          'true',
          'customer-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        await myProfile.verifyProfileDetails();
      }

      if (screens[i] == 'customer-portal-marketplace') {
        await login.login(
          commonDetails.customer.Email,
          password,
          'true',
          'customer-portal',
          config.LocalEnv.env,
          `${process.env.PLANPAY_NEXT_URL}`
        );
        await myProfile.verifyMarketPlace();
      }

      if (screens[i] == 'passwordUpdatedSendCustomerNotification') {
        await myProfile.verifyPasswordResetEmail();
      }

      if (screens[i] == 'emailUpdatedSendCustomerNotification') {
        await myProfile.verifyUpdatedEmail();
      }

      if (screens[i] == 'emailChangedSendCustomerNotification') {
        await myProfile.verifyChangeEmail();
      }

      if (screens[i] == 'AccountSetupSendWelcomeNotification') {
        const subject = 'Your PlanPay account is ready to go';
        await console.log(
          "\u001b[1;32mLet's Verify Welcome email!..\u001b[1;37m."
        );
        if (config.LocalEnv.signUpDomain == '@planpay.testinator.com') {
          await ml_login.mailinatorlogin();
        }
        await welcome.verifyWelcomeEmail(commonDetails.customer.Email, subject);
      }
    }

    await utility.delay(5000);
    await logoutPage.logout();
  }
);
