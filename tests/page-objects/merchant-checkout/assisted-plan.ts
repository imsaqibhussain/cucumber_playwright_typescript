import { context, page } from '../../features/support/hooks';
import { Utilities } from '../utilities';
import { calculations } from './calculations';
import { PayWithPlanPay } from './pay-with-planpay-page';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { SignupPage } from '../customer-portal/signup-page';
import { databaseConnectDisconnect } from '../backend-configuration/database-connect-disconnect';
// import exp from 'constants';
import { Stripe } from '../payment-gateway/stripe';
import { Braintree } from '../payment-gateway/braintree';
import { ScreensValidation } from '../merchant-checkout/screens_validation';
import { Login } from '../../page-objects/portal-login-logout/login-page';
// import { moment } from 'moment';
const login = new Login();
const screen_validation = new ScreensValidation();

const stripe = new Stripe();
const braintree = new Braintree();
const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
const calculation = new calculations();
const pay = new PayWithPlanPay();
const signup = new SignupPage();
// const dateL = "//input[@data-testid='weekly-date-selector']";
// const nextBtnL = "//input[@data-testid='create-plan-next-button']";
// const due_today_locator =
//   "//input[@data-testid='first-installment-amount-input']";
export class AssistedPlan {
  static redemptionDate: any;
  static userCategory: string;
  createPlanL = "//button[@id='create-plan']";
  descriptionL = "//input[@id='description']";
  bookingIdL = "//input[@id='bookingId']";
  totalPriceL = "//input[@id='totalCost']";
  nextBtnL = '[data-testid="create-plan-next-button"]';
  calenderL = "//button[@aria-label='Choose date']//*[name()='svg']";
  dateL = '[data-testid="monthly-date-selector"]';
  refundPolicyBtnL = '[data-testid="refund-policy-tab-default"]';
  emailL = "//input[@id='email']";
  myemailAddress = '';
  // radioOption = '[data-testid="weekly-radio-option-description"]';
  remainderL = "//div[@class='MuiBox-root css-xi606m']//strong[1]";
  firstNameL = "//input[@id='first_name']";
  lastNameL = "//input[@id='last_name']";
  numberL = "//input[@id='phone_number']";
  createUserL = '[data-testid="create-user-button"]';
  addCardL = '[data-testid="add-card-button"]';
  createPlanBtnL = '[data-testid="create-plan-button"]';
  weeklyDateL = '[data-testid="weekly-date-selector"]';
  fornghtlyDateL = '[data-testid="fortnightly-date-selector"]';
  monthlyDateL = '[data-testid="monthly-date-selector"]';
  arrowL = '[data-testid="ArrowDropDownIcon"]';
  verifyMailL = "//span[normalize-space()='Verify your Email']";
  sendEmailButton = '[data-planpay-test-id="send-email"]';
  processManually = '[data-planpay-test-id="process-manually"]';
  resendPaymentLink = '[data-planpay-test-id="resend-payment-link"]'
  viewPlanButton='[data-planpay-test-id="view-plan-details"]'
  processPaymentButton = '[data-planpay-test-id="processpaymentplan"]';
  logoutButton='[data-planpay-test-id="logout"]'
  proceedPaymentButton='#payment-link-button'

  // planDetailsL = "//div[@class='MuiBox-root css-1onsedk']";
  // minDepositL =
  //   "//span[@class='MuiSlider-markLabel MuiSlider-markLabel MuiSlider-markLabelActive css-5oj6zx']";
  // maxDepositL =
  //   "//span[@class='MuiSlider-markLabel MuiSlider-markLabel css-opa428']";
  minDepositL = '[data-testid="min-deposit-value"]';
  maxDepositL = '[data-testid="max-deposit-value"]';
  planDetailsL = "//div[@class='MuiBox-root css-1qxtz39']";

