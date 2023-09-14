import { expect } from '@playwright/test';
import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { OrderSummary } from './order-summary-page';
import { OrderDetails } from './order-details-page';
// import { SignupPage } from '../customer-portal/signup-page';
import { debugPlan } from '../payment-platform-integration/debug-plan';
import * as fs from 'fs';
import { Stripe } from '../payment-gateway/stripe';
import { Braintree } from '../payment-gateway/braintree';
import { calculations } from '../merchant-checkout/calculations';
const stripe = new Stripe();
const braintree = new Braintree();
const utility = new Utilities();
const orderSummary = new OrderSummary();
const orderDetails = new OrderDetails();
// const signUp = new SignupPage();
const debug = new debugPlan();
const calculation = new calculations();
export class AllOrdersPage {
  static payButtonNotFoundCount: any = 3;
  // allOrdersSection = '#mui-p-83374-P-UPCOMING';
  // allOrdersSection =
  //   "//div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-md-6 css-iol86l']";
  // allOrdersSection = "//div[@class='MuiBox-root css-bwkzxw']";
  // allOrdersSection = "//div[@class='MuiGrid-root MuiGrid-container css-yzprq3']";
  // allOrdersSection = "//div[@class='MuiBox-root css-62f010']";//for PR 1467
  allOrdersSection = "//div[@id='all_plans']"; //for PR 1467
  upOrdersSection = "//button[@data-planpay-test-id='upcoming_payments']";
  //"//div[@id='upcoming_plans']"; //for PR 1467

  //"//div[@class='MuiBox-root css-1u2lqr1']";

  //"//div[@class='MuiBox-root css-pk84me']";
  orderItemsLocator = '.css-pk84me';
  merchanName = '.css-1d7c518';
  orderInformation = "//div[@class='css-ikzlcq']";
  upcomingPlans = "//button[@data-planpay-test-id='upcoming_payments']";
  //"//div[@id='upcoming_plans']";
  allPlans = "//div[@id='all_plans']";

  // viewOrderL = '#view_order_1';
  viewOrderL = "//div[@class='MuiBox-root css-15ptzx6']";
  //"//div[@class='MuiBox-root css-bwkzxw']";
  // viewOrderL = "//div[@class='MuiGrid-root MuiGrid-container css-yzprq3']";

  //'text=Plan details';
  //'text=View order';
  addMethodBtn = 'text= ADD NEW METHOD';
  cardDigits =
    "//span[@class='MuiTypography-root MuiTypography-caption css-mqqhfq']";
  editL = "//span[@id='credit_card_link']";
  allOrdersL = "//button[text()='ALL PLANS']";
  backButtonL =
    "//button[contains(@class,'MuiButtonBase-root MuiButton-root')]";
  upcomingPaymentsL = "//button[normalize-space()='UPCOMING PAYMENTS']";
  cancelButtonL = "//span[normalize-space()='Cancel']";
  lateButtonL = "//button[@id='late_payment_button']";
  // confirmButtomL = "//button[text='Confirm']";
  confirmButtonL = '#pay-late-installment';
  DonebuttonL = 'Done';
  payInstallmentButton = "//button[@data-planpay-test-id='pay_instalments']";
  displayMOreButton = "//div[@data-planpay-test-id='display_more']";
  displayLessButton = "//div[@data-planpay-test-id='display_less']";
  payNextButton = "//button[@data-planpay-test-id='Next']";
  payButton = "//button[@data-planpay-test-id='Pay']";
  confirmButton = "//button[@data-planpay-test-id='Confirm']";
  doneButton = "//button[@data-planpay-test-id='Done']";
  paymentSuccessfull =
    "//h4[@class='MuiTypography-root MuiTypography-h4 css-1czhng1']";
  skipInstallmentButton = "//button[@data-planpay-test-id='skip-instalments']";
  // order_id_locator="//div[@id=";
  //MuiTypography-root MuiTypography-h4 css-p4mtw5
  // installmentDate_locator = "//span[text()='Due']";
  paymentHistoryView = '#fullpayment';
  retryLatePayment = "//button[@data-planpay-test-id='retry_payment']";
  retryMessage = '.message';
  customerAllOrder = "//button[@data-planpay-test-id='all_plans']";
  paymentFailErrorMessage = "//span[@class='message']";
  expectedOrderDet = [];

  detailVerificationValue: any;
  detailVerificationProList = [];
  viewOrderLocator: any;
  merchantName = '';
  producItem = '';
  orderItem: any;

  async navigateAndVerifyOrder(
    applicationName: any,
    tabName: any,
    screenName: any,
    merchantName: any,
    producItem: any
  ) {
    await utility.delay(3000);
    expectedConfig.LocalEnv.merchantName = merchantName;
    this.producItem = producItem;
    const data = await utility.commonJsonReadFunc('expectedFile');
    expectedConfig.planSummary.planID = data.planSummary.planID;
    await this.tabDetails(screenName, tabName);
  }

