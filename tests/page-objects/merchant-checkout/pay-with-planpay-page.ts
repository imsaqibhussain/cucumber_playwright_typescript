import { expect } from '@playwright/test';
import { page } from '../../features/support/hooks';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { Utilities } from '../utilities';
import { calculations } from './calculations';
import { ScreensValidation } from '../merchant-checkout/screens_validation';
import { SignupPage } from '../customer-portal/signup-page';
const calculation = new calculations();
const utility = new Utilities();
const signUpPage = new SignupPage();
const screen_validation = new ScreensValidation();

import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';

export class PayWithPlanPay {
  static optionLocator: any;
  //initilalizing static variables for credit card checking
  static crediCardChecking: string;
  nextButton2L = '//button[@id="continue_payment"]';
  mintMakePayment = '//button[@data-planpay-test-id="process-payment-plan"]';
  isAgrL = '#is_agree_policy';
  isBuyL = '#buy_now';
  Monthly_locator = '#monthly';
  Fortnightly_locator = '#fortnightly';
  Weekly_locator = '#weekly';
  installmentNumberSummary = '#installment_number';
  installmentAmountSummary = '#Installment_Amount';
  bookingTotalSummary = '#Total_Cost';
  due_today_locator = "//input[@name='firstPaymentAmount']";
  credit_card_text = '#credit_card_text';
  verifyInstallmentslocator =
    "div[class='planpay-MuiGrid-root planpay-MuiGrid-container css-sag665'] div:nth-child(1) p";
  planpay_installment_locator = '#pay_in_installments';
  screen_validation1 =
    "//span[@class='MuiTypography-root MuiTypography-caption css-zdzmrx']";
  screen_validation2 =
    "//span[text()='Transaction complete. You will be redirected in a moment...']";
  declined_payment = "//div[text()='Your payment was declined']";
  screen_validation3 = "//p[text()='Checkout Success']";
  click_locator =
    "//h6[@class='MuiTypography-root MuiTypography-subtitle1 css-gwnnw9']";
  // dayDropdownL = '#date_dropdown';
  fullNameLocator = '#customer_name';
  depositTextFieldLocator = "//input[@name='deposit']";
  installmentLocator =
    "//div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-6 MuiGrid-grid-sm-3 css-3zx7e6']";
  RemainderAddingDescText =
    "(//span[contains(@class,'MuiTypography-root MuiTypography-overline')])[2]";
  creditCard = "//div[@class='css-11tmg7q']//span[1]";
  cardListL =
    "//span[@class='MuiTypography-root MuiTypography-caption css-mqqhfq']";
  editCreditCardLink = "//span[text()='edit']";
  // addNewMethodButton = "//div[@class='MuiBox-root css-1n2mv2k']";
  // addNewMethodButton = "//div[@class='MuiBox-root css-uiq7qp']";
  addNewMethodButton = "//button[@data-planpay-test-id='addpaymentmethod']";
  cardsNumber =
    "//span[contains(@class,'MuiTypography-root MuiTypography-caption')]";
  cancelButton =
    "//span[contains(@class,'MuiButton-startIcon MuiButton-iconSizeMedium')]/following-sibling::span[1]";

  // monthDropdownL = '#mui-component-select-installmentDate';
  editPlan = '[data-testid="EditOutlinedIcon"]';

  dayDropdownL = '//div[@data-planpay-test-id="cadence_day"]';
  monthDropdownL = '//div[@data-planpay-test-id="cadence_day"]';
  updateButton = '[data-planpay-test-id="update_btn"]';
  processPaymentButton = '[data-planpay-test-id="processpaymentplan"]';
  paymentApproveMsg = '#paymentplan_approved';
  processPayment = "[data-planpay-test-id='processpaymentplan']";