  setPassL = "//input[@id='set_password']";
  confirmPassL = "//input[@id='confirm_password']";
  phoneL = "//input[@id='phone_number_validation']";
  alertMsgL = '#alert_messages';
  payToday = '#deposit';
  activateBtnL = "//button[@id='set_password_button']";
  // currency_locator="//div[@class='MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input css-qiwgdb']";
  currency_locator = "//div[@id='mui-component-select-currencyCode']";
  tyepOfPolicy = '#type-of-policy';
  default = "//li[@data-testid='default']";
  custom = "//li[@data-testid='custom']";
  none = "//li[@data-testid='none']";
  existingEmail =
    "//div[@class='MuiFormHelperText-root Mui-error MuiFormHelperText-sizeMedium MuiFormHelperText-contained MuiFormHelperText-filled css-qtq7qh']";
  frontEndPolicy = "(//div[@data-testid='refund-policy-recap']//li)[";
  bookingTotal = '//div[@data-testid="plan-total-cost"]';
  addNewMethodButton = "//button[@data-planpay-test-id='addpaymentmethod']";

  expected_user: any = [];
  async assistedPlan(
    redemptionDate: any,
    planTotal: any,
    depositSetting: any,
    installmentType: any,
    installmentDay: any,
    cardType: any,
    userCategory: any,
    validationApplications_assistedCheckout: any,
    currencyCode: any,
    poilcyType: any
  ) {
    AssistedPlan.redemptionDate = redemptionDate;
    AssistedPlan.userCategory = userCategory;
    const productAmount = await utility.upto2Decimal(planTotal);
    const redemDate = await utility.formatDate(redemptionDate);
    expectedConfig.planDetails.productsQuantity = ['1'];
    expectedConfig.planDetails.productsAmount = [productAmount];
    expectedConfig.planSummary.totalCost = productAmount;
    expectedConfig.depositSettings.depositSetting = depositSetting;
    expectedConfig.planSummary.redemptionDate = redemDate;
    expectedConfig.planSummary.checkoutCurrency = currencyCode;
    expectedConfig.planSummary.checkoutType = 'assisted-checkout';
    let validationScreen: any = [];
    if (validationApplications_assistedCheckout.includes(',')) {
      validationScreen = await validationApplications_assistedCheckout.split(
        ','
      );
    } else {
      validationScreen.push(validationApplications_assistedCheckout);
    }
    await page.waitForSelector(this.createPlanL);
    await page.locator(this.createPlanL).first().click(); //click->create plan button
    await this.paymentPlan(redemptionDate); //enters currency,date and total amount
    await utility.delay(2000);
    await this.preCalculations(redemptionDate); //readinf files
    await pay.calculate_allCadenceOptions(); //calculates instalments and instalmentamount for 3 cadence options

    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }

    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log('\x1b[31m Checkout Blocked \x1b[37m');
      const data = await utility.callExpectedJson();
      data.flags.blockedCheckout = 'true';
      await utility.writeIntoJsonFile(
        'expected-values',
        data,
        'expected/assisted-checkout/' + merchant
      );
    } else {
      await pay.selectInstallmentDay(installmentType, installmentDay); //day selection
      await calculation.checkSpecialRule(installmentType, installmentDay); //check if special rule applies(if user has selected some other instalment day)
      const flag = await screen_validation.checkCadence('Summary');
      if (flag == 'true') {
        await pay.blockedCase(installmentType); //handles blocked scenarios
      } else {
        await this.selectPolicy(poilcyType); //policy selection
        if (validationScreen.includes('paymentPlan_overview')) {
          await this.printOverview();
        }
        if (validationScreen.includes('verify_payment_plan_details')) {
          this.verifyPaymentPlanDetails();
        }

        expectedConfig.planSummary.noOfInstallmentsToBePaid =
          expectedConfig.planSummary.numberOfInstalment;

        await utility.writeIntoJsonFile(
          'expected-values',
          expectedConfig,
          'expected/assisted-checkout/' +
            expectedConfig.merchantDetails.merchantName
        );

        //Refund Policy
        if (expectedConfig.planDetails.poilcyType == 'Standard') {
          // await this.verifyStandardRefundPolicy(
          //   validationApplications_assistedCheckout
          // );
        }
        //click->next
        await page.waitForSelector(this.nextBtnL);
        await page.locator(this.nextBtnL).nth(0).click();
        await utility.delay(2000);
        //enter booking details
        const customerEmail = await this.bookingDetails();
        expectedConfig.customer = customerEmail.customer;

        if (validationScreen.includes('verify-userDetails')) {
          await this.verifyUserDetails();
        }

        await page.locator(this.nextBtnL).nth(1).click();
        await utility.delay(2000);

        if (validationScreen.includes('email-verification')) {
          await utility.delay(1000);
          await this.emailVerification(customerEmail.customer.Email);
          customerEmail.customer.userStatus = 'Active';
          expectedConfig.customer.userStatus = 'Active';
          const d = new Date();
          let todayDate: any = d.toLocaleString('en-GB');
          todayDate = todayDate.split(',');
          customerEmail.customer.accountCreated = todayDate[0];
          await utility.writeIntoJsonFile(
            'common-details',
            customerEmail,
            'expected'
          );
        }
        await utility.delay(1000);
        // ************
        if(expectedConfig.LocalEnv.environment=='PR'){
        expectedConfig.planSummary.noOfInstallmentsToBePaid = '0';
        expectedConfig.planSummary.noOfInstallmentsPaid='0';
        expectedConfig.planSummary.remainingAmount = '0';
        expectedConfig.planSummary.totalFunds = '0';
        expectedConfig.planSummary.planStatus = 'pending'; 
        await utility.writeIntoJsonFile(
          'expected-values',
          expectedConfig,
          'expected/assisted-checkout/' +
            expectedConfig.merchantDetails.merchantName
        );
        //payment link logic here
        if (expectedConfig.planSummary.paymentMode == 'payment-Link') {
          await page.locator(this.sendEmailButton).click();
          // if(validationScreen.includes('payment-link-summary')){
          //   await this.paymentLinkScreenValidation();
          // }
          //email opening code here
          await utility.delay(2000);
          await this.openPaymentEmail(expectedConfig.customer.Email);
        
          await page.locator(this.logoutButton).click();
          //login
          const customerEmail = await utility.readCustomerDetails();
          const password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
          await login.submitLoginWithParameters(
            customerEmail.customer.Email,
            // `${process.env.CUSTOMER_PORTAL_PASSWORD}`,
            password,
            'true',
            'customer-portal',
            config.LocalEnv.env
          );
          await utility.delay(3000);
          await page.waitForSelector(this.addNewMethodButton);
          await page.locator(this.addNewMethodButton).click();
          await screen_validation.widgetAndSummaryValidation('Summary')

        }else{
          await page.locator(this.processManually).click();

        }
      }

        await this.addPaymentMethod(cardType); //adding payment
        await utility.delay(3000);
        if(expectedConfig.LocalEnv.environment=='PR'){

        if (expectedConfig.planSummary.paymentMode == 'payment-Link') {
          await page.locator(this.processPaymentButton).click();
          await utility.delay(1000);
        }else{
          await page.locator(this.viewPlanButton).click();
        }
        await utility.delay(19000);
        const currentUrl = page.url();
        const planId = await currentUrl.split('/').pop();
        expectedConfig.planSummary.planID = String(planId)

      }else{
        expectedConfig.planSummary.planID = await page
          .locator('#plan-id')
          .innerText();
      }
        expectedConfig.customer.userId = await pay.fetchAndWriteUserID(expectedConfig.planSummary.planID);
        const serviceFee = await calculation.calculateServiceFee(
          'exclusive',
          'planTotal'
        );
        expectedConfig.fees.TotalServiceFeesExcGST = String(serviceFee);
        expectedConfig.planSummary.planStatus = 'On Schedule';
        expectedConfig.planSummary.paymentsFrom =
          expectedConfig.planSummary.planDate;
        expectedConfig.planSummary.noOfInstallmentsToBePaid =
          expectedConfig.planSummary.numberOfInstalment;
         expectedConfig.planSummary.noOfInstallmentsPaid='1';

         const remainingAmount: any = Number(expectedConfig.planSummary.totalCost) -
         Number(expectedConfig.depositSettings.depositPaid)

        expectedConfig.planSummary.remainingAmount = await utility.upto2Decimal2(remainingAmount)
        // await String(
        //   Number(expectedConfig.planSummary.totalCost) -
        //     Number(expectedConfig.depositSettings.depositPaid)
        // );
        expectedConfig.planSummary.totalFunds =
          expectedConfig.depositSettings.depositPaid;
        await utility.writeIntoJsonFile(
          'expected-values',
          expectedConfig,
          'expected/assisted-checkout/' + merchant
        );
      }
    }
  }

  async verifyStandardRefundPolicy(screens: any) {
    const receivedPolicyText: any[] = [];
    let dates: any[] = [];
    let percentage: any[] = [];
    let refundableAmount: any[] = [];

    if (await page.locator(this.frontEndPolicy + '2]').isVisible()) {
      let count = 2;
      for (let i = 0; i < 3; i++) {
        receivedPolicyText[i] = await page
          .locator(this.frontEndPolicy + count + ']')
          .innerText();
        count++;
      }

      const dateRegex =
        /\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),\s\d{4}\b/g;
      dates = receivedPolicyText.map((text) => {
        const matches = text.match(dateRegex);
        return matches ? matches[0] : null;
      });

      for (let i = 0; i < Number(dates.length); i++) {
        dates[i] = await utility.formatDate(dates[i]);
      }
      
      const percentageRegex = /\b\d{1,2}%/g;


      percentage = receivedPolicyText.map((text) => {
        const matches = text.match(percentageRegex);
        return matches ? matches[0].replace('%', '') : null;
      });

      const amountRegex = /(?:\$|NZD|£|AUD)([0-9,.]+)/g;

      console.log('receivedPolicyText:', receivedPolicyText);

      refundableAmount = receivedPolicyText.map((text) => {
        const matches = text.match(amountRegex);
        if (matches && matches.length > 0) {
          // Remove dollar sign and commas from the amount
          const amountWithoutCommas = matches[0]
            .replace(/[$NZD£AUD]/, '')
            .replace(/,/g, '');
          return amountWithoutCommas;
        } else {
          return null;
        }
      });

      const refund_policies = await calculation.commonFunction(
        'refundPolicies'
      );
      console.log(
        '\u001b[1;32m refund policies \u001b[1;37m: ',
        refund_policies[1][0]
      );

      const expectedPolicyDays: any = [];
      const expectedPolicyPercentage: any = [];
      const expectedPolicyAmount: any = [];

      refund_policies[1][0].map((n: any) =>
        expectedPolicyDays.push(n.daysWithinRedemptionDate)
      );
      refund_policies[1][0].map((n: any) =>
        expectedPolicyPercentage.push(n.refundablePercentage)
      );

      for (let i = 0; i < expectedPolicyPercentage.length; i++) {
        expectedPolicyAmount[i] = await utility.upto2Decimal2(
          Number(expectedConfig.planSummary.totalCost) *
            (expectedPolicyPercentage[i] / 100)
        );
      }

      const expPolicyDates: any[] = [];

      // Convert the redemptionDate to a Date object
      const redemptionDate = new Date(
        expectedConfig.planSummary.redemptionDate.split('/').reverse().join('-')
      );

      // Subtract each policy day and add the new date to the policyDates array
      expectedPolicyDays.forEach((days) => {
        const newDate = new Date(redemptionDate);
        newDate.setDate(newDate.getDate() - days);

        // Format the date as "DD/MM/YYYY"
        const day = newDate.getDate().toString().padStart(2, '0');
        const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
        const year = newDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        expPolicyDates.push(formattedDate);
      });

      // console.log('expectedPolicyPercentage: ', expectedPolicyPercentage);
      // console.log('expectedPolicyDays: ', expectedPolicyDays);
      // console.log('expectedPolicyAmount: ', expectedPolicyAmount);
      // console.log('ExpoectedpolicyDates', expPolicyDates);

      const datesTitle: any[] = [];
      datesTitle.push(
        'First Policy Date',
        'Second Policy Date',
        'Third Policy Date'
      );
      const percentageTitle: any[] = [];
      percentageTitle.push(
        'First Policy Percentage',
        'Second Policy Percentage',
        'Third Policy Percentage'
      );
      const amountTitle: any[] = [];
      amountTitle.push(
        'First Policy Amount',
        'Second Policy Amount',
        'Third Policy Amount'
      );

      if (
        config.LocalEnv.verifyFlag == 'true' &&
        screens.includes('verify-standard-refund-policy')
      ) {
        await utility.matchValues(
          dates,
          expPolicyDates,
          datesTitle,
          'Refundable Policy Dates',
          'Merchant Portal'
        );
        await utility.matchValues(
          percentage,
          expectedPolicyPercentage,
          percentageTitle,
          'Refundable Policy Percentage',
          'Merchant Portal'
        );

        console.log('refundableAmount: ', refundableAmount);
        await utility.matchValues(
          refundableAmount,
          expectedPolicyAmount,
          amountTitle,
          'Refundable Policy Amount',
          'Merchant Portal'
        );
      } else {
        await utility.printValues(datesTitle, dates, 'Policy Dates');
        await utility.printValues(
          percentageTitle,
          percentage,
          'Policy Percentage'
        );
        await utility.printValues(
          amountTitle,
          refundableAmount,
          'Policy Refundable Amount'
        );
      }
    } else {
      console.log(
        '\u001b[1;31mMerchant level policy not found against Standard Policies..\u001b[1;37m'
      );
    }
  }
  async printOverview() {
    console.log('%%%%%%%%%%Printing Plan Overview%%%%%%%%%%');
    // const expected = await utility.commonJsonReadFunc('expectedFile');

    // await page.waitForSelector(this.alertMsgL);
    // const remMsg = await page.locator(this.alertMsgL).innerText();
    await page.waitForSelector(this.payToday);
    const payToday = await page.locator(this.payToday).inputValue();
    console.log('Redemtion date: ', expectedConfig.planSummary.redemptionDate);
    console.log('Plan Total: ', expectedConfig.planSummary.totalCost);
    // console.log('Remainder Message: ', remMsg);
    console.log('Pay Today: ', payToday);
    console.log(
      'Weekly Installments: ',
      expectedConfig.planSummary.Weekly.totalNoOfInstallments,
      ', option: ',
      expectedConfig.planSummary.Weekly.option
    );
    console.log(
      'Fortnightly Installments: ',
      expectedConfig.planSummary.Fortnightly.totalNoOfInstallments,
      ', option: ',
      expectedConfig.planSummary.Fortnightly.option
    );
    console.log(
      'Monthly Installments: ',
      expectedConfig.planSummary.Monthly.totalNoOfInstallments,
      ', option: ',
      expectedConfig.planSummary.Monthly.option
    );
  }

  async emailVerification(email: any) {
    console.log('%%%%%%%%%%Inside mail verification%%%%%%%%%%');
    const subject = 'Email verification';
    const page1 = await utility.openEmail(email, subject);
    await utility.delay(1000);
    const emailIframe = await page1.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    emailFrame?.waitForSelector(this.verifyMailL);
    // emailFrame?.locator(this.verifyMailL).click();
    await utility.delay(1000);
    // const page2 = await context.newPage();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      emailFrame?.locator(this.verifyMailL).click(),
    ]);
    await page1.close();
    await newPage.waitForLoadState();
    await newPage
      .locator(this.setPassL)
      .fill(`${process.env.CUSTOMER_PORTAL_PASSWORD}`);
    await newPage.waitForSelector(this.confirmPassL);
    await newPage
      .locator(this.confirmPassL)
      .fill(`${process.env.CUSTOMER_PORTAL_PASSWORD}`);
    await newPage.waitForSelector(this.phoneL);
    await newPage
      .locator(this.phoneL)
      .fill(config.customer.phoneNumber.slice(8, 12));
    await newPage.waitForSelector(this.activateBtnL);
    await newPage.locator(this.activateBtnL).click();
    await newPage.close();
  }

  //selects date,currency and plantotal
  async paymentPlan(redemptionDate: any) {
    await page.locator(this.currency_locator).click();
    console.log(
      'currency count ',
      await page
        .locator('text=' + expectedConfig.planSummary.checkoutCurrency)
        .count()
    );
    if (
      (await page
        .locator('text=' + expectedConfig.planSummary.checkoutCurrency)
        .count()) > 1
    ) {
      await page
        .locator('text=' + expectedConfig.planSummary.checkoutCurrency)
        .nth(1)
        .click();
    } else {
      await page
        .locator('text=' + expectedConfig.planSummary.checkoutCurrency)
        .click();
    }
    await page.waitForSelector(this.totalPriceL);
    await page
      .locator(this.totalPriceL)
      .fill(expectedConfig.planSummary.totalCost);
    await page.waitForSelector(this.calenderL);
    const date = await utility.convertDateStringtoArray(redemptionDate);
    await page.locator(this.calenderL).click();
    await utility.delay(2000);
    await utility.dynamicDateSelectionforAdminPlanDownload(
      date[0],
      date[1],
      date[2]
    );
  }
  //finds out/calculates pre-requisite for calculations ahead
  async preCalculations(redemptionDate: any) {
    await calculation.readMerchantFile();
    await calculation.calculateFinalCompletionDate(redemptionDate);
    await calculation.determineDepositRule();
    await calculation.calculateDefaultMinDepositAmount(
      expectedConfig.planDetails.productsAmount,
      expectedConfig.planDetails.productsQuantity
    );
    await dbconnection.identify_gateway();
  }
  async selectPolicy(poilcyType: string) {
    await page.locator(this.tyepOfPolicy).click();
    if (poilcyType == 'Standard') {
      await page.locator(this.default).click();
      expectedConfig.planDetails.poilcyType = poilcyType;
    } else if (poilcyType == 'Custom') {
      await page.locator(this.custom).click();
      expectedConfig.planDetails.poilcyType = poilcyType;
    } else if (poilcyType == 'Free cancellation') {
      await page.locator(this.none).click();
      expectedConfig.planDetails.poilcyType = poilcyType;
    }
  }
  async verifyPaymentPlanDetails() {
    const count = await page.locator(this.planDetailsL).count();
    // const remainder = await page.locator(this.remainderL).innerText();
    const arr = [];
    for (let i = 2; i < count; i++) {
      const orderData = await page
        .locator(this.planDetailsL)
        .nth(i)
        .innerText();
      const saperatedData = await utility.splitData(orderData);
      arr.push(saperatedData);
    }
    const currency = await page.locator(this.currency_locator).innerText();
    console.log('*******************currency ', currency);
    // const totalPrice = await page.locator(this.totalPriceL).innerText();
    const calenderDate = AssistedPlan.redemptionDate;
    console.log('calender date ', AssistedPlan.redemptionDate);
    const min = await page.locator(this.minDepositL).innerText();
    const max = await page.locator(this.maxDepositL).innerText();
    const payToday = await page.locator(this.payToday).inputValue();
    await utility.delay(1000);
    let alertText;
    let remainderValue;
    const ReceviedArray = [];

    if ((await page.locator(this.alertMsgL).isVisible()) == true) {
      alertText = await page.locator(this.alertMsgL).innerText();
      remainderValue = await utility.convertPricewithFraction(alertText);
    } else {
      remainderValue = 0.0;
    }
    const mergedArr = arr.flat(1);
    console.log('mergeArr', mergedArr);
    let expected = [];
    ReceviedArray[0] = await utility.convertPricewithFraction(mergedArr[0]);
    ReceviedArray[1] = await utility.formatDate(mergedArr[1]);
    ReceviedArray[2] = await parseInt(mergedArr[2]);
    ReceviedArray[3] = await utility.convertPricewithFraction(mergedArr[3]);
    ReceviedArray[4] = mergedArr[4];
    ReceviedArray[5] = mergedArr[5];
    ReceviedArray[6] = await utility.convertPricewithFraction(mergedArr[6]);
    ReceviedArray[7] = mergedArr[7];
    ReceviedArray[8] = currency;
    ReceviedArray[9] = await page.locator(this.bookingTotal).innerText();
    ReceviedArray[9] = await utility.removeComma(ReceviedArray[9]);
    ReceviedArray[10] = await utility.formatDate(calenderDate);
    ReceviedArray[11] = await utility.convertPricewithFraction(min);
    ReceviedArray[12] = await utility.convertPricewithFraction(max);
    ReceviedArray[13] = await utility.convertPricewithFraction(payToday);
    const todayDateC: any = await new Date();
    const convertedRedemtionDate: any = await utility.replaceDaywithMothinDates(
      expectedConfig.planSummary.redemptionDate
    );
    const redemptionDateC: any = await new Date(convertedRedemtionDate);
    const differnce = await utility.differenceInDate(
      todayDateC,
      redemptionDateC,
      true,
      false
    );

    console.log('differnce', differnce);
    expected = [
      await utility.upto2Decimal(expectedConfig.planSummary.totalCost),
      expectedConfig.planSummary.redemptionDate,
      differnce - 1,
      expectedConfig.planSummary.totalFunds,
      // String(Number(expectedConfig.planSummary.totalFunds)),
      expectedConfig.planSummary.installmentPeriod,
      expectedConfig.planSummary.numberOfInstalment,
      expectedConfig.planSummary.installmentAmount,
      expectedConfig.planSummary.InstallmentDay,
      expectedConfig.planSummary.checkoutCurrency,
      expectedConfig.planSummary.currencySymbol +
        expectedConfig.planSummary.totalCost +
        ' ' +
        expectedConfig.planSummary.checkoutCurrency,
      expectedConfig.planSummary.redemptionDate,
      expectedConfig.depositSettings.requiredMinimumDeposit_roundup,
      expectedConfig.depositSettings.MaxDepositAmount_rounddown,
      expectedConfig.depositSettings.depositExcludingRemainder,
      // 0,
    ];
    let matchvalueTitle = [];
    matchvalueTitle = [
      'Total Cost',
      'Booking Date',
      'Days until Travel',
      'Due Today',
      'Installment Type',
      'totalNoOfInstallments',
      'installmentAmount',
      'day of payment',
      'CheckoutCurrency',
      'Total Cost',
      'Redemption Date',
      'Minimum Deposit',
      'Maximum Deposit',
      'Pay Today',
    ];

    if (remainderValue != 0.0) {
      matchvalueTitle.push('Remainder');
      ReceviedArray.push(await parseFloat(remainderValue));
      expected.push(await parseFloat(expectedConfig.planSummary.Remainder));
    }

    await utility.printValues(
      matchvalueTitle,
      ReceviedArray,
      'verify_payment_plan_details'
    );
    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        ReceviedArray,
        expected,
        matchvalueTitle,
        'Payment Plan Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }

  async bookingDetails() {
    const customerEmail = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let description = '';
    if (AssistedPlan.userCategory == 'Existing') {
      this.expected_user[0] = customerEmail.customer.Email;
      this.expected_user[1] = customerEmail.customer.firstName;
      this.expected_user[2] = customerEmail.customer.lastName;
      this.expected_user[3] = customerEmail.customer.phoneNumber;
      await page.waitForSelector(this.emailL);
      await page.fill(this.emailL, this.expected_user[0]);
      description = await utility.enterRandomtext(5);
      await page.waitForSelector(this.descriptionL);
      await page.locator(this.descriptionL).fill(description);
      const bookingId = await utility.randomInteger(10, 100);
      await page.waitForSelector(this.bookingIdL);
      await page.locator(this.bookingIdL).fill(String(bookingId));
    } else if (AssistedPlan.userCategory == 'New') {
      const fname =
        (await config.customer.firstName) + (await utility.enterRandomtext(4));
      const lname =
        (await config.customer.lastName) + (await utility.enterRandomtext(4));
      this.myemailAddress = await signup.generateEmail();
      await dbconnection.verifyEmailExist(this.myemailAddress);
      console.log(
        'expectedConfig.flags.userExists',
        expectedConfig.flags.userExists
      );

      if (expectedConfig.flags.userExists == 'true') {
        console.log('inside flag true');
        // while ((await page.locator(this.existingEmail).isVisible()) == true) {
        do {
          console.log(
            '\u001b[1;31mYour Email is already exist!..\u001b[1;37m.'
          );
          console.log("\u001b[1;33mlet's try with new Email!..\u001b[1;37m.");
          this.myemailAddress = await signup.generateEmail();
          await dbconnection.verifyEmailExist(this.myemailAddress);
          await page.fill(this.emailL, this.myemailAddress);
          console.log('flag', expectedConfig.flags.userExists);
          // await page.click(this.nextButtonL);
          // await utility.delay(3000);
        } while (expectedConfig.flags.userExists == 'true');
      }
      this.expected_user[0] = this.myemailAddress;
      this.expected_user[1] = fname;
      this.expected_user[2] = lname;
      this.expected_user[3] = config.customer.phoneNumber;
      await page.waitForSelector(this.emailL);
      await page.fill(this.emailL, this.expected_user[0]);
      await utility.delay(2000);
      await page.waitForSelector(this.firstNameL);
      await page.fill(this.firstNameL, this.expected_user[1]);
      await page.waitForSelector(this.lastNameL);
      await page.fill(this.lastNameL, this.expected_user[2]);
      await page.waitForSelector(this.numberL);
      await page.fill(this.numberL, this.expected_user[3]);
      description = await utility.enterRandomtext(5);
      await page.waitForSelector(this.descriptionL);
      await page.locator(this.descriptionL).fill(description);
      const bookingId = await utility.randomInteger(10, 100);
      await page.waitForSelector(this.bookingIdL);
      await page.locator(this.bookingIdL).fill(String(bookingId));

      await utility.delay(1000);
      customerEmail.customerLog = customerEmail.customer;
      customerEmail.customer.firstName = fname;
      customerEmail.customer.lastName = lname;
      customerEmail.customer.Email = this.myemailAddress;
      customerEmail.customer.phoneNumber = config.customer.phoneNumber;
      customerEmail.customer.userStatus = 'Pending Verification';
      const d = await new Date();
      let todayDate: any = await d.toLocaleString('en-GB');
      todayDate = await todayDate.split(',');
      customerEmail.customer.accountCreated = todayDate[0];
      expectedConfig.customer = customerEmail.customer;
      await utility.delay(1000);
    }
    expectedConfig.planDetails.items = [];
    expectedConfig.planDetails.producItem = description;

    const date = expectedConfig.planSummary.redemptionDate;
    const redemMonth = await date.split('/');
    const monthName = await utility.getMonthName(redemMonth[1], 'long');
    const formattedRedemption =
      redemMonth[0] + '/' + monthName + '/' + redemMonth[2];
    const itemObj = {
      description: description,
      redemptionDate: formattedRedemption,
    };
    expectedConfig.planDetails.items.push(itemObj);
    return customerEmail;
  }
  async verifyUserDetails() {
    const userTitles = ['Email', 'First Name', 'Last Name', 'Phone No'];
    const userArr = [];

    userArr[0] = await (await page.waitForSelector(this.emailL)).inputValue();
    userArr[1] = await (
      await page.waitForSelector(this.firstNameL)
    ).inputValue();
    userArr[2] = await (
      await page.waitForSelector(this.lastNameL)
    ).inputValue();
    userArr[3] = await (await page.waitForSelector(this.numberL)).inputValue();
    await utility.printValues(userTitles, userArr, 'User Details');
    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        userArr,
        this.expected_user,
        userTitles,
        'User Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }
  async addPaymentMethod(cardType: any) {
    if (expectedConfig.planSummary.paymentPlatform_vendor == 'Stripe') {
      await stripe.addCard('valid', cardType, 'false');
    }
    if (expectedConfig.planSummary.paymentPlatform_vendor == 'Braintree') {
      await braintree.addCard('valid', cardType, 'false');
    }
  }

  // async paymentLinkScreenValidation(){

  // }

  async saveLinkAndExpiry(link:any){
    //expiry date 
    const currentDate =await new Date();

    // Add 24 hours (24 * 60 * 60 * 1000 milliseconds) to the current date
    await currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000);
  
    // Format the date and time in ISO 8601 format with milliseconds and timezone offset
    const formattedDateTime = await currentDate.toISOString();
    expectedConfig.planDetails.paymentLink.expiryDate = formattedDateTime;
    expectedConfig.planDetails.paymentLink.link = link;

  }

  async openPaymentEmail(email:any){
    console.log('%%%%%%%%%%Inside Pyment Link mail ');
    const subject = expectedConfig.customer.firstName+' please confirm your payment plan with '+expectedConfig.merchantDetails.merchantName;
    const page1 = await utility.openEmail(email, subject);
    await utility.delay(1000);
    const emailIframe = await page1.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    const inputfield=await emailFrame?.waitForSelector(this.proceedPaymentButton);
    await utility.delay(1000);
    const dataLink = await inputfield.getAttribute('href'); 
    await page1.close();
    await page.goto(dataLink);
    await this.saveLinkAndExpiry(dataLink);
    await page.waitForLoadState();
 
  }
}