  async formFill(cardStatus: any, paymentMethods: any) {
    const paymentMethodscount = paymentMethods.split(',');
    const data = await utility.commonJsonReadFunc('expectedFile');
    expectedConfig.planSummary = data.planSummary;
    await page.waitForLoadState();
    await utility.delay(5000);
    await page.waitForSelector(this.editL);
    await page.locator(this.editL).click();
    for (let j = 0; j < paymentMethodscount.length; j++) {
      const cardNumber: any =
        config.testCards[expectedConfig.planSummary.paymentPlatform_vendor][
          cardStatus
        ][paymentMethodscount[j]].cardnumber;
      const leng = await cardNumber.length;
      if (leng == 16) {
        data.planSummary.paymentMethod = await cardNumber.slice(12, 16);
      } else {
        data.planSummary.paymentMethod = await cardNumber.slice(11, 15);
      }
      await utility.delay(2000);
      await page.waitForSelector(this.addMethodBtn);
      await page.locator(this.addMethodBtn).click();
      await utility.delay(1000);
      if (expectedConfig.planSummary.paymentPlatform_vendor == 'Stripe') {
        await stripe.addCard(cardStatus, paymentMethodscount[j], 'false');
      }
      if (expectedConfig.planSummary.paymentPlatform_vendor == 'Braintree') {
        await braintree.addCard(cardStatus, paymentMethodscount[j], 'false');
      }
      let merchant = expectedConfig.merchantDetails.merchantName;
      if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
        merchant = expectedConfig.merchantDetails.sub_merchantName;
      }
      await utility.writeIntoJsonFile(
        'expected-values',
        data,
        'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant
      );
      await utility.delay(2000);
    }
  }
  async makePyamentsPopup(
    planID: any,
    nTransactions: number,
    screens: any,
    merchantName: any
  ) {
    let validationScreen: any = [];

    if (screens.includes(',')) {
      validationScreen = await screens.split(',');
    } else {
      validationScreen.push(screens);
    }

    const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${planID}`;
    await page.goto(plan);
    await utility.delay(1000);
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    const upcomingPayments = expectedJson.UpcomingPayments;
    let value = false;

    await page.waitForLoadState();
    await utility.delay(5000);
    await page.waitForSelector(this.payInstallmentButton);
    if ((await page.locator(this.payInstallmentButton).isVisible()) == true) {
      await page.locator(this.payInstallmentButton).click();
    } else {
      console.log('Pay installment button not available');
      while (AllOrdersPage.payButtonNotFoundCount > 0) {
        AllOrdersPage.payButtonNotFoundCount =
          AllOrdersPage.payButtonNotFoundCount - 1;
        await this.makePyamentsPopup(
          expectedJson.planSummary.planID,
          nTransactions,
          screens,
          merchantName
        );
      }
      value = true;
    }
    await expect(value).toEqual(false);

    await utility.delay(1000);
    while ((await page.locator(this.displayMOreButton).isVisible()) == true) {
      await page.locator(this.displayMOreButton).click();
    }

    console.log(
      'Total Number of Upcoming Payments => ',
      upcomingPayments.length
    );
    for (let x = 0; x < upcomingPayments.length; x++) {
      let number = 0;
      if (expectedJson.latePayments.length > 0) {
        number =
          Number(x + expectedJson.latePayments.length + 1) +
          Number(expectedJson.planSummary.noOfInstallmentsPaid);
      } else {
        number =
          Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
      }
      const installmentDate = '#list_instalment_' + number;
      const installmentStatus = '#list_instalment_status_' + number;
      const installmentAmount = '#list_instalment_amount_' + number;

      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Upcoming Paymnet => ',
        x + 1,
        ' \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );

      const titleArrayForUpcoming = ['Date', 'Status', 'Amount'];
      const actual = [
        await utility.formatDate(
          await page.locator(installmentDate).innerText()
        ),
        await page.locator(installmentStatus).innerText(),
        await utility.convertPricewithFraction(
          await page.locator(installmentAmount).innerText()
        ),
      ];
      const expected = [
        upcomingPayments[x].date,
        upcomingPayments[x].status,
        upcomingPayments[x].amount,
      ];
      for (let i = 0; i < (await validationScreen.length); i++) {
        if (
          config.LocalEnv.verifyFlag === 'true' &&
          validationScreen[i] === 'make-payment-popup'
        ) {
          await utility.matchValues(
            actual,
            expected,
            titleArrayForUpcoming,
            'make-payment-popup',
            expectedConfig.LocalEnv.applicationName
          );
        }
      }
    }
    for (let n = 0; n < nTransactions; n++) {
      let number = 0;
      if (expectedJson.latePayments.length > 0) {
        number =
          Number(n + expectedJson.latePayments.length + 1) +
          Number(expectedJson.planSummary.noOfInstallmentsPaid);
      } else {
        number =
          Number(n + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
      }
      const installmenSelect =
        "//span[@data-planpay-test-id='list-instalment-select-" + number + "']";
      await page.locator(installmenSelect).click();
    }
    await page.locator(this.payNextButton).click();

    const totalNewInstallmentAmount = await utility.convertPricewithFraction(
      await page.locator('#selected_total_amount').innerText()
    );

    console.log(
      'Total Number of Selected Installments For Payment => ',
      nTransactions
    );
    let totalAmointUpcoming = 0;

    for (let k = 0; k < nTransactions; k++) {
      totalAmointUpcoming += Number(expectedJson.UpcomingPayments[k].amount);
    }

    for (let x = 0; x < nTransactions; x++) {
      let number = 0;
      if (expectedJson.latePayments.length > 0) {
        number =
          Number(x + expectedJson.latePayments.length + 1) +
          Number(expectedJson.planSummary.noOfInstallmentsPaid);
      } else {
        number =
          Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
      }
      const installmentDate = '#list_instalment_' + number;
      const installmentStatus = '#list_instalment_status_' + number;
      const installmentAmount = '#list_instalment_amount_' + number;

      const titleArrayForUpcoming = [
        'Date',
        'Status',
        'Amount',
        'Total Amount',
      ];
      const actual = [
        await utility.formatDate(
          await page.locator(installmentDate).innerText()
        ),
        await page.locator(installmentStatus).innerText(),
        await utility.convertPricewithFraction(
          await page.locator(installmentAmount).innerText()
        ),
        await utility.upto2Decimal(totalNewInstallmentAmount),
      ];

      const expected = [
        upcomingPayments[x].date,
        upcomingPayments[x].status,
        upcomingPayments[x].amount,
        await utility.upto2Decimal(totalAmointUpcoming),
      ];

      for (let i = 0; i < (await validationScreen.length); i++) {
        if (
          config.LocalEnv.verifyFlag === 'true' &&
          validationScreen[i] === 'make-payment-review'
        ) {
          await utility.matchValues(
            actual,
            expected,
            titleArrayForUpcoming,
            'make-payment-review',
            expectedConfig.LocalEnv.applicationName
          );
        }
      }

      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Start Pay n installments  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );
    }

    await page.locator(this.payButton).click();

    await utility.delay(5000);

    if (
      (await page.locator(this.paymentFailErrorMessage).isVisible()) == true
    ) {
      const paymentErrorMessage = await page
        .locator(this.paymentFailErrorMessage)
        .innerText();

      console.log('Payment Error =>', paymentErrorMessage);

      value = true;
      await expect(value).toEqual(false);
    }

    console.log(
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Updateing expectedJson with   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
    );

    const newnumberOfInstalment =
      expectedJson.planSummary.numberOfInstalment - nTransactions;
    const newnoOfInstallmentsPaid =
      Number(expectedJson.planSummary.noOfInstallmentsPaid) + Number(1);
    const newtotalNoOfInstallments =
      Number(newnumberOfInstalment) + Number(newnoOfInstallmentsPaid);
    const newTotalFound =
      Number(totalNewInstallmentAmount) +
      Number(expectedJson.planSummary.totalFunds);
    const newRemainingAmount =
      expectedJson.planSummary.totalCost - newTotalFound;

    expectedJson.planSummary.numberOfInstalment = String(newnumberOfInstalment);
    expectedJson.planSummary.noOfInstallmentsToBePaid = String(
      newnumberOfInstalment
    );
    expectedJson.planSummary.noOfInstallmentsPaid = String(
      newnoOfInstallmentsPaid
    );
    expectedJson.planSummary.totalNoOfInstallments = String(
      newtotalNoOfInstallments
    );
    expectedJson.planSummary.totalFunds = String(
      await utility.upto2Decimal((await Math.round(newTotalFound * 100)) / 100)
    );
    expectedJson.planSummary.remainingAmount = String(
      await utility.upto2Decimal2(newRemainingAmount)
    );

    //const toDayDate = new Date();
    const payments = {
      amount: totalNewInstallmentAmount,
      date: expectedJson.UpcomingPayments[nTransactions - 1].date,
      //actualPaidDate: await utility.formatDate(toDayDate),
      actualPaidDate: expectedJson.planSummary.effectiveDate,
      instalment: newnoOfInstallmentsPaid + '/' + newtotalNoOfInstallments,
      paymentMethodUsed: expectedJson.planSummary.paymentMethod,
      status: 'Paid',
      paymentType: 'ADVANCE',
      remainder: '0.00',
    };
    const paidpayments = expectedJson.paidPayments;
    await paidpayments.push(payments);

    const paidLength = paidpayments.length;
    const chargeType = {
      amountcapturedAvailable: paidpayments[paidLength - 1].amount,
      amountRefunded: '0.00',
    };
    // assigning chargeType for paymentHistory-payInstalments
    // Make sure paidPayments[paidLength-1].type is an object
    if (typeof paidpayments[paidLength - 1].type !== 'object') {
      paidpayments[paidLength - 1].type = {}; // Initialize type as an empty object
    }

    paidpayments[paidLength - 1].type.Charge = chargeType;

    for (let n = 0; n < nTransactions; n++) {
      const upcomingPayment = expectedJson.UpcomingPayments;
      const shiftedData = upcomingPayment.shift();
      console.log(shiftedData);
    }

    for (let c = 0; c < expectedJson.UpcomingPayments.length; c++) {
      expectedJson.UpcomingPayments[c].instalment =
        Number(c + 1) +
        Number(expectedJson.planSummary.noOfInstallmentsPaid) +
        '/' +
        newtotalNoOfInstallments;
    }

    for (let p = 0; p < expectedJson.paidPayments.length; p++) {
      const oldInstallmentNumber =
        expectedJson.paidPayments[p].instalment.split('/');
      expectedJson.paidPayments[p].instalment =
        oldInstallmentNumber[0] + '/' + newtotalNoOfInstallments;
    }

    expectedJson.planSummary.paymentsFrom =
      expectedJson.paidPayments[expectedJson.paidPayments.length - 1].date;

    if (
      expectedJson.planSummary.totalNoOfInstallments ===
      expectedJson.planSummary.noOfInstallmentsPaid
    ) {
      expectedJson.planSummary.planStatus = 'Completed';
      expectedJson.planSummary.lastPaymentDate =
        expectedJson.paidPayments[
          expectedJson.paidPayments.length - 1
        ].actualPaidDate;
    }
    expectedConfig.UpcomingPayments = expectedJson.UpcomingPayments;
    expectedJson.UpcomingPayments = await calculation.handleRemainder();

    await fs.writeFile(
      'tests/setup/expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        merchantName +
        '/expected-values.json',

      JSON.stringify(expectedJson),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );

    await page.getByText(this.DonebuttonL).click();
  }

  async calculateTotalAmountNeedToPaid(
    nTransactions: number,
    expectedJson: any
  ) {
    let totalAmointNeedToPay = 0;
    for (let k = 0; k < nTransactions; k++) {
      totalAmointNeedToPay += Number(expectedJson.UpcomingPayments[k].amount);
    }

    totalAmointNeedToPay = await utility.upto2Decimal(
      (await Math.round((totalAmointNeedToPay + Number.EPSILON) * 100)) / 100
    );

    return totalAmointNeedToPay;
  }

  async latePaymentRetRy(
    data: any,
    planidForTest: any,
    merchantName: any
    //checkoutType: any
  ) {
    const merchantId = data.merchantDetails.merchantId;
    const planDetailPage = `${process.env.PLANPAY_NEXT_URL}/portal/merchant/${merchantId}/plan-detail/${planidForTest}`;
    await page.goto(planDetailPage);
    await utility.delay(1000);

    if (data.latePayments.length > 0) {
      // const ReceviedArray = [];
      const latePyamentInstalment = data.latePayments[0].instalment;
      const installmentNumber = latePyamentInstalment.split('/');
      console.log('Late Pyament Installment Number', installmentNumber[0]);

      await page
        .locator('#payment-installment-' + installmentNumber[0] + '-retry')
        .click();
      const retryMessage = await page.locator(this.retryMessage).innerText();

      const latePyamentAmount = data.latePayments[0].amount;
      const latePyamentDate = data.latePayments[0].date;

      const latePyamentStatus = data.latePayments[0].status;

      const latePyamentDateUI = await page
        .locator('#payment-installment-' + installmentNumber[0] + '-date')
        .first()
        .innerText();
      const latePyamentAmountUi = await page
        .locator('#payment-installment-' + installmentNumber[0] + '-amount')
        .first()
        .innerText();
      const latePyamentStatusUi = 'Overdue';

      if (retryMessage === 'Payment unsuccessful!') {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m There is late payments with invalid card =>  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );
        const titleArrayFullPaymentHistoryPaidPayments = [
          'Date',
          'Amount',
          'Stats',
          'retry Message',
        ];
        const paidAtual = [
          await utility.formatDate(latePyamentDateUI),
          await utility.convertPricewithFraction(latePyamentAmountUi),
          latePyamentStatusUi,
          retryMessage,
        ];
        const paidExpected = [
          latePyamentDate,
          latePyamentAmount,
          latePyamentStatus,
          'Payment unsuccessful!',
        ];

        await utility.matchValues(
          paidAtual,
          paidExpected,
          titleArrayFullPaymentHistoryPaidPayments,
          'Late Payment',
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Payment Successful! Updating json file =>  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );

        let finalStatus = 'Late';
        const data = await utility.commonJsonReadFunc('expectedFile');

        const noOfInstallmentsToBePaid =
          data.planSummary.noOfInstallmentsToBePaid;
        if (noOfInstallmentsToBePaid > 0) {
          finalStatus = 'On Schedule';
        } else {
          finalStatus = 'Completed';
        }
        await this.updateExpectedJsonForLateCase(finalStatus);

        await utility.delay(5000);

        await debug.getexpectedValues();
        await debug.updateExpectedJson(finalStatus);
        await console.log('Late Payment Done');

        await utility.delay(1000);

        const expectedJsonForPaid = await utility.commonJsonReadFunc(
          'expectedFile'
        );

        //const toDayDate = new Date();
        expectedJsonForPaid.paidPayments[
          expectedJsonForPaid.paidPayments.length - 1
        ].actualPaidDate = expectedJsonForPaid.planSummary.effectiveDate;
        await fs.writeFile(
          'tests/setup/expected/' +
            expectedConfig.planSummary.checkoutType +
            '/' +
            merchantName +
            '/expected-values.json',

          JSON.stringify(expectedJsonForPaid),
          (err) => {
            if (err) console.log('Error writing file:', err);
          }
        );
      }
    } else {
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m There is no late payments for this plan =>  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
  }

  // async makePyamentsPopup(
  //   nTransactions: number,
  //   screens: any,
  //   merchantName: any,
  //   expectedJson: any
  // ) {
  //   for (let k = 0; k <= nTransactions; k++) {
  //     const totalAmointNeedToPay = await this.calculateTotalAmountNeedToPaid(
  //       nTransactions,
  //       expectedJson
  //     );
  //     const paymentEligableCheck = await utility.depositCheck(
  //       totalAmointNeedToPay
  //     );
  //     if (paymentEligableCheck === true) {
  //       nTransactions = nTransactions - 1;
  //     }
  //   }
  //   console.log('nTransactions after depositCheck ', nTransactions);

  //   // Add valid card if late payment there
  //   // if(expectedJson.latePayments.length > 0)
  //   // {
  //   //   const cardStatus = 'valid';
  //   //   const paymentMethods = 'Visa';
  //   //   const planID = expectedJson.planSummary.planID;
  //   //   await this.addPaymentCard(cardStatus, paymentMethods, planID);
  //   // }

  //   const upcomingPayments = expectedJson.UpcomingPayments;

  //   let validationScreen: any = [];
  //   if (screens.includes(',')) {
  //     validationScreen = await screens.split(',');
  //   } else {
  //     validationScreen.push(screens);
  //   }

  //   const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${expectedJson.planSummary.planID}`;

  //   await page.goto(plan);
  //   await utility.delay(1000);
  //   await page.locator(this.payInstallmentButton).click();
  //   await utility.delay(1000);
  //   while ((await page.locator(this.displayMOreButton).isVisible()) == true) {
  //     await page.locator(this.displayMOreButton).click();
  //   }

  //   await utility.delay(1000);
  //   console.log(
  //     'Total Number of Upcoming Payments => ',
  //     upcomingPayments.length
  //   );
  //   for (let x = 0; x < upcomingPayments.length; x++) {
  //     let number = 0;
  //     if (expectedJson.latePayments.length > 0) {
  //       number =
  //         Number(x + expectedJson.latePayments.length + 1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     } else {
  //       number =
  //         Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     }
  //     const installmentDate = '#list_instalment_' + number;
  //     const installmentStatus = '#list_instalment_status_' + number;
  //     const installmentAmount = '#list_instalment_amount_' + number;

  //     console.log(
  //       '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Upcoming Paymnet => ',
  //       x + 1,
  //       ' \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
  //     );

  //     const titleArrayForUpcoming = ['Date', 'Status', 'Amount'];
  //     const actual = [
  //       await utility.formatDate(
  //         await page.locator(installmentDate).innerText()
  //       ),
  //       await page.locator(installmentStatus).innerText(),
  //       await utility.convertPricewithFraction(
  //         await page.locator(installmentAmount).innerText()
  //       ),
  //     ];
  //     const expected = [
  //       upcomingPayments[x].date,
  //       upcomingPayments[x].status,
  //       upcomingPayments[x].amount,
  //     ];
  //     for (let i = 0; i < (await validationScreen.length); i++) {
  //       if (
  //         config.LocalEnv.verifyFlag === 'true' &&
  //         validationScreen[i] === 'make-payment-popup'
  //       ) {
  //         await utility.matchValues(
  //           actual,
  //           expected,
  //           titleArrayForUpcoming,
  //           'make-payment-popup',
  //           expectedConfig.LocalEnv.applicationName
  //         );
  //       }
  //     }
  //   }
  //   await utility.delay(2000);
  //   if (upcomingPayments.length > 5) {
  //     while ((await page.locator(this.displayLessButton).isVisible()) == true) {
  //       await page.locator(this.displayLessButton).click();
  //     }
  //     await page.locator(this.displayMOreButton).click();
  //   }

  //   if (nTransactions > 5) {
  //     const openNumber = Number(nTransactions) + Number(1);
  //     const lastSelectedInstallment =
  //       "//span[@data-planpay-test-id='list-instalment-select-" +
  //       openNumber +
  //       "']";
  //     while (
  //       (await page.locator(lastSelectedInstallment).isVisible()) != true
  //     ) {
  //       await page.locator(this.displayMOreButton).click();
  //     }
  //   }

  //   for (let n = 0; n < nTransactions; n++) {
  //     let number = 0;
  //     if (expectedJson.latePayments.length > 0) {
  //       number =
  //         Number(n + expectedJson.latePayments.length + 1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     } else {
  //       number =
  //         Number(n + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     }
  //     const installmenSelect =
  //       "//span[@data-planpay-test-id='list-instalment-select-" + number + "']";
  //     await page.locator(installmenSelect).click();
  //   }
  //   await page.locator(this.payNextButton).click();

  //   const totalNewInstallmentAmount = await utility.convertPricewithFraction(
  //     await page.locator('#selected_total_amount').innerText()
  //   );

  //   console.log(
  //     'Total Number of Selected Installments For Payment => ',
  //     nTransactions
  //   );

  //   for (let x = 0; x < nTransactions; x++) {
  //     let number = 0;
  //     if (expectedJson.latePayments.length > 0) {
  //       number =
  //         Number(x + expectedJson.latePayments.length + 1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     } else {
  //       number =
  //         Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     }
  //     const installmentDate = '#list_instalment_' + number;
  //     const installmentStatus = '#list_instalment_status_' + number;
  //     const installmentAmount = '#list_instalment_amount_' + number;
  //     const totalAmointUpcoming = await this.calculateTotalAmountNeedToPaid(
  //       nTransactions,
  //       expectedJson
  //     );

  //     const titleArrayForUpcoming = [
  //       'Date',
  //       'Status',
  //       'Amount',
  //       'Total Amount',
  //     ];
  //     const actual = [
  //       await utility.formatDate(
  //         await page.locator(installmentDate).innerText()
  //       ),
  //       await page.locator(installmentStatus).innerText(),
  //       await utility.convertPricewithFraction(
  //         await page.locator(installmentAmount).innerText()
  //       ),
  //       await utility.upto2Decimal(totalNewInstallmentAmount),
  //     ];

  //     const expected = [
  //       upcomingPayments[x].date,
  //       upcomingPayments[x].status,
  //       upcomingPayments[x].amount,
  //       await utility.upto2Decimal(totalAmointUpcoming),
  //     ];

  //     for (let i = 0; i < (await validationScreen.length); i++) {
  //       if (
  //         config.LocalEnv.verifyFlag === 'true' &&
  //         validationScreen[i] === 'make-payment-review'
  //       ) {
  //         await utility.matchValues(
  //           actual,
  //           expected,
  //           titleArrayForUpcoming,
  //           'make-payment-review',
  //           expectedConfig.LocalEnv.applicationName
  //         );
  //       }
  //     }

  //     console.log(
  //       '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Start Pay n installments  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
  //     );
  //   }

  //   await page.locator(this.payButton).click();

  //   console.log(
  //     '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Verify payments made and the next instalment   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
  //   );
  //   await utility.delay(1000);

  //   for (let x = 0; x < nTransactions; x++) {
  //     let number = 0;
  //     if (expectedJson.latePayments.length > 0) {
  //       number =
  //         Number(x + expectedJson.latePayments.length + 1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     } else {
  //       number =
  //         Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     }
  //     const installmentDate = '#list_instalment_' + number;
  //     const installmentStatus = '#list_instalment_status_' + number;
  //     const installmentAmount = '#list_instalment_amount_' + number;
  //     const totalAmointUpcoming = await this.calculateTotalAmountNeedToPaid(
  //       nTransactions,
  //       expectedJson
  //     );

  //     const titleArrayForUpcoming = [
  //       'Date',
  //       'Status',
  //       'Amount',
  //       'Total Amount',
  //     ];
  //     const actual = [
  //       await utility.formatDate(
  //         await page.locator(installmentDate).innerText()
  //       ),
  //       await page.locator(installmentStatus).innerText(),
  //       await utility.convertPricewithFraction(
  //         await page.locator(installmentAmount).innerText()
  //       ),
  //       await utility.upto2Decimal(totalNewInstallmentAmount),
  //     ];

  //     const expected = [
  //       upcomingPayments[x].date,
  //       upcomingPayments[x].status,
  //       upcomingPayments[x].amount,
  //       await utility.upto2Decimal(totalAmointUpcoming),
  //     ];

  //     for (let i = 0; i < (await validationScreen.length); i++) {
  //       if (
  //         config.LocalEnv.verifyFlag === 'true' &&
  //         validationScreen[i] === 'payment-completed'
  //       ) {
  //         await utility.matchValues(
  //           actual,
  //           expected,
  //           titleArrayForUpcoming,
  //           'Verify Payments',
  //           expectedConfig.LocalEnv.applicationName
  //         );
  //       }
  //     }
  //   }

  //   // console.log(
  //   //   '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Updateing expectedJson with   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% ');

  //   const newnumberOfInstalment =
  //     expectedJson.planSummary.numberOfInstalment - nTransactions;
  //   const newnoOfInstallmentsPaid =
  //     Number(expectedJson.planSummary.noOfInstallmentsPaid) + Number(1);
  //   const newtotalNoOfInstallments =
  //     Number(newnumberOfInstalment) + Number(newnoOfInstallmentsPaid);
  //   const newTotalFound =
  //     Number(totalNewInstallmentAmount) +
  //     Number(expectedJson.planSummary.totalFunds);
  //   const newRemainingAmount =
  //     expectedJson.planSummary.totalCost - newTotalFound;

  //   expectedJson.planSummary.numberOfInstalment = String(newnumberOfInstalment);
  //   expectedJson.planSummary.noOfInstallmentsToBePaid = String(
  //     newnumberOfInstalment
  //   );
  //   expectedJson.planSummary.noOfInstallmentsPaid = String(
  //     newnoOfInstallmentsPaid
  //   );
  //   expectedJson.planSummary.totalNoOfInstallments = String(
  //     newtotalNoOfInstallments
  //   );
  //   expectedJson.planSummary.totalFunds = String(
  //     await utility.upto2Decimal(newTotalFound)
  //   );
  //   expectedJson.planSummary.remainingAmount = String(
  //     await utility.upto2Decimal(newRemainingAmount)
  //   );

  //   const toDayDate = new Date();

  //   let instalmentPaid = '0';
  //   if (expectedJson.latePayments.length > 0) {
  //     instalmentPaid =
  //       Number(expectedJson.latePayments.length + newnoOfInstallmentsPaid) +
  //       '/' +
  //       newtotalNoOfInstallments;
  //   } else {
  //     instalmentPaid = newnoOfInstallmentsPaid + '/' + newtotalNoOfInstallments;
  //   }

  //   const payments = {
  //     amount: totalNewInstallmentAmount,
  //     date: expectedJson.UpcomingPayments[nTransactions - 1].date,
  //     actualPaidDate: await utility.formatDate(toDayDate),
  //     instalment: instalmentPaid,
  //     paymentMethodUsed: expectedJson.planSummary.paymentMethod,
  //     status: 'Paid',
  //     paymentType: 'ADVANCE',
  //     remainder: expectedJson.UpcomingPayments[nTransactions - 1].remainder,
  //   };
  //   const paidpayments = expectedJson.paidPayments;
  //   await paidpayments.push(payments);

  //   for (let n = 0; n < nTransactions; n++) {
  //     const upcomingPayment = expectedJson.UpcomingPayments;
  //     const shiftedData = upcomingPayment.shift();
  //     expectedJson.planSummary.paymentsFrom = shiftedData.date;
  //   }

  //   for (let c = 0; c < expectedJson.UpcomingPayments.length; c++) {
  //     if (expectedJson.latePayments.length > 0) {
  //       expectedJson.UpcomingPayments[c].instalment =
  //         Number(expectedJson.latePayments.length) +
  //         Number(c + 1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid) +
  //         '/' +
  //         newtotalNoOfInstallments;
  //     } else {
  //       {
  //         expectedJson.UpcomingPayments[c].instalment =
  //           Number(c + 1) +
  //           Number(expectedJson.planSummary.noOfInstallmentsPaid) +
  //           '/' +
  //           newtotalNoOfInstallments;
  //       }
  //     }
  //   }

  //   for (let p = 0; p < expectedJson.paidPayments.length; p++) {
  //     const oldInstallmentNumber =
  //       expectedJson.paidPayments[p].instalment.split('/');
  //     expectedJson.paidPayments[p].instalment =
  //       oldInstallmentNumber[0] + '/' + newtotalNoOfInstallments;
  //   }
  //   if (expectedJson.latePayments.length > 0) {
  //     for (let k = 0; k < expectedJson.latePayments.length; k++) {
  //       const oldInstallmentNumberLate =
  //         expectedJson.latePayments[k].instalment.split('/');
  //       expectedJson.latePayments[k].instalment =
  //         oldInstallmentNumberLate[0] + '/' + newtotalNoOfInstallments;
  //     }
  //   }

  //   //expectedJson.planSummary.paymentsFrom = expectedJson.paidPayments[expectedJson.paidPayments.length-1].date;

  //   if (
  //     expectedJson.planSummary.totalNoOfInstallments ===
  //       expectedJson.planSummary.noOfInstallmentsPaid &&
  //     expectedJson.latePayments.length === 0
  //   ) {
  //     expectedJson.planSummary.planStatus = 'Completed';
  //     const planComplateDate = new Date();
  //     expectedJson.planSummary.completionDate = await utility.formatDate(
  //       planComplateDate
  //     );
  //   }

  //   await fs.writeFile(
  //     'tests/setup/expected/' +
  //       expectedConfig.planSummary.checkoutType +
  //       '/' +
  //       merchantName +
  //       '/expected-values.json',

  //     JSON.stringify(expectedJson),
  //     (err) => {
  //       if (err) console.log('Error writing file:', err);
  //     }
  //   );

  //   await utility.delay(2000);

  //   if (upcomingPayments.length != 0) {
  //     console.log(
  //       '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Verify next instalment   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
  //     );

  //     let number = 0;
  //     if (expectedJson.latePayments.length > 0) {
  //       number =
  //         Number(1) +
  //         Number(expectedJson.planSummary.noOfInstallmentsPaid) +
  //         Number(expectedJson.latePayments.length);
  //     } else {
  //       number =
  //         Number(1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
  //     }

  //     const installmentDate = await page
  //       .locator('#next_instalment_date')
  //       .innerText();
  //     const installmentStatus = '#list_instalment_status_' + number;
  //     const installmentAmount = '#list_instalment_amount_' + number;

  //     const titleArrayForUpcoming = ['Date', 'Status', 'Amount'];
  //     const actual = [
  //       await utility.formatDate(installmentDate),
  //       await page.locator(installmentStatus).innerText(),
  //       await utility.convertPricewithFraction(
  //         await page.locator(installmentAmount).innerText()
  //       ),
  //     ];

  //     const expected = [
  //       upcomingPayments[0].date,
  //       upcomingPayments[0].status,
  //       upcomingPayments[0].amount,
  //     ];

  //     for (let i = 0; i < (await validationScreen.length); i++) {
  //       if (
  //         config.LocalEnv.verifyFlag === 'true' &&
  //         validationScreen[i] === 'payment-completed'
  //       ) {
  //         await utility.matchValues(
  //           actual,
  //           expected,
  //           titleArrayForUpcoming,
  //           'Next Instalment',
  //           expectedConfig.LocalEnv.applicationName
  //         );
  //       }
  //     }
  //   } else {
  //     console.log(
  //       '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m There is no upcoming payments    \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
  //     );
  //   }

  //   await page.locator(this.doneButton).click();
  // }

  async makePyamentsPopupLate(
    nTransactions: number,
    screens: any,
    merchantName: any,
    expectedJson: any
  ) {
    const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${expectedJson.planSummary.planID}`;
    await page.goto(plan);
    nTransactions = 1;
    await utility.delay(1000);
    await page.locator(this.payInstallmentButton).click();
    await utility.delay(2000);
    await page.locator(this.payNextButton).click();
    const totalNewInstallmentAmount = await utility.convertPricewithFraction(
      await page.locator('#selected_total_amount').innerText()
    );
    console.log(
      'Total Number of Selected Installments For Payment => ',
      nTransactions
    );

    for (let x = 0; x < nTransactions; x++) {
      const number =
        Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
      const installmentDate = '#list_instalment_' + number;
      const installmentStatus = '#list_instalment_status_' + number;
      const installmentAmount = '#list_instalment_amount_' + number;
      const totalAmointUpcoming = await this.calculateTotalAmountNeedToPaid(
        nTransactions,
        expectedJson
      );

      const titleArrayForUpcoming = [
        'Date',
        'Status',
        'Amount',
        'Total Amount',
      ];
      const actual = [
        await utility.formatDate(
          await page.locator(installmentDate).innerText()
        ),
        await page.locator(installmentStatus).innerText(),
        await utility.convertPricewithFraction(
          await page.locator(installmentAmount).innerText()
        ),
        await utility.upto2Decimal(totalNewInstallmentAmount),
      ];

      const expected = [
        expectedJson.latePayments[x].date,
        expectedJson.latePayments[x].status,
        expectedJson.latePayments[x].amount,
        await utility.upto2Decimal(totalAmointUpcoming),
      ];

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArrayForUpcoming,
          'make-payment-review',
          expectedConfig.LocalEnv.applicationName
        );
      }

      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Start Pay n installments  \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
      );
    }

    await page.locator(this.payButton).click();
    console.log(
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Updateing expectedJson with   \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
    );
    const expectedJsonForLatePayment = expectedJson;
    expectedJsonForLatePayment.latePayments[0].paymentType = 'ADVANCE';
    expectedJsonForLatePayment.flags.latePayment = 'true';
    await fs.writeFile(
      'tests/setup/expected/' +
        expectedJsonForLatePayment.planSummary.checkoutType +
        '/' +
        merchantName +
        '/expected-values.json',

      JSON.stringify(expectedJsonForLatePayment),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );

    let finalStatus = 'Late';
    const data = await utility.commonJsonReadFunc('expectedFile');

    const noOfInstallmentsToBePaid = data.planSummary.noOfInstallmentsToBePaid;
    if (noOfInstallmentsToBePaid > 0) {
      finalStatus = 'On Schedule';
    } else {
      finalStatus = 'Completed';
    }
    await this.updateExpectedJsonForLateCase(finalStatus);

    await utility.delay(5000);

    await debug.getexpectedValues();
    await debug.updateExpectedJson('On Schedule');
    await console.log('Late Payment Done');

    await utility.delay(1000);

    const expectedJsonForPaid = await utility.commonJsonReadFunc(
      'expectedFile'
    );

    const toDayDate = new Date();
    expectedJsonForPaid.paidPayments[
      expectedJsonForPaid.paidPayments.length - 1
    ].actualPaidDate = await utility.formatDate(toDayDate);
    await fs.writeFile(
      'tests/setup/expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        merchantName +
        '/expected-values.json',

      JSON.stringify(expectedJsonForPaid),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );

    await page.locator(this.doneButton).click();
  }

  async addPaymentCard(cardStatus: any, paymentMethods: any, planID: any) {
    const merchantCheckArr: any = [];
    if (planID == 'All') {
      // await utility.delay(3000);
      await page.waitForSelector(this.customerAllOrder);
      const allOrderSec = await page.locator(this.customerAllOrder);
      const itemCount = await allOrderSec.count();
      for (let i = 0; i < itemCount; i++) {
        const orderData = await allOrderSec.nth(i).innerText();
        const separatedSummary = await utility.splitData(orderData);
        await page.waitForSelector(this.viewOrderL);
        await page.locator(this.viewOrderL).nth(i).click();
        console.log(`Inside ${i} Plan`);
        if (merchantCheckArr.includes(separatedSummary[0])) {
          console.log('ALREADY EXIST');
        } else {
          await this.formFill(cardStatus, paymentMethods);
        }
        await page.waitForSelector(this.backButtonL);
        await page.locator(this.backButtonL).first().click();
        merchantCheckArr.push(separatedSummary[0]);
        console.log('Same Merchant Array', merchantCheckArr);
      }
    } else {
      // await page.waitForSelector(this.allOrdersSection);
      // const allOrderSec = await page.locator(this.allOrdersSection);
      // const itemCount = await allOrderSec.count();
      // const data = await utility.readExpectedValue();
      const data = await utility.commonJsonReadFunc('expectedFile');
      const planId = data.planSummary.planID;
      const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${planId}`;
      await page.goto(plan);
      await this.formFill(cardStatus, paymentMethods);
    }
  }

  async updateExpectedJsonForLateCase(finalStatus: any) {
    const data = await utility.commonJsonReadFunc('expectedFile');

    const upcomingPayment = data.UpcomingPayments;
    await upcomingPayment.unshift(data.latePayments[0]);
    const latePayments = data.latePayments;
    latePayments.shift();
    data.latePayments = latePayments;

    data.planSummary.planStatus = finalStatus;
    data.flags.latePayment = 'false';
    await fs.writeFile(
      'tests/setup/expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        expectedConfig.merchantDetails.merchantName +
        '/expected-values.json',
      JSON.stringify(data),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );
  }

  async processLate(count: any) {
    console.log('INSIDE LATE PROCESS');
    // await page.locator('text=Pay $12.5').click();
    // await utility.delay(2000);
    await page.waitForSelector(`#late_payment_button_${count + 1}`);
    await page.locator(`#late_payment_button_${count + 1}`).click();
    await utility.delay(1000);
    await page.locator(this.confirmButtonL).click();
    await utility.delay(2000);
    // await expect(page.locator(this.paymentSuccessfull)).toHaveText(
    //   'Payment unsuccessful!'
    // );
    // await page.getByText(this.DonebuttonL).click();
    let finalStatus = 'Late';
    const data = await utility.commonJsonReadFunc('expectedFile');

    const noOfInstallmentsToBePaid = data.planSummary.noOfInstallmentsToBePaid;
    if (noOfInstallmentsToBePaid > 0) {
      finalStatus = 'On Schedule';
    } else {
      finalStatus = 'Completed';
    }
    await this.updateExpectedJsonForLateCase(finalStatus);

    await utility.delay(5000);

    await debug.getexpectedValues();
    await debug.updateExpectedJson('On Schedule');
    await console.log('Closed');
  }

  async verifyPaymentCard(card: any) {
    await utility.delay(2000);
    const ExpectedCardLastFourDigit = [];
    const ActualcreditCardLast4Digit = [];
    const FieldName = [];
    FieldName.push('Verify Payment Method');
    const actual = await page.locator(this.cardDigits).innerText();
    ActualcreditCardLast4Digit.push(actual);
    ExpectedCardLastFourDigit[0] = await config.testCards[
      expectedConfig.planSummary.paymentPlatform_vendor
    ].valid[card].cardnumber
      .toString()
      .slice(-4);
    await utility.matchValues(
      ActualcreditCardLast4Digit,
      ExpectedCardLastFourDigit,
      FieldName,
      'Checkout Summary',
      'Merchant Testing'
    );
  }

  async tabDetails(screenName: any, tabName: any) {
    const myScreensList = await utility.convertStringtoArray(screenName);
    const tabList = await utility.convertStringtoArray(tabName);
    console.log('Verifing: ' + tabList + '....');
    for (let i = 0; i < tabList.length; i++) {
      switch (tabList[i]) {
        case 'Upcoming-Payments':
          if (expectedConfig.planSummary.planStatus == 'On schedule') {
            console.log('========== In upcoming payments ===========');
            await this.verifyOrderScreens(myScreensList); //Visit Plan details page and verify the order.
          }
          break;
        case 'All orders':
          console.log('====== In All orders ===========');
          // await this.getAllOrdersCounts();
          // console.log('After all orders');
          await this.verifyOrderScreens(myScreensList);
          break;
      }
    }
  }
  async getAllOrdersCounts() {
    // await page.click(this.allOrdersL);
    // await page.waitForSelector(this.allOrdersSection);
    // return await page.locator(this.allOrdersSection).count();
  }
  async verifyOrderScreens(screenName: any) {
    console.log('In verifyOrderScreen function');
    await utility.delay(5000);
    let itemsCount;
    let allOrderSec;
    if (expectedConfig.planSummary.planStatus == 'Cancelled') {
      console.log('Cancelled plan');
      await page.click(this.allOrdersL);
      // await page.locator(this.allOrdersSection).first().click();
    } else if (expectedConfig.planSummary.planStatus == 'Completed') {
      console.log('Completed plan');
      await page.click(this.allOrdersL);
      // await page.locator(this.allOrdersSection).first().click();
    } else {
      console.log('On Scedule plan');
      console.log('screenName', screenName);
      if (await screenName.includes('Upcoming-Payments')) {
        // await page.click(this.upOrdersSection).first().click();
        await page.waitForSelector(this.upOrdersSection);
        allOrderSec = await page.locator(this.upOrdersSection);
        itemsCount = await allOrderSec.count();
      }
      if (await screenName.includes('All orders')) {
        await page.click(this.allOrdersL);
        // await page.locator(this.allOrdersSection).first().click();
        await page.waitForSelector(this.allOrdersSection);
        allOrderSec = await page.locator(this.allOrdersSection);
        itemsCount = await allOrderSec.count();
      }
    }
    if (expectedConfig.planSummary.planStatus == 'On Schedule') {
      await page.waitForSelector(this.upOrdersSection);
      allOrderSec = await page.locator(this.upOrdersSection);
    } else {
      await page.waitForSelector(this.allOrdersSection);
      allOrderSec = await page.locator(this.allOrdersSection);
    }
    itemsCount = await allOrderSec.count();
    if (itemsCount > 0) {
      //If listing is found then we will execute these line of code.
      for (let i = 0; i < itemsCount; i++) {
        if (config.LocalEnv.verifyFlag == 'true' && i > 0) {
          console.log('verifying only one');
          break;
        }
        // this.orderItem = await allOrderSec.nth(i).locator(this.orderItemsLocator);
        this.orderItem = await allOrderSec.nth(i);
        this.viewOrderLocator = await page.locator(this.viewOrderL).nth(i);
        if (config.LocalEnv.verifyFlag == 'true') {
          //picking the last element of list
          console.log('========= finding newly placed order ===========');
          // this.orderItem = await allOrderSec.nth(itemCount - 1).locator(this.orderItemsLocator);
          // this.orderItem = await allOrderSec.nth(itemCount - 1);
          this.orderItem = await page.locator(
            "//div[@id='" + expectedConfig.planSummary.planID + "']"
          );
          console.log(
            'expectedConfig.planSummary.planID',
            expectedConfig.planSummary.planID
          );
          this.viewOrderLocator = await page.locator(
            "//div[@id='" + expectedConfig.planSummary.planID + "']"
          );
        }
        for (let j = 0; j < (await screenName.length); ++j) {
          console.log(
            '=====================' +
              screenName[j] +
              '============================='
          );
          console.log(
            '=====================' +
              screenName[j] +
              '============================='
          );
          if (screenName[j] === 'Summary') {
            await orderSummary.orderSummary(this.orderItem);
          } else {
            await orderDetails.orderDetails(this.viewOrderLocator);
            await page.waitForSelector(this.backButtonL);
            await page.click(this.backButtonL);
          }
        }
      }
    } else {
      //If listing records not found this line of code will be executed.
      console.log(this.noRecordsFound());
      await expect(itemsCount).toBeGreaterThan(0);
    }
  }
  async noRecordsFound() {
    return 'no records found';
  }

  async skipPyamentsPopup(
    planID: any,
    nTransactions: number,
    screens: any,
    merchantName: any
  ) {
    console.log('planid ', planID);
    expectedConfig.merchantDetails.merchantName = merchantName;

    let expectedJson;
    // let upcomingPayments;
    let skipCheck;
    let installmentAmountCheck;
    const expectedUpcoming = await utility.commonJsonReadFunc('expectedFile');
    console.log('paid installments', expectedUpcoming.paidPayments);
    const upcomingPayments = expectedUpcoming.UpcomingPayments;

    if (
      expectedUpcoming.planSummary.planStatus == 'Completed' &&
      expectedUpcoming.UpcomingPayments.length == 0
    ) {
      console.log(
        '\x1b[33m UNABLE TO PROCESS SKIP INSTALLMENT PLAN IS ALREADY COMPLETED \x1b[37m'
      );
    } else {
      if (nTransactions > upcomingPayments.length - 1) {
        console.log('nTransactions = ', nTransactions);
        console.log('upcomingPayments = ', upcomingPayments.length);
        console.log('\x1b[35m  nTransactions is greater then upcoming\x1b[35m');
        nTransactions = upcomingPayments.length - 1;
      }
      console.log('the final set transaction => ', nTransactions);
      do {
        expectedJson = await utility.commonJsonReadFunc('expectedFile');
        expectedConfig.UpcomingPayments = expectedJson.UpcomingPayments;
        expectedConfig.planSummary = expectedJson.planSummary;
        expectedConfig.paidPayments = expectedJson.paidPayments;

        expectedConfig.skippedInstallment = [];
        // expectedConfig.paidPayments=[];

        console.log(
          'Checking the possibility to skip ',
          nTransactions,
          ' installments'
        );
        await calculation.skipInstalments(nTransactions);
        console.log(
          'skippedAmount =>',
          expectedConfig.planSummary.skippedAmount
        );
        skipCheck = await utility.depositCheck(
          expectedConfig.planSummary.skippedAmount
        );
        //checking the new calculated installment amount
        installmentAmountCheck = await utility.depositCheck(
          expectedConfig.planSummary.installmentAmount
        );
        if (installmentAmountCheck == true) {
          console.log(
            'Installment Amount =',
            expectedConfig.planSummary.installmentAmount
          );
          console.log(
            '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m INSTALLMENT AMOUNT IS GREATER THEN RULE, CAN NOT SKIP INSTALLMENT \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
          );
          console.log('EXITING ......');
        }
        if (skipCheck == true) {
          nTransactions = nTransactions - 1;
        }
      } while (skipCheck != false);

      let validationScreen: any = [];
      if (screens.includes(',')) {
        validationScreen = await screens.split(',');
      } else {
        validationScreen.push(screens);
      }

      const plan = `${process.env.PLANPAY_NEXT_URL}/portal/plan/${planID}`;
      await page.goto(plan);
      await utility.delay(2000);
      if (
        (await page.locator(this.skipInstallmentButton).isVisible()) == false
      ) {
        console.log('SKIP INSTALLMENT IS NOT AVAILABLE');
        process.exit(0);
        // await expect('fail').toEqual('pass');
      }
      await page.locator(this.skipInstallmentButton).click();
      await utility.delay(1000);
      while ((await page.locator(this.displayMOreButton).isVisible()) == true) {
        await page.locator(this.displayMOreButton).click();
      }

      for (let n = 0; n < nTransactions; n++) {
        const number =
          Number(n + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
        const installmenSelect =
          "//span[@data-planpay-test-id='list-instalment-select-" +
          number +
          "']";
        await page.locator(installmenSelect).click();
      }
      console.log(
        'Total Number of Upcoming Payments => ',
        upcomingPayments.length
      );
      console.log('Upcoming Payments => ', upcomingPayments);

      for (let x = 0; x < upcomingPayments.length - 1; x++) {
        const number =
          Number(x + 1) + Number(expectedJson.planSummary.noOfInstallmentsPaid);
        const installmentDate = '#list_instalment_' + number;
        const installmentStatus = '#list_instalment_status_' + number;
        const installmentAmount = '#list_instalment_amount_' + number;

        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Upcoming Paymnet => ',
          x + 1,
          ' \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );

        const titleArrayForUpcoming = ['Date', 'Status', 'Amount'];
        const actual = [
          await utility.formatDate(
            await page.locator(installmentDate).innerText()
          ),
          await page.locator(installmentStatus).innerText(),
          await utility.convertPricewithFraction(
            await page.locator(installmentAmount).innerText()
          ),
        ];
        const expected = [
          upcomingPayments[x].date,
          upcomingPayments[x].status,
          upcomingPayments[x].amount,
        ];
        // for (let i = 0; i < (await validationScreen.length); i++) {
        if (
          config.LocalEnv.verifyFlag === 'true' &&
          validationScreen.includes('skip_instalments_popup')
        ) {
          await utility.matchValues(
            actual,
            expected,
            titleArrayForUpcoming,
            'skip_instalments_popup',
            expectedConfig.LocalEnv.applicationName
          );
          // }
        }
      }

      // await calculation.skipInstalments(nTransactions);
      // console.log('New Installment Amount Calculated ', expectedConfig.planSummary.skippedAmount );
      const totalNewInstallmentAmount = await utility.convertPricewithFraction(
        await page.locator('#selected_total_amount').innerText()
      );
      // console.log('New Installment Amount from UI ',totalNewInstallmentAmount );
      if (
        config.LocalEnv.verifyFlag === 'true' &&
        validationScreen.includes('skip_instalments_popup')
      ) {
        await utility.matchValues(
          totalNewInstallmentAmount,
          await utility.upto2Decimal(expectedConfig.planSummary.skippedAmount),
          'Skipped Amount',
          'skip_instalments_popup',
          expectedConfig.LocalEnv.applicationName
        );
      }
      await page.locator(this.payNextButton).click();
      utility.delay(1000);
      const expectedBefore = await utility.commonJsonReadFunc('expectedFile');
      const expecctedAfter = expectedConfig;
      const actualBeforeAfter = [];
      actualBeforeAfter[0] = await page
        .locator('#before_installment_left')
        .innerText();
      actualBeforeAfter[1] = await page
        .locator('#after_installment_left')
        .innerText();
      actualBeforeAfter[2] = await utility.convertPricewithFraction(
        await page.locator('#before_installment_amount').innerText()
      );
      actualBeforeAfter[3] = await utility.convertPricewithFraction(
        await page.locator('#after_installment_amount').innerText()
      );
      actualBeforeAfter[4] = await utility.formatDate(
        await page.locator('#before_next_installment').innerText()
      );
      actualBeforeAfter[5] = await utility.formatDate(
        await page.locator('#after_next_installment').innerText()
      );
      actualBeforeAfter[6] = await utility.formatDate(
        await page.locator('#before_last_installment').innerText()
      );
      actualBeforeAfter[7] = await utility.formatDate(
        await page.locator('#after_last_installment').innerText()
      );

      console.log('actual before after ', actualBeforeAfter);

      const titleArray = [
        'Installments Left Before',
        'Installments Left After',
        'Installment Amount Before',
        'Installment Amount After',
        'Installment Date Before',
        'Installment Date After',
        'Last Installment Before',
        'Last Installment After',
      ];
      const expected = [
        expectedBefore.planSummary.numberOfInstalment,
        expecctedAfter.planSummary.numberOfInstalment,
        expectedBefore.planSummary.installmentAmount,
        expecctedAfter.planSummary.installmentAmount,
        expectedBefore.UpcomingPayments[0].date,
        expecctedAfter.UpcomingPayments[0].date,
        expectedBefore.UpcomingPayments[
          expectedBefore.UpcomingPayments.length - 1
        ].date,
        expecctedAfter.UpcomingPayments[
          expecctedAfter.UpcomingPayments.length - 1
        ].date,
      ];
      for (let i = 0; i < expected.length; i++) {
        console.log(titleArray[i], ' => ', expected[i]);
      }
      if (
        config.LocalEnv.verifyFlag === 'true' &&
        validationScreen.includes('skip_instalments_review')
      ) {
        await utility.matchValues(
          actualBeforeAfter,
          expected,
          titleArray,
          'skip_instalments_review',
          expectedConfig.LocalEnv.applicationName
        );
      }
      console.log('expectedConfig => ', expectedConfig);

      await page.locator(this.confirmButton).click();
      await utility.delay(2000);

      const expectedRecap = [];
      const actualRecap = [];
      const titleArrayRecap = ['Skipped Amount'];
      expectedRecap[0] = await utility.upto2Decimal(
        expectedConfig.planSummary.skippedAmount
      );
      actualRecap[0] = await utility.convertPricewithFraction(
        await page.locator('#skipped_amount').innerText()
      );

      let x = 1;
      console.log(
        'expectedConfig.skippedInstallment.length',
        expectedConfig.skippedInstallment.length
      );
      for (let i = 0; i < expectedConfig.skippedInstallment.length; i++) {
        expectedRecap[x] = expectedConfig.skippedInstallment[i].date;
        expectedRecap[x + 1] = expectedConfig.skippedInstallment[i].amount;

        //actual from UI
        actualRecap[x] = await utility.formatDate(
          await page.locator('#installment_date_' + i).innerText()
        );
        actualRecap[x + 1] = await utility.convertPricewithFraction(
          await page.locator('#installment_amount_' + i).innerText()
        );

        titleArrayRecap[x] = 'Skipped Date - ' + i;
        titleArrayRecap[x + 1] = 'Skipped Amount - ' + i;
        x = x + 2;
      }

      titleArrayRecap[x] = 'Next installment date';
      titleArrayRecap[x + 1] = 'Upcoming installment date';
      titleArrayRecap[x + 2] = 'Upcoming installment status';
      titleArrayRecap[x + 3] = 'Upcoming installment amount';

      expectedRecap[x] = expectedConfig.UpcomingPayments[0].date;
      expectedRecap[x + 1] = expectedConfig.UpcomingPayments[0].date;
      expectedRecap[x + 2] = expectedConfig.UpcomingPayments[0].status;
      expectedRecap[x + 3] = expectedConfig.UpcomingPayments[0].amount;

      console.log('expectedRecap ', expectedRecap);

      actualRecap[x] = await utility.formatDate(
        await page.locator('#next_installment_date').innerText()
      );
      actualRecap[x + 1] = await utility.formatDate(
        await page.locator('#installment_date').innerText()
      );
      actualRecap[x + 2] = await page
        .locator('#installment_status')
        .innerText();
      actualRecap[x + 3] = await utility.convertPricewithFraction(
        await page.locator('#installment_amount').innerText()
      );

      console.log('actualRecap ', actualRecap);

      if (
        config.LocalEnv.verifyFlag === 'true' &&
        validationScreen.includes('skip_instalments_recap')
      ) {
        await utility.matchValues(
          actualRecap,
          expectedRecap,
          titleArrayRecap,
          'skip_instalments_recap',
          expectedConfig.LocalEnv.applicationName
        );
      }

      expectedConfig.skippedInstallment.splice(
        0,
        expectedConfig.skippedInstallment.length
      );

      const serviceFee = await calculation.calculateServiceFee(
        'exclusive',
        'planTotal'
      );
      expectedConfig.fees.TotalServiceFeesExcGST = String(serviceFee);
      console.log(
        ' expectedConfig.planSummary.totalNoOfInstallments',
        expectedConfig.planSummary.totalNoOfInstallments
      );
      expectedConfig.paidPayments[0].instalment =
        '1/' + expectedConfig.planSummary.totalNoOfInstallments;
      console.log('expectedConfig Final=> ', expectedConfig);

      await utility.writeIntoJsonFile(
        'expected-values',
        expectedConfig,
        'expected/' +
          expectedConfig.planSummary.checkoutType +
          '/' +
          merchantName
      );

      await page.locator(this.doneButton).click();
    }
  }
}