  cardlistLocator = "//div[@class='MuiStack-root css-f1umbb']";
  // "//body[@data-new-gr-c-s-check-loaded='14.1094.0']"
  // "//div[@id='mui-component-select-instalmentDate']";
  expected: string[] = [];
  feildName: string[] = [];
  recieved: string[] = [];

  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async calculate_allCadenceOptions() {
    console.log('after calculate_allCadenceOptions ');
    let InstallmentDay;
    const todayDate = await new Date();
    // InstallmentDay = await todayDate.getDate();
    const today = await todayDate.toLocaleString('en-US'); //change date format to mm/dd/yy
    let firstPaymentDate = await todayDate.toLocaleString('en-GB');
    const firstPaymentDateArray = await firstPaymentDate.split(',');
    firstPaymentDate = await firstPaymentDateArray[0];
    expectedConfig.planSummary.planDate = firstPaymentDate;

    let selectInstPeriod = '';
    let instalmentTypes = ['Weekly', 'Fortnightly', 'Monthly'];
    instalmentTypes = await utility.moveToFirst(
      instalmentTypes,
      expectedConfig.planSummary.selectedInstallmentPeriod
    );
    for (let i = 0; i < instalmentTypes.length; i++) {
      let option = 'deselected';
      switch (instalmentTypes[i]) {
        case 'Fortnightly':
          InstallmentDay = 14;
          break;
        case 'Weekly':
          InstallmentDay = 7;
          break;
        case 'Monthly':
          InstallmentDay = await todayDate.getDate();
      }

      expectedConfig.planSummary.selectedInstalmentType = instalmentTypes[i];
      if (
        instalmentTypes[i] ==
        expectedConfig.planSummary.selectedInstallmentPeriod
      ) {
        console.log(expectedConfig.planSummary.installmentPeriod);
        option = 'selected';
        selectInstPeriod = expectedConfig.planSummary.selectedInstallmentPeriod;
      }
      await calculation.calculateInstalments(
        instalmentTypes[i],
        today,
        InstallmentDay,
        'widget'
      );
      if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
        if (
          expectedConfig.planSummary[
            expectedConfig.planSummary.selectedInstallmentPeriod
          ].status == 'Not available'
        ) {
          expectedConfig.flags.blockedCheckout = 'true';
          await this.assistedCheckoutBlocked();
          break;
        } else {
          await calculation.newCheckoutDeposit();
          if (i == 0) {
            calculations.actualDeposit =
              expectedConfig.depositSettings.depositPaid;
            const flag = await screen_validation.checkCadence('widget');
            if (flag == 'true') {
              await this.assistedCheckoutBlocked();
              break;
            }
          }
        }
      } else {
        if (i == 0) {
          await calculation.newCheckoutDeposit(); //calculate deposit only once bcz it is same for all options
        }
      }

      await calculation.newCheckoutCalc(option);
      if (
        expectedConfig.planSummary.checkoutType == 'assisted-checkout' &&
        i == 2
      ) {
        expectedConfig.depositSettings.depositExcludingRemainder =
          calculations.actualDeposit;
        expectedConfig.depositSettings.depositPaid =
          calculations.actualDepositwithRemainder;
        expectedConfig.planSummary.totalFunds =
          calculations.actualDepositwithRemainder;
      }

      expectedConfig.planSummary.numberOfInstalment =
        calculations.selectTypeInstallment;
      expectedConfig.planSummary.totalNoOfInstallments =
        calculations.selectTypenumberofInstallment;
      expectedConfig.planSummary.installmentPeriod = selectInstPeriod;
      console.log(
        'inst period is ',
        expectedConfig.planSummary.selectedInstallmentPeriod
      );
      if (
        instalmentTypes[i] ==
        expectedConfig.planSummary.selectedInstallmentPeriod
      ) {
        const flag = await screen_validation.checkCadence('Widget');
        if (flag == 'true') {
          const msg = await page
            .locator(
              '[data-planpay-test-id="' + selectInstPeriod + '_not_available"]'
            )
            .innerText();
          await expect(msg).toEqual('Not available');
          console.log(selectInstPeriod, 'Option is Not available');
          expectedConfig.flags.blockedCheckout = 'true';
        } else {
          const optionLocator = 'input[value="' + selectInstPeriod + '"]';
          await page.waitForSelector(optionLocator);
          await page.click(optionLocator);
          await expect(page.locator(optionLocator)).toBeChecked(); //check if checked
        }
      }
    }
  }
  async selectionInstallationType(
    installmentType: string,
    option: string,
    operation?: string
  ) {
    let InstallmentDay;
    let today;
    console.log('Selected Instalment Period is ' + installmentType);
    PayWithPlanPay.optionLocator =
      "[data-planpay-test-id='" + installmentType + "']";
    if (operation == 'updatePlan') {
      let paymentsFrom = expectedConfig.planSummary.paymentsFrom;
      const convPaymentsFrom = await utility.change_DateFormat(paymentsFrom);
      if (
        (await utility.dateComparison(convPaymentsFrom, new Date())) == true
      ) {
        paymentsFrom = await utility.getFormatatedDate(new Date(), 'BR');
      }
      const paymentsFromArray = await utility.convertDateStringtoArray(
        paymentsFrom
      );
      paymentsFrom =
        paymentsFromArray[1] +
        '/' +
        paymentsFromArray[0] +
        '/' +
        paymentsFromArray[2];
      const nextpaymentDate = await new Date(paymentsFrom);
      InstallmentDay = await nextpaymentDate.getDate();
      today = await nextpaymentDate.toLocaleString('en-US'); //change date format to mm/dd/yy
      today = await today.split(',');
      today = today[0];
      today = await new Date(today);

      if (installmentType == 'Monthly') {
        today = await new Date(
          today.getFullYear(),
          today.getMonth(),
          InstallmentDay
        );
      } else if (installmentType == 'Weekly') {
        await today.setDate(today.getDate() + 7);
      } else {
        await today.setDate(today.getDate() + 14);
        console.log('here in fortnightly ', today);
      }
      today = await today.toLocaleString('en-US');
      const freq = await installmentType.toLowerCase();
      PayWithPlanPay.optionLocator = 'input#' + freq + '';
    } else {
      const todayDate = await new Date();
      InstallmentDay = await todayDate.getDate();
      today = await todayDate.toLocaleString('en-US'); //change date format to mm/dd/yy
      let firstPaymentDate = await todayDate.toLocaleString('en-GB');
      const firstPaymentDateArray = await firstPaymentDate.split(',');
      firstPaymentDate = await firstPaymentDateArray[0];
      expectedConfig.planSummary.planDate = firstPaymentDate;
    }
    await setTimeout(function () {
      console.log(' ');
    }, 15000);

    switch (installmentType) {
      case 'Fortnightly':
        InstallmentDay = 14;
        break;
      case 'Weekly':
        InstallmentDay = 7;
        break;
    }

    await calculation.calculateInstalments(
      installmentType,
      today,
      InstallmentDay,
      'widget'
    );
    if (option == 'selected') {
      if (
        expectedConfig.planSummary[installmentType].status == 'Not available'
      ) {
        const value = await page
          .locator(
            '[data-planpay-test-id="' + installmentType + '_not_available"]'
          )
          .innerText();
        await expect(value).toEqual('Not available');
        console.log(installmentType, ' option is not available');
        expectedConfig.flags.blockedCheckout = 'true';
      } else if (expectedConfig.planSummary.operationType == 'updatePlan') {
        await utility.delay(3000);
        await page.waitForSelector(PayWithPlanPay.optionLocator);
        await page.click(PayWithPlanPay.optionLocator);
        await expect(page.locator(PayWithPlanPay.optionLocator)).toBeChecked(); //check if checked
      }
    }
  }
  async selectOption_summaryPage() {
    await page.waitForSelector(PayWithPlanPay.optionLocator);
    await page.click(PayWithPlanPay.optionLocator);
    await expect(page.locator(PayWithPlanPay.optionLocator)).toBeChecked();
  }

  async click_planPay_installment() {
    if (expectedConfig.flags.blockedCheckout != 'true') {
      await Promise.all([
        await page.waitForSelector(this.planpay_installment_locator),
        //await page.waitfornavigation(),
        await page.click(this.planpay_installment_locator),
      ]);
    } else {
      console.log('Breaking from Planpay Installment');
    }
  }

  async addPaymentMethod(card: any) {
    const num = 0;
    const cards = card.split(',');
    const count = await cards.length;
    console.log('card length ', count);
    console.log('card ', cards);

    for (let i = 0; i < count; i++) {
      if (await page.locator(this.editCreditCardLink).isVisible()) {
        await page.locator(this.editCreditCardLink).click();
      }
      await page.locator(this.addNewMethodButton).click();
      if ((await utility.checkForError()) == 'pass') {
        await utility.delay(10000);
        await signUpPage.enterBillingDetails('valid', cards[i], 'false', '-');
        if (expectedConfig.planSummary.paymentPlatform_vendor == 'Mint') {
          await page.waitForSelector(this.mintMakePayment);
          await page.click(this.mintMakePayment);
        } else {
          await page.waitForSelector(this.nextButton2L);
          await page.click(this.nextButton2L);
        }

        if (
          cards[i] === 'threeD_Visa' ||
          cards[i] === 'threeD_MasterCard' ||
          cards[i] === 'threeD_American'
        ) {
          console.log('3 D Secure Authentication Start');
          await utility.delay(10000);

          if (expectedConfig.planSummary.paymentPlatform_vendor == 'Adyen') {
            if (
              (await page
                .frameLocator('iframe[title="components iframe"]')
                .locator('.input-field')
                .first()
                .isVisible()) == true
            ) {
              await page
                .frameLocator('iframe[title="components iframe"]')
                .locator('.input-field')
                .first()
                .fill('password');

              await page
                .frameLocator('iframe[title="components iframe"]')
                .locator('#buttonSubmit')
                .click();
            }
          } else if (
            expectedConfig.planSummary.paymentPlatform_vendor == 'Stripe'
          ) {
            await page
              .frameLocator('iframe[role="presentation"]')
              .first()
              .frameLocator('iframe[id="challengeFrame"]')
              .frameLocator('iframe[name="acsFrame"]')
              .locator('.globalContent')
              .locator('#test-source-authorize-3ds')
              .click();
          }

          console.log('3 D Secure Authentication Complete');
        }
      } else {
        await expect(num).toEqual(1);
      }
    }
    // await page.locator(this.cancelButton).click();
    await utility.delay(5000);
  }
  async verifyPaymentMethod(cards: any, defaultCardType: any) {
    const ActualcreditCardLast4Digit = [];
    const ExpectedCardLastFourDigit = [];
    const FieldName = [];
    let cardsArray = [];
    cardsArray = await cards.split(',');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(
      'expectedConfig.planSummary.paymentPlatform_vendor',
      expectedConfig.planSummary.paymentPlatform_vendor
    );
    console.log('card type', defaultCardType);
    // ExpectedCardLastFourDigit[0] = await config.testCards[
    //   expectedConfig.planSummary.paymentPlatform_vendor
    // ].valid[defaultCardType].cardnumber
    //   .toString()
    //   .slice(-4);
    console.log('clicking cardlist');
    await page.locator(this.cardlistLocator).click();
    await utility.delay(1000);
    const count = (await page.locator(this.cardlistLocator).count()) - 1;
    console.log('cardlist count', count);
    for (let i = 0; i < count; i++) {
      FieldName.push('Verify Payment Method');
      const data = await page.locator(this.cardlistLocator).nth(i).innerText();
      console.log('data', await data.toString().slice(-4));
      ActualcreditCardLast4Digit.push(String(await data.toString().slice(-4)));
    }

    await page.locator(this.cardlistLocator).nth(1).click();

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ExpectedCardLastFourDigit[i] = await config.testCards[
        expectedConfig.planSummary.paymentPlatform_vendor
      ].valid[cardsArray[i]].cardnumber
        .toString()
        .slice(-4);
    }

    await ActualcreditCardLast4Digit.sort(
      (ActualcreditCardLast4Digit, ExpectedCardLastFourDigit) =>
        ActualcreditCardLast4Digit - ExpectedCardLastFourDigit
    );
    await ExpectedCardLastFourDigit.sort(
      (ExpectedCardLastFourDigit, ActualcreditCardLast4Digit) =>
        ExpectedCardLastFourDigit - ActualcreditCardLast4Digit
    );

    await utility.matchValues(
      ActualcreditCardLast4Digit,
      ExpectedCardLastFourDigit,
      FieldName,
      'Checkout Summary',
      'Merchant Testing'
    );

    // await page.locator(this.cardlistLocator).click();
  }

  async screen_validation(path: string) {
    // await page.waitForSelector(this.screen_validation1);
    // const msg1 = await page.locator(this.screen_validation1).innerText();
    // const expected_msg1 = 'Processing transaction...';
    // if (msg1 == expected_msg1) {
    //   console.log('Transaction Processing Screen Validated');
    // } else {
    //   console.log('Transaction Processing Screen Validation Failed');
    //   await expect(msg1).toBe(expected_msg1);
    // }
    // const testCaseErrCheck = await utility.checkForError();
    // console.log('testCaseErrCheck: ' + testCaseErrCheck);
    // if (testCaseErrCheck == 'fail') {
    //   await expect(testCaseErrCheck).toEqual('pass');
    // }
    // //special check for braintree
    // if (expectedConfig.planSummary.paymentPlatform_vendor == 'Braintree') {
    //   await this.depositCheck(Number(expectedConfig.planSummary.totalFunds));
    // }
    // if (expectedConfig.flags.blockedCheckout != 'true') {
    //   await page.waitForSelector(this.screen_validation2);
    //   const msg2 = await page.locator(this.screen_validation2).innerText();
    //   const expected_msg2 =
    //     'Transaction complete. You will be redirected in a moment...';
    //   if (msg2 == expected_msg2) {
    //     console.log('Transaction Completion Screen Validated');
    //   } else {
    //     console.log('Transaction Processing Screen Validation Failed');
    //     await expect(msg2).toBe(expected_msg2);
    //   }
    //   await utility.writeIntoJsonFile('expected-values', expectedConfig, path);

    //Checkout Successful Screen Validation
    const expected_msg3 = 'Checkout Success';
    await page.waitForSelector(this.screen_validation3);
    const msg3 = await page.locator(this.screen_validation3).innerText();

    if (msg3 == expected_msg3) {
      await console.log('Checkout Successful Screen Validated');
      expectedConfig.planSummary.message = 'successful';
      await this.fetchAndWritePlanID(path); //fetch checkout id from URL and query db to get planid against extracted checkout_id
    } else {
      await console.log('Checkout Successfull Screen Validation Failed');
      await expect(msg3).toBe(expected_msg3);
    }
  }
  // }

  async depositCheck(deposit: any) {
    const flag = await utility.depositCheck(deposit);
    if (flag == true) {
      expectedConfig.flags.blockedCheckout = 'true';
      console.log(
        'expectedConfig.flags.blockedCheckout ',
        expectedConfig.flags.blockedCheckout
      );
      await page.waitForSelector(this.declined_payment);
      const msg = await page.locator(this.declined_payment).innerText();
      const expectedmsg = 'Your payment was declined';
      await expect(msg).toEqual(expectedmsg);
      console.log('\x1b[31m Your payment was declined \x1b[37m');
      console.log('\x1b[31m Checkout is blocked \x1b[37m');
    }
  }

  async fetchAndWritePlanID(path: string) {
    const urlString = page.url();
    const url = new URL(urlString);
    // let urlString1 = await urlString.split('/');
    // urlString1 = urlString1[4].split('?');
    // console.log('url string ', urlString1[0]);
    const checkout_id = url.searchParams.get('planpay_checkout_id');
    const expectedJSON = await utility.readJsonFile(
      path + '/expected-values.json'
    );

    console.log('checkout_id ', checkout_id);
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT id FROM Plan WHERE checkoutId = ${checkout_id} LIMIT 1`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    expectedConfig.planSummary.planID = results[0].id;
    expectedJSON.planSummary = expectedConfig.planSummary;
    expectedJSON.paidPayments = expectedConfig.paidPayments;
    const userId = await this.fetchAndWriteUserID(results[0].id);
    expectedConfig.customer.userId = userId;
    utility.writeIntoJsonFile('expected-values', expectedConfig, path);
  }

  async fetchAndWriteUserID(planId: string) {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT userId FROM Plan WHERE id = ${planId} LIMIT 1`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    const userId = results[0].userId;
    return userId;
  }

  async payNow(
    installmentType: string,
    InstallmentDay: any,
    validationApplications: string,
    data: any,
    defaultCardType: string,
    paymentMethods: string
  ) {
    let alreadySelected = 'false';
    // if (PayWithPlanPay.crediCardChecking == 'creditCardChecking') {
    //   console.log('*************adding payment methods***********');
    //   await this.addPaymentMethod(paymentMethods);
    //   await console.log('right now calling verify payment method');
    //   await this.verifyPaymentMethod(paymentMethods, defaultCardType);
    // }

    console.log(
      '*************adding payment methods***********',
      paymentMethods
    );
    await this.addPaymentMethod(defaultCardType);
    // await console.log('right now calling verify payment method');
    // await this.verifyPaymentMethod(paymentMethods, defaultCardType);
    expectedConfig.LocalEnv.screen = 'CheckoutSummary';

    utility.delay(1000);
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m On Planpay Summary Page \x1b[37m%%%%%%%%%%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%\x1b[35m Calculated Values on Planpay Summary Page \x1b[37m%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );
    await this.delay(10000);
    await page.locator(this.editPlan).click();
    if (installmentType == expectedConfig.planSummary.installmentPeriod) {
      alreadySelected = 'true';
      console.log(installmentType, ' option is already selected');
    } else {
      expectedConfig.depositSettings.depositSetting == 'userEntered' //deposit retention check
        ? await this.depositRententionCheck()
        : console.log('Default deposit settings');
      await this.selectionInstallationType(installmentType, 'selected');
      await calculation.calculationsFunc('selected');
      if (
        expectedConfig.planSummary[installmentType].status == 'Not available'
      ) {
        expectedConfig.flags.blockedCheckout = 'true';
      }
    }

    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log(installmentType, 'is not Available');
    } else {
      if (alreadySelected == 'false') {
        await this.selectOption_summaryPage();
      }
      await this.selectInstallmentDay(installmentType, InstallmentDay);
      //Check for special Rule
      await calculation.checkSpecialRule(installmentType, InstallmentDay); //check if special rule applies(if user has selected some other instalment day)
      const flag = await screen_validation.checkCadence('Summary');
      if (flag == 'true') {
        expectedConfig.flags.blockedCheckout = 'true';
        const msg = await page
          .locator(
            "[data-planpay-test-id='" + installmentType + "_not_available']"
          )
          .innerText();
        await expect(msg).toEqual('Not available');
        const button = await page.getByRole('button', { name: /Update/i });
        await expect(button).toHaveAttribute('disabled', '');
        console.log(installmentType, 'is not Available');
      } else {
        data.UpcomingPayments = expectedConfig.UpcomingPayments; //copying upcoming payment in data obj
        data.paidPayments = expectedConfig.paidPayments; //copying paid payments in data obj
        await calculation.calculateRemainingAndPaidAmount(); //calculates Remaining and paid so far amount
        console.log(
          'Calculated Completion Date is ' +
            expectedConfig.planSummary.completionDate
        );

        data.planSummary.remainingAmount =
          expectedConfig.planSummary.remainingAmount;
        data.planSummary.totalFunds = expectedConfig.planSummary.totalFunds;
        const serviceFee = await calculation.calculateServiceFee(
          'exclusive',
          'planTotal'
        );
        expectedConfig.fees.TotalServiceFeesExcGST = String(serviceFee);
        expectedConfig.fees.ServiceFeesExcGSTonPaid = await String(
          await calculation.calculateServiceFee('exclusive', 'totalFunds')
        );
        await calculation.calculatenoOfInstallmentsToBePaid();
        await page.locator(this.updateButton).click();
        (await validationApplications.includes('checkout_summary'))
          ? await screen_validation.widgetAndSummaryValidation('Summary')
          : console.log('No Checkout Summary Screen Printing and Verification');
        if (expectedConfig.flags.blockedCheckout == 'true') {
          console.log('i am passing ');
        }
        await calculation.paidInstalmensts(); //creates pattern to save paid payments in config
        const commonDetails = await utility.readCustomerDetails();
        (commonDetails.customer = expectedConfig.customer),
          (commonDetails.customerLog = expectedConfig.customerLog),
          (commonDetails.planCreated = 'true'); //setting true flag on successful order placement.
        await utility.writeIntoJsonFile(
          'common-details',
          commonDetails,
          'expected'
        );
        await utility.delay(5000);
        let path;
        if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
          path =
            'expected/' +
            expectedConfig.planSummary.checkoutType +
            '/' +
            expectedConfig.merchantDetails.sub_merchantName;
        } else {
          path =
            'expected/' +
            expectedConfig.planSummary.checkoutType +
            '/' +
            expectedConfig.merchantDetails.merchantName;
        }
        data.planSummary.paymentsFrom =
          expectedConfig.paidPayments[
            expectedConfig.paidPayments.length - 1
          ].date;

        expectedConfig.planSummary.numberOfInstalment =
          calculations.selectTypeInstallment;
        expectedConfig.planSummary.totalNoOfInstallments =
          calculations.selectTypenumberofInstallment;
        expectedConfig.planSummary.installmentPeriod = installmentType;

        await utility.writeIntoJsonFile('expected-values', data, path);
        await utility.delay(2000);
        await page.locator(this.processPaymentButton).click();
        await utility.delay(2000);
        await this.depositCheck(
          Number(expectedConfig.depositSettings.depositExcludingRemainder)
        );
        if (expectedConfig.flags.blockedCheckout != 'true') {
          const expectedmsg =
            'Great news! Your payment plan has been approved.';
          const actualMsg = await page
            .locator(this.paymentApproveMsg)
            .innerText();
          await expect(expectedmsg).toEqual(actualMsg);
          console.log(
            '\x1b[32m Great news! Your payment plan has been approved.\x1b[37m'
          );
          await utility.delay(11000);
          await this.screen_validation(path);
        }

        // await page.waitForSelector(this.isAgrL);
        // await page.click(this.isAgrL);
        // if (PayWithPlanPay.crediCardChecking != 'creditCardChecking') {
        //   // await page.waitForSelector(this.isBuyL);
        //   // await page.click(this.isBuyL);
        //   // await this.screen_validation(path);
        //   // await this.delay(3000);
        // } else {
        //   // await this.creditCardValidation(defaultCardType);
        //   console.log('*************adding payment methods***********');
        //   await this.addPaymentMethod(paymentMethods);
        //   await console.log('right now calling verify payment method');
        //   await this.verifyPaymentMethod(paymentMethods, defaultCardType);
        // }
      }
    }
  }

  async selectInstallmentDay(installmentType: string, InstallmentDay: string) {
    expectedConfig.planSummary.InstallmentDay = InstallmentDay;
    this.dayDropdownL = '//div[@data-planpay-test-id="cadence_day"]';
    this.monthDropdownL = '//div[@data-planpay-test-id="cadence_day"]';
    if (
      expectedConfig.planSummary.checkoutType == 'assisted-checkout' &&
      expectedConfig.planSummary.operationType != 'updatePlan'
    ) {
      const cadenceOption = await installmentType.toLowerCase();
      this.dayDropdownL = cadenceOption + '-date-selector';
      await page.getByTestId(this.dayDropdownL).click({ force: true });
      // await page.locator('#installment_day_' + InstallmentDay).click();
    } else {
      await page.locator(this.dayDropdownL).click();
    }
    if (installmentType === 'Monthly') {
      // await page.locator(this.monthDropdownL).click();
      await page
        .locator('li[role="option"]:has-text("' + InstallmentDay + '")')
        .nth(0)
        .click();
    } else {
      // await page.locator(this.dayDropdownL).click();
      // const myDay = await page.locator(this.dayDropdownL).innerText();
      // console.log('Selected Instalment Day is ' + InstallmentDay);
      // if (InstallmentDay == myDay) {
      //   await page.locator('#installment_day_' + InstallmentDay).click();
      // } else {
      await page.locator('#installment_day_' + InstallmentDay).click();
      // }
    }
  }

  async depositRententionCheck() {
    const depositAmount = await page.$eval(
      "input[name='deposit']",
      (el: any) => el.value
    );
    await expect(depositAmount).toEqual(
      expectedConfig.depositSettings.depositExcludingRemainder
    );
    console.log('!!deposit value rentained at summary page !!');
  }
  async planNotAvailable() {
    const Msg = await page
      .locator(
        '//span[text()="Plan option is not available for this price/dates. Here are a few tips to help fixing that"]'
      )
      .innerText();
    expect(Msg).toEqual(
      'Plan option is not available for this price/dates. Here are a few tips to help fixing that'
    );
    console.log(
      '\x1b[31m Plan option is not available for this price/dates. Here are a few tips to help fixing that \x1b[37m'
    );
  }
  async blockedCase(installmentType: string) {
    const type = await installmentType.toLowerCase();
    expectedConfig.flags.blockedCheckout = 'true';
    const msg = await page
      .locator("[data-testid='" + type + "-radio-option-description']")
      .innerText();
    await expect(msg).toEqual(
      installmentType + ' payment plan not available for this price/dates'
    );
    const button = await page.locator('#' + type);
    await expect(button).toHaveAttribute('disabled', '');
    console.log(installmentType, 'is not Available');
  }
  async assistedCheckoutBlocked() {
    if (expectedConfig.planSummary.selectedInstallmentPeriod == 'Weekly') {
      await this.planNotAvailable();
    } else {
      await this.blockedCase(
        expectedConfig.planSummary.selectedInstallmentPeriod
      );
    }
  }
}
