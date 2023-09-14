import { expect } from '@playwright/test';
import { page } from '../../features/support/hooks';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { Utilities } from '../utilities';
// import { ConsoleLogger } from '@nestjs/common';
import { PlanCancellationCalculation } from '../merchant-checkout/plan-cancellation-calculation';
// import { verify } from 'crypto';
import { PlanCancellation } from './plan-cancellation';
import { calculations } from '../merchant-checkout/calculations';
//import { empty } from '@prisma/client/runtime';
const calculation = new calculations();

const utility = new Utilities();
const plan_cancellation_calculation = new PlanCancellationCalculation();
const plan_cancellation = new PlanCancellation();

export class OrderPage {
  static callSource: any = 0;
  rowData = [];
  searchField = '#search-input';
  orderValue_detail = '#order-id';
  orderStatusValue_detail = '#order-status';
  merchantOrderId_detail = '#merchant-id';
  customerName_detail = "div[class='MuiBox-root css-5mgwgc'] p:nth-child(1)";
  customerDate_detail = '#order_date';
  backBtn = "//span[@class='css-0']";
  orderAmount_detail = '#order-total';
  settlementStatus = '#settlement_status';
  fullpaymentBtn = '#fullpayment';
  Settlmentdetail_box =
    "//body/div[@id='root']/div[contains(@class,'css-1pi70b')]/div[@class='MuiGrid-root MuiGrid-container layout-content-container css-1d3bbye']/div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-md-9 css-1xd5sck']/div[@class='MuiBox-root css-1t1xv2g']/div[@class='MuiGrid-root MuiGrid-container css-9esoet']/div[2]";
  settlmentTitlebox = "//span[@id='settlement_details']";
  paymentDateandTimeL = "//p[@id='payment_date/time']";
  lastAmountL = "//p[@id='last_amount']//div[@class='MuiBox-root css-k008qs']";
  transactionIdL = "//p[@id='transactionId']";
  settlmentAmountbox = '#settlement_values';
  cancellationDetails = '#cancellation_details_values';
  logoutLink = "//a[@class='logout-button MuiBox-root css-0']";
  paymentDateandTimeL = "//p[@id='payment_date/time']";
  lastAmountL = "//p[@id='last_amount']//div[@class='MuiBox-root css-k008qs']";
  transactionIdL = "//p[@id='transactionId']";
  totalOrderL = '#order-total';
  payMethodL = '#payment_method';
  // productSummaryL =
  //   "//div[@class='MuiGrid-root MuiGrid-container css-1nkqqu4']";
  productSummaryL =
    "//div[@class='MuiGrid-root MuiGrid-container css-1nkqqu4']";
  // customerInformationL = "//div[@id='id=customer_infomation']";
  customerInformationL = '#customer_infomation';
  customerName = '#customer-name';
  customerEmailAddress = '#customer-email-address';
  customerPhoneNumber = '#customer-phone-number';
  planStatus = '#plan-status';
  planTotal = '#plan-total';
  planAmountPaid = '#plan-amount-paid';
  planAmountRemaining = '#plan-amount-remaining';
  planFrequency = '#plan-frequency';
  planInstallmentsRemaining = '#plan-installments-remaining';
  planInstallmentAmount = '#plan-installment-amount';
  planLastInstallment = '#plan-last-installment';
  planCompletionDate = '#plan-completion-date';
  planId = '#plan-id';
  planCreatedDate = '#plan-created-date';
  planCardNumber = '#plan-card-number';
  planNumOfInstallments = '#plan-num-of-installments';

  merchantOrderId = '#merchant-order-id';

  // prod_details =
  //   "//div[contains(@class, 'MuiGrid-root MuiGrid-container css-1cprn54')]/descendant::div";

  plan_refund_amount = '#plan-refund-amount';
  plan_cancellation_date = '#plan-cancellation-date';

  prod_details = "//div[@class='MuiGrid-root MuiGrid-container css-1nkqqu4']";
  Payment_history_details =
    "//span[@class='MuiTypography-root MuiTypography-overline css-q4mv38']";

  orderStatusL = '#order-status';
  orderSettlementStatusL = '#settlement_status';
  redemptionDate = '#redemption-date';
  bookingDescription = '#booking-description';
  accountCreated = '#customer-account-created';
  userStatus = '#customer-status';
  // prod_label = [" Product Quantity " , " Product Lable " , " Product Amount"]

  async printDetailsNew() {
    //const expected = await utility.callExpectedJson();
    // await this.VerifybasicDetails();
    // await this.VerifyOrderDetails();
    // await this.VerifyCustomerInformation();
    // await this.VerifyCustomerOrderDetails();
    // await this.VerifyProductSummary();
    // await this.VerifyLastPaymentHistory();
    // await this.VerifySettlementDetails();
    // await this.VerifyFullPaymentHistory();
    // if (expected.flags.cancelPlanFlag === 'true') {
    //   await this.VerifyCancellationDetails();
    // }

    // New Screens
    await this.VerifyBasicDetails();
    await this.VerifyBookingDetails();
    await this.VerifyCustomerDetails();
    await this.VerifyPlanDetails();
    await this.VerifyProductSummary();
    await this.VerifyPaymentHistory();
    if (expectedConfig.planSummary.planStatus != 'Cancelled') {
      await this.VerifyRefundMilestones();
    }
  }

  async VerifyRefundMilestones() {
    const data = await utility.callExpectedJson();

    console.log('testing!...');
    // saving order cancellation date into json file.
    const currentDate = await utility.getCurrentDate();
    const [day, month, year] = currentDate.split('/');
    const formattedDate = `${day.padStart(2, '0')}/${month}/${year}`;
    expectedConfig.cancellationDetails.planCancellationDate = formattedDate;
    console.log(
      '\u001b[1;33m' + Number(expectedConfig.planDetails.items.length),
      'products found in customer plan!..\u001b[1;37m.'
    );
    let productItems = data.planDetails.producItem;
    await calculation.readMerchantFile();
    productItems = productItems.split('$');
    if (Array.isArray(productItems)) {
      for (let i = 0; i < expectedConfig.planDetails.items.length; i++) {
        await plan_cancellation_calculation.calculateNonRefundableAmount_refundPolicy(
          'refundPolicies',
          productItems[i],
          i
        );
      }
    } else {
      await plan_cancellation_calculation.calculateNonRefundableAmount_refundPolicy(
        'refundPolicies',
        productItems,
        1
      );
    }
    await plan_cancellation.RefundMileStoneforMerchantPortal();
  }

  async orderDetails(detailsScreen: any, nOrders: any, searchResults: any) {
    console.log('In Verify Details function');
    const detailsScreenArray = await utility.convertStringtoArray(
      detailsScreen
    );
    console.log(detailsScreenArray);
    // const allScreenArray = [
    //   'basicDetails',
    //   'SettlementDetails',
    //   'FullPaymentHistory',
    //   'CustomerInformation',
    //   'CustomerOrderDetails',
    //   'ProductSummary',
    //   'LastPaymentHistory',
    //   'OrderDetails',
    // ];
    //looping through the search result rows to go to detail page and verify the detail screens present in detailsScreenArray
    if (!searchResults) {
      console.log('No search results found');
    } else {
      for (let i = 0; i < (await searchResults.count()); ++i) {
        if (i < nOrders) {
          //no of orders rows to be verified
          const rowOrderId = await searchResults.nth(i).locator('td');
          console.log(detailsScreen);

          this.rowData = await this.fetchOrderDetails(rowOrderId);
          console.log('==== Complete Row Data ====');
          console.log(this.rowData);

          //Opening the Page
          let rowId = "//td[normalize-space()='";
          rowId += this.rowData[0]; //order id value
          rowId += "']";
          console.log(rowId);
          await page.click(rowId);
          if (detailsScreen !== '') {
            // await expect(page).toHaveTitle('PlanPay');
            const elementPresent = await utility.checkElementPresent(
              this.orderValue_detail
            );
            console.log('Is Element Present? : ' + elementPresent);
            if (elementPresent == 'fail') {
              await expect(elementPresent).toEqual('pass');
            }
            await console.log('need to test the above function');
            //----------------------------------------------------------
            //Logic implemented for Detailed Screen
            for (let j = 0; j < (await detailsScreenArray.length); ++j) {
              console.log(
                '=====================' +
                  detailsScreenArray[j] +
                  '============================='
              );
              console.log('                     ' + detailsScreenArray[j]);
              console.log(
                '=====================' +
                  detailsScreenArray[j] +
                  '============================='
              );

              const functionName = 'this.Verify' + detailsScreenArray[j] + '()';
              console.log('My function name: ', functionName);
              await eval(functionName);
            }

            //----------------------------------------------------------------
            await page.click(this.backBtn); //closing the page.
          }
        }
      }
    }
  }
  //Returning the nth rows all data for verificatin.
  async fetchOrderDetails(rowOrderId: any) {
    const data = [];
    for (let j = 0; j < (await rowOrderId.count()); ++j) {
      data[j] = rowOrderId.nth(j).innerText();
      await data[j]
        .then((value: never) => {
          this.rowData[j] = value; // 👉️ "hello"
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
    return this.rowData;
  }

  async verifyFieldvalue(
    basicDetails: any,
    ExpectedValue: any,
    feildName: any
  ) {
    if (feildName == 'customerDate') {
      const cusDateValue = await page.locator(basicDetails).innerText();
      if (cusDateValue.toUpperCase() == ExpectedValue) {
        console.log(feildName + ' Matched');
      }
    } else if (feildName == 'orderAmount') {
      const orderAmountValue = await page.locator(basicDetails).innerText();
      const res = orderAmountValue.replace(/\D/g, '');
      const expectedRes = ExpectedValue.replace(/\D/g, '');
      if (res == expectedRes) {
        console.log(feildName + ' Matched');
      }
    } else {
      await expect(basicDetails).toHaveText(ExpectedValue);
      console.log(feildName + ' Matched');
    }
  }

  async VerifyBasicDetails() {
    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Verify Plan Basic Details \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );
    await utility.delay(3000);
    await page.waitForLoadState();
    await page.waitForSelector(this.planId);
    const planId = await page.locator(this.planId).innerText();
    const planCreatedDate = await page
      .locator(this.planCreatedDate)
      .innerText();
    const planStatus = await page.locator(this.planStatus).innerText();
    const planTotal = await page.locator(this.planTotal).innerText();
    const planAmountPaid = await page.locator(this.planAmountPaid).innerText();
    let planAmountRemaining;
    let planFrequency;
    let planInstallmentsRemaining;
    let planInstallmentAmount;
    let planLastInstallment;
    let planCompletionDate;
    let refundAmount;
    let cancellationDate;

    if (expectedConfig.planSummary.planStatus != 'Cancelled') {
      planAmountRemaining = await page
        .locator(this.planAmountRemaining)
        .innerText();
      planFrequency = await page.locator(this.planFrequency).innerText();
      planInstallmentsRemaining = await page
        .locator(this.planInstallmentsRemaining)
        .innerText();
      planInstallmentAmount = await page
        .locator(this.planInstallmentAmount)
        .first()
        .innerText();
      planLastInstallment = await page
        .locator(this.planLastInstallment)
        .innerText();
      planCompletionDate = await page
        .locator(this.planCompletionDate)
        .innerText();
    }

    if (expectedConfig.planSummary.planStatus == 'Cancelled') {
      refundAmount = await (
        await page.locator(this.plan_refund_amount).innerText()
      ).replace(/[^0-9.]/g, '');
      cancellationDate = await page
        .locator(this.plan_cancellation_date)
        .innerText();
    }

    const expectedValues = await utility.callExpectedJson(); //open the expectedJSON against the merchantName
    let expectedInstAmount = expectedValues.planSummary.installmentAmount;
    if (expectedValues.planSummary.planStatus == 'Completed') {
      expectedInstAmount =
        expectedValues.paidPayments[expectedValues.paidPayments.length - 1]
          .amount;
    }
    console.log('expected inst amount ', expectedInstAmount);
    console.log('planInstallmentAmount ', planInstallmentAmount);

    const titlearrayVerifySettlementDetails = [
      'Plan Id',
      'Plan Created Date',
      'Plan Status',
      'Plan Total amount',
      'Plan Amount paid',
    ];

    const actual = [
      planId,
      await utility.formatDate(planCreatedDate),
      await utility.titleCase(planStatus),
      await utility.convertPricewithFraction(planTotal),
      await utility.convertPricewithFraction(planAmountPaid),
    ];
    const expected = [
      expectedValues.planSummary.planID,
      expectedValues.planSummary.planDate,
      expectedValues.planSummary.planStatus,
      await utility.upto2Decimal(expectedValues.planSummary.totalCost),
      expectedValues.planSummary.totalFunds,
    ];

    if (expectedConfig.planSummary.planStatus == 'Cancelled') {
      await titlearrayVerifySettlementDetails.push(
        'Refund Amount',
        'Cancellation Date'
      );
      cancellationDate = await utility.formatDate(cancellationDate);
      await actual.push(refundAmount, cancellationDate);
      await expected.push(
        expectedValues.cancellationDetails.ActualRefundAmountUI,
        expectedValues.cancellationDetails.planCancellationDate
      );
    } else {
      await titlearrayVerifySettlementDetails.push(
        'Plan Amount remaining',
        'Plan Frequency',
        'Plan Installments remaining',
        // 'Plan Installment amount',
        'Plan Last installment',
        'Plan Completion Date'
      );
      await actual.push(
        await utility.convertPricewithFraction(planAmountRemaining),
        planFrequency,
        planInstallmentsRemaining,
        // await utility.convertPricewithFraction(planInstallmentAmount),
        await utility.formatDate(planLastInstallment),
        await utility.formatDate(planCompletionDate)
      );
      await expected.push(
        expectedValues.planSummary.remainingAmount,
        expectedValues.planSummary.installmentPeriod,
        expectedValues.planSummary.noOfInstallmentsToBePaid,
        // expectedInstAmount,
        expectedValues.planSummary.lastPaymentDate,
        expectedValues.planSummary.completionDate
      );
    }

    await utility.printValues(
      titlearrayVerifySettlementDetails,
      actual,
      'Plan Basic Details'
    );
    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        actual,
        expected,
        titlearrayVerifySettlementDetails,
        'Verify Plan Basic Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
    //Calling match function where flag is true.
    // await this.printbasicDetails();
    // console.log('Check my flag value values', config.LocalEnv.verifyFlag);

    // if (config.LocalEnv.verifyFlag === 'true') {
    //   console.log('this all data contain my rowData array: ', this.rowData);
    //   const expectedValues = await utility.callExpectedJson();
    //   // const expectedValues = await utility.readExpectedValue();
    //   //let actual = [this.rowData[0], this.rowData[1],this.rowData[2],this.rowData[3],this.rowData[4], this.rowData[5]]
    //   const actual = [
    //     this.rowData[0],
    //     await await (await utility.convertPrice(this.rowData[2])).toString(),
    //     this.rowData[3],
    //     await utility.formatDate(this.rowData[4]),
    //   ];
    //   const expected = [
    //     expectedValues.planSummary.planID,
    //     expectedValues.planSummary.totalCost,
    //     expectedValues.customer.firstName +
    //       ' ' +
    //       expectedValues.customer.lastName,
    //     expectedValues.planSummary.planDate,
    //   ]; //assigning expected values from expected JSON file.
    //   //let myTitleArray = ["orderId", "merchantOrder", "orderAmount", "customerName", "customerDate", "orderStatus" ]
    //   const myTitleArray = [
    //     'planId',
    //     'planAmount',
    //     'customerName',
    //     'customerDate',
    //   ];
    //   await utility.matchValues(
    //     actual,
    //     expected,
    //     myTitleArray,
    //     'Basic Details',
    //     //"Merchant-portal"
    //     expectedConfig.LocalEnv.applicationName
    //   );
    // }
  }

  async printbasicDetails() {
    console.log(
      '==============On Basic Details Printing======================='
    );

    await this.verifyFieldvalue(
      page.locator(this.orderValue_detail),
      this.rowData[0],
      'planId'
    );

    await this.verifyFieldvalue(
      page.locator(this.merchantOrderId_detail),
      this.rowData[1],
      'merchantOrder'
    );

    await this.verifyFieldvalue(
      this.orderAmount_detail,
      this.rowData[2],
      'orderAmount'
    );

    await this.verifyFieldvalue(
      page.locator(this.customerName_detail),
      this.rowData[3],
      'customerName'
    );

    await this.verifyFieldvalue(
      this.customerDate_detail, //have to check
      this.rowData[4],
      'customerDate'
    );

    await this.verifyFieldvalue(
      page.locator(this.orderStatusValue_detail),
      this.rowData[5],
      'orderStatus'
    );
  }

  async VerifyPlanDetails() {
    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Verify Plan Details \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );

    const planId = await page.locator(this.planId).innerText();
    const planCreatedDate = await page
      .locator(this.planCreatedDate)
      .innerText();
    const planFrequency = await page.locator(this.planFrequency).innerText();
    const planInstallmentAmount = await page
      .locator(this.planInstallmentAmount)
      .last()
      .innerText();
    const planNumOfInstallments = await page
      .locator(this.planNumOfInstallments)
      .innerText();

    console.log('Plan Id => ', planId);
    console.log('Plan Created Date => ', planCreatedDate);
    console.log('Plan Frequency => ', planFrequency);
    console.log('Plan Installment Amount => ', planInstallmentAmount);
    console.log('Plan Number Of Installments => ', planNumOfInstallments);

    const expectedValues = await utility.callExpectedJson(); //open the expectedJSON against the merchantName

    if (config.LocalEnv.verifyFlag === 'true') {
      const titlearrayVerifySettlementDetails = [
        'Plan Id',
        'Plan Creation Date',
        'Plan Frequency',
        'Plan Number Of Installments',
        // 'Plan Installment amount',
      ];
      const actual = [
        planId,
        await utility.formatDate(planCreatedDate),
        planFrequency,
        planNumOfInstallments,
        // await utility.convertPricewithFraction(planInstallmentAmount),
      ];

      const expected = [
        expectedValues.planSummary.planID,
        expectedValues.planSummary.planDate,
        expectedValues.planSummary.installmentPeriod,
        expectedValues.planSummary.totalNoOfInstallments,
        // expectedValues.planSummary.installmentAmount,
      ];

      await utility.matchValues(
        actual,
        expected,
        titlearrayVerifySettlementDetails,
        'Verify Plan Details',
        expectedConfig.LocalEnv.applicationName
      );
    }

    // let titlearrayVerifySettlementDetails = [];
    // const data = await utility.callExpectedJson();
    // if (data.flags.cancelPlanFlag === 'true') {
    //   titlearrayVerifySettlementDetails = [
    //     //values title array
    //     'Order total',
    //     'Total received',
    //     'Remaining balance',
    //     'Final payment date',
    //     'Number of late payments',
    //   ];
    // } else {
    //   titlearrayVerifySettlementDetails = [
    //     'Plan Status',
    //     'Plan Total amount',
    //     'Plan Amount paid',
    //     'Plan Amount remaining',
    //     'Plan Frequency',
    //     'Plan Installments remaining',
    //     'Plan Installment amount',
    //     'Plan Last installment',
    //     'Plan Completion Date',
    //   ];
    // }
    // await page.waitForSelector(this.settlmentAmountbox);
    // const settOrderAmounts = await page
    //   .locator(this.settlmentAmountbox)
    //   .innerText();

    // const myValuesArray = settOrderAmounts.split(/\r?\n/);

    // const myValuesArray: any = [];
    // const myTitleArray: any = [];
    // let arraylen = titlearray.length;
    // let ii = 0;

    // for (let i = 1; i <= titlearray.length; i++) {
    // arraylen = arraylen - 1;
    // const title = (await '//p[') + i + ']';
    // const amountlocator = (await '//p[') + i + ']';

    // console.log(await "indexOf(title)"+ await indexOf((titlearray[i])))
    // const allTitles = await settOrderDetail.locator(title).innerText();
    // const myValues = await settOrderAmounts
    //   .locator(amountlocator)
    //   .innerText();

    // myTitleArray[ii] = allTitles;
    // myValuesArray[ii] = myValues;
    // ii++;
    // }
    // let ReceviedArray = [];
    // if (data.flags.cancelPlanFlag === 'true') {
    //   ReceviedArray = [
    //     //actual values assigning to this array
    //     await utility.convertPricewithFraction(myValuesArray[1]),
    //     await utility.convertPricewithFraction(myValuesArray[3]), //converting price into integer and removing all extra data by using converPirce function.
    //     '0.00',
    //     await utility.formatDate(myValuesArray[6]),
    //     myValuesArray[7],
    //     // await utility.convertPricewithFraction(myValuesArray[9]),
    //     // await utility.convertPricewithFraction(myValuesArray[11]),
    //   ];
    // } else {
    //   ReceviedArray = [
    //     //actual values assigning to this array
    //     await utility.convertPricewithFraction(myValuesArray[1]),
    //     await utility.convertPricewithFraction(myValuesArray[3]), //converting price into integer and removing all extra data by using converPirce function.
    //     await utility.convertPricewithFraction(myValuesArray[5]),
    //     await utility.formatDate(myValuesArray[6]),
    //     myValuesArray[7],
    //     await utility.convertPricewithFraction(myValuesArray[9]),
    //     await utility.convertPricewithFraction(myValuesArray[11]),
    //     // await utility.convertPrice(myValuesArray[8]),
    //   ];
    // }
    // await this.printSettlementDetails(titlearray, ReceviedArray);
    // let actual = [];
    // if (data.flags.cancelPlanFlag === 'true') {
    //   actual = [
    //     await utility.convertPricewithFraction(myValuesArray[1]),
    //     await utility.convertPricewithFraction(myValuesArray[5]),
    //     // await utility.formatDate(myValuesArray[6]),
    //   ];
    // } else {
    //   actual = [
    //     await utility.convertPricewithFraction(myValuesArray[1]),
    //     await utility.convertPricewithFraction(myValuesArray[5]),
    //     // await utility.formatDate(myValuesArray[6]),
    //     // await utility.convertPricewithFraction(myValuesArray[9]),
    //     // await utility.convertPricewithFraction(myValuesArray[11]),
    //   ];
    // }
    // let expected = [];
    // let matchvalueTitle = [];
    // if (data.flags.cancelPlanFlag === 'true') {
    //   matchvalueTitle = [
    //     'Order total',
    //     'Remaining balance',
    //     // 'Final payment date',
    //   ];
    // } else {
    //   matchvalueTitle = [
    //     'Order total',
    //     'Remaining balance',
    //     // 'Final payment date',
    //     // 'Planpay fees',
    //     // 'Merchant revenue',
    //   ];
    // }

    // if (config.LocalEnv.verifyFlag === 'true') {
    //   const expectedValues = await utility.callExpectedJson();

    //   if (data.flags.cancelPlanFlag === 'true') {
    //     expected = [
    //       await utility.upto2Decimal(expectedValues.planSummary.totalCost),
    //       '0.00',
    //       // expectedValues.planSummary.lastPaymentDate,
    //     ];
    //   } else {
    //     expected = [
    //       await utility.upto2Decimal(expectedValues.planSummary.totalCost),
    //       expectedValues.planSummary.remainingAmount,
    //       // expectedValues.planSummary.lastPaymentDate,
    //       // expectedValues.fees.planPayFeesSoFar,
    //       // expectedValues.fees.merchantRevenue,
    //     ];
    //   }
    //   await utility.matchValues(
    //     actual,
    //     expected,
    //     matchvalueTitle,
    //     'Settelment Details',
    //     expectedConfig.LocalEnv.applicationName
    //   );
    // }
  }

  async printSettlementDetails(myTitleArray: any, ReceviedArray: any) {
    console.log(
      '==============On Settlement Details Printing======================='
    );
    for (let i = 0; i < myTitleArray.length; i++) {
      console.log(myTitleArray[i] + ': ' + ReceviedArray[i]);
    }
  }

  async VerifyPaymentHistory() {
    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Verify Payment History\x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );
    const expectedValues = await utility.callExpectedJson(); //open the expectedJSON against the merchantName
    const progressStatus = await page.locator('#progress-status').innerText();
    const paidInstallment = progressStatus.charAt(1);

    let upcomingPayments;
    if (expectedConfig.planSummary.planStatus != 'Cancelled') {
      upcomingPayments = await page
        .locator(this.planInstallmentsRemaining)
        .innerText();
    }
    const titleArrayPaidPayments = [
      'Payment Date',
      'Payment Amount',
      'Payment Status',
    ];
    for (let i = 1; i <= Number(paidInstallment); i++) {
      const paymentDate = await page
        .locator('#payment-installment-' + i + '-date')
        .first()
        .innerText();
      const paymentAmount = await page
        .locator('#payment-installment-' + i + '-amount')
        .first()
        .innerText();
      const paymentStatus = await page
        .locator('#payment-installment-' + i + '-status')
        .first()
        .innerText();

      console.log(
        '////////////////////////         Paid Payment ',
        i,
        '         //////////////////////////////'
      );

      console.log('Payment Date => ', paymentDate);
      console.log('Payment Amount => ', paymentAmount);
      console.log('Payment Status => ', paymentStatus);

      if (config.LocalEnv.verifyFlag === 'true') {
        const paymentDateExp =
          expectedValues.paidPayments[i - 1].actualPaidDate;
        const paymentAmountExp = expectedValues.paidPayments[i - 1].amount;
        const paymentStatusExp = expectedValues.paidPayments[i - 1].status;

        const actual = [
          await utility.formatDate(paymentDate),
          await utility.convertPricewithFraction(paymentAmount),
          paymentStatus,
        ];

        const expected = [paymentDateExp, paymentAmountExp, paymentStatusExp];

        await utility.matchValues(
          actual,
          expected,
          titleArrayPaidPayments,
          'Verify Paid Payments',
          expectedConfig.LocalEnv.applicationName
        );
      }
    }

    for (let u = 0; u < Number(upcomingPayments); u++) {
      const rowNumber =
        Number(u + 1) + Number(expectedValues.planSummary.noOfInstallmentsPaid);

      const paymentDate = await page
        .locator('#payment-installment-' + rowNumber + '-date')
        .first()
        .innerText();
      const paymentAmount = await page
        .locator('#payment-installment-' + rowNumber + '-amount')
        .first()
        .innerText();
      const paymentStatus = await page
        .locator('#payment-installment-' + rowNumber + '-status')
        .first()
        .innerText();
      let upcomgStatus = '';
      if (paymentStatus === 'Scheduled') {
        upcomgStatus = 'On Schedule';
      }
      console.log(
        '////////////////////////         Upcoming Payment ',
        u + 1,
        '         //////////////////////////////'
      );

      console.log('Payment Date => ', paymentDate);
      console.log('Payment Amount => ', paymentAmount);
      console.log('Payment Status => ', paymentStatus);

      if (config.LocalEnv.verifyFlag === 'true') {
        const paymentDateExp = expectedValues.UpcomingPayments[u].date;
        const paymentAmountExp = expectedValues.UpcomingPayments[u].amount;
        const paymentStatusExp = expectedValues.UpcomingPayments[u].status;

        const actual = [
          await utility.formatDate(paymentDate),
          await utility.convertPricewithFraction(paymentAmount),
          upcomgStatus,
        ];

        const expected = [paymentDateExp, paymentAmountExp, paymentStatusExp];

        await utility.matchValues(
          actual,
          expected,
          titleArrayPaidPayments,
          'Verify Upcoming Payments',
          expectedConfig.LocalEnv.applicationName
        );
      }
    }
  }

  async printFullPaymentHistory(
    ReceviedArray: any,
    paidInstallmentValue: any,
    rowData: any
  ) {
    const titleArrayFullPaymentHistoryRemaning = [
      'Total Number of Installments',
      'Total Number of Paid Installments',
      'Total Number of Remaning Installments',
      'Dates',
      'Amount',
    ];
    const titleArrayFullPaymentHistoryPaidPayments = [
      'Total Number of Installments',
      'Total Number of Paid Installments',
      'Total Number of Remaning Installments',
      'Dates',
      'Amount',
      'Card Last 4 digit',
    ];
    let paidExpected = [];
    let remainingExpected = [];
    const extractedData = await utility.callExpectedJson();
    console.log(
      '==============   On Full Payment History Printing   ======================='
    );
    const remainingInstallments = ReceviedArray[0] - paidInstallmentValue;
    console.log('Total Rows in payment history: ' + ReceviedArray[0]);
    console.log('Total Installments paid : ' + paidInstallmentValue);
    console.log('Total Remaining installments : ' + remainingInstallments);

    console.log('Total installment match the payment history records!');
    console.log('Total No of Payments: ', ReceviedArray[0]);
    let singleRowPaid = [];
    let singleRowRemaining = [];

    console.log('==============   Paid Installment   =======================');

    for (let i = 0; i < paidInstallmentValue; i++) {
      singleRowPaid = await rowData.nth(i).innerText();
      const paymentRowFormating = await singleRowPaid.split('\t');
      console.log(
        '////////////////////////         Paid Installment ',
        i + 1,
        '         //////////////////////////////'
      );
      console.log('Payment date: ', paymentRowFormating[0]);
      console.log('Amount Paid: ', paymentRowFormating[1]);
      console.log('Status: ', await utility.removeLine(paymentRowFormating[3]));

      const paidAtual = [
        String(ReceviedArray[0]),
        String(paidInstallmentValue),
        String(ReceviedArray[0] - paidInstallmentValue),
        await utility.formatDate(paymentRowFormating[0]),
        await utility.convertPricewithFraction(paymentRowFormating[1]),
        await utility.removeLine(paymentRowFormating[2]),
      ];
      const expectedValues = await utility.callExpectedJson();
      const expectedPaidPayments = extractedData.paidPayments[i];

      paidExpected = [
        expectedValues.planSummary.totalNoOfInstallments,
        expectedValues.planSummary.noOfInstallmentsPaid,
        expectedValues.planSummary.noOfInstallmentsToBePaid,
        expectedPaidPayments.actualPaidDate,
        expectedPaidPayments.amount,
        String(expectedPaidPayments.paymentMethodUsed),
      ];

      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          paidAtual,
          paidExpected,
          titleArrayFullPaymentHistoryPaidPayments,
          'Full Payment History',
          expectedConfig.LocalEnv.applicationName
        );
      }
    }

    if (remainingInstallments != 0) {
      console.log(
        '==============   Remaining Installment   ======================='
      );

      console.log(
        'titleArrayFullPaymentHistoryRemaning ',
        titleArrayFullPaymentHistoryRemaning
      );

      // await titleArrayFullPaymentHistory.pop();

      console.log('paidInstallmentValue: ', paidInstallmentValue);
      console.log('remainingInstallments: ', remainingInstallments);
      let rowCount = paidInstallmentValue;
      for (let i = 0; i < remainingInstallments; i++) {
        singleRowRemaining = await rowData.nth(rowCount).innerText();
        const RemainingPaymentRowFormating = await singleRowRemaining.split(
          '\t'
        );
        console.log(
          '////////////////////////         Remaining Installment ',
          i + 1,
          '         //////////////////////////////'
        );
        console.log('Payment date: ', RemainingPaymentRowFormating[0]);
        console.log('Amount Paid: ', RemainingPaymentRowFormating[1]);
        console.log(
          'Status: ',
          await utility.removeLine(RemainingPaymentRowFormating[3])
        );

        if (config.LocalEnv.verifyFlag == 'true') {
          const remainingAtual = [
            String(ReceviedArray[0]),
            String(paidInstallmentValue),
            String(ReceviedArray[0] - paidInstallmentValue),
            await utility.formatDate(RemainingPaymentRowFormating[0]),
            await utility.convertPricewithFraction(
              RemainingPaymentRowFormating[1]
            ),
            await utility.removeLine(RemainingPaymentRowFormating[2]),
          ];
          const expectedValues = await utility.callExpectedJson();
          const expectedRemaninigPayments = extractedData.UpcomingPayments[i];

          remainingExpected = [
            expectedValues.planSummary.totalNoOfInstallments,
            expectedValues.planSummary.noOfInstallmentsPaid,
            expectedValues.planSummary.noOfInstallmentsToBePaid,
            expectedRemaninigPayments.date,
            expectedRemaninigPayments.amount,
          ];

          await utility.matchValues(
            remainingAtual,
            remainingExpected,
            titleArrayFullPaymentHistoryRemaning,
            'Full Payment History',
            expectedConfig.LocalEnv.applicationName
          );
        }
        rowCount++;
      }
    }
  }

  async VerifyCancellationDetails() {
    const titleArray = [
      'Actual revenue',
      'Amount refunded',
      'PlanPay actual fees',
      'Cancelation date',
      'Cancelation reason',
    ];
    const data = await utility.callExpectedJson();

    ///This logic will change after id implementation
    // const settcanellationDetails = await page
    //   .locator(this.cancellationDetails)
    //   .nth(1)
    //   .innerText();

    const settcanellationDetails = await page
      .locator(this.cancellationDetails)
      .innerText();
    const myValuesArray = settcanellationDetails.split(/\r?\n/);
    const ReceviedArray = [
      await myValuesArray[1].replace(/[^0-9.-]/g, ''),
      await utility.convertPricewithFraction(myValuesArray[3]),
      await utility.convertPricewithFraction(myValuesArray[5]),
      await utility.formatDate(myValuesArray[6]),
      myValuesArray[7],
    ];
    const expected = [
      data.fees.merchantRevenue,
      data.fees.planPayFeesSoFar,
      await utility.upto2Decimal(data.cancellationDetails.ActualRefundAmountUI),
      data.cancellationDetails.planCancellationDate,
      data.cancellationDetails.reason,
    ];

    await this.printCancellationDetails(titleArray, ReceviedArray);
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        ReceviedArray,
        expected,
        titleArray,
        'Cancellation Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }

  async printCancellationDetails(titleArray: any, ReceviedArray: any) {
    console.log(
      '==============On Cancellation Details Printing======================= '
    );
    for (let i = 0; i < titleArray.length; i++) {
      console.log(titleArray[i] + ': ' + ReceviedArray[i]);
    }
  }

  async VerifyCustomerOrderDetails() {
    const ReceviedArray = [];
    const titleArray = ['Order total', 'Payment Method'];
    ReceviedArray[0] = await page.locator(this.totalOrderL).innerText();
    const BreakOrderTotal = ReceviedArray[0].split(' ');
    ReceviedArray[1] = await page.locator(this.payMethodL).innerText();
    ReceviedArray[0] = await utility.convertPricewithFraction(ReceviedArray[0]);

    await this.printCustomerOrderDetails(titleArray, ReceviedArray);

    let expected = [];
    const actual = [
      BreakOrderTotal[1],
      ReceviedArray[0].toString(),
      ReceviedArray[1],
    ];
    const matchvalueTitle = ['Currency', 'Order total', 'Payment Method'];
    //Calling match function where flag is true.
    if (config.LocalEnv.verifyFlag === 'true') {
      const expectedValues = await utility.callExpectedJson();

      const paidLength = expectedValues.paidPayments.length;
      expected = [
        expectedValues.planSummary.checkoutCurrency,
        await utility.upto2Decimal(expectedValues.planSummary.totalCost),
        expectedValues.paidPayments[paidLength - 1].paymentMethodUsed,
      ];
      await utility.matchValues(
        actual,
        expected,
        matchvalueTitle,
        'Customer Order Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }

  async printCustomerOrderDetails(titleArray: any, ReceviedArray: any) {
    console.log(
      '==============On Full Customer Order Details Printing======================='
    );
    for (let i = 0; i < titleArray.length; i++) {
      console.log(titleArray[i] + ': ' + ReceviedArray[i]);
    }
  }

  async VerifyCustomerDetails() {
    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Verify Customer Details \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );

    const customerName = await page.locator(this.customerName).innerText();
    const customerEmailAddress = await page
      .locator(this.customerEmailAddress)
      .innerText();
    const customerPhoneNumber = await page
      .locator(this.customerPhoneNumber)
      .innerText();
    let accountCreated = await page.locator(this.accountCreated).innerText();
    accountCreated = await utility.formatDate(accountCreated);
    const acccountStatus = await page.locator(this.userStatus).innerText();

    //const ReceviedArray = await utility.breakIntoArray(info);
    //await this.printCustomerInformation(titleArray, ReceviedArray);
    const expectedValues = await utility.callExpectedJson(); //open the expectedJSON against the merchantName
    const titleArrayVerifyCustomer = [
      'Customer Full Name',
      'Customer Email',
      'Customer Phone Number',
      'Account Created',
      'User Status',
    ];
    //Calling match function where flag is true.

    const actual = [
      customerName,
      customerEmailAddress,
      customerPhoneNumber,
      accountCreated,
      acccountStatus,
    ];
    const expected = [
      expectedValues.customer.firstName +
        ' ' +
        expectedValues.customer.lastName,
      expectedValues.customer.Email,
      expectedValues.customer.phoneNumber,
      expectedValues.customer.accountCreated,
      expectedValues.customer.userStatus,
    ];
    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        actual,
        expected,
        titleArrayVerifyCustomer,
        'Verify Customer Details',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printValues(
        titleArrayVerifyCustomer,
        actual,
        'CustomerDetails'
      );
    }
  }

  async printCustomerInformation(titleArray: any, ReceviedArray: any) {
    console.log(
      '==============On Customer Information Printing======================='
    );
    for (let i = 0; i < ReceviedArray.length; i++) {
      console.log(titleArray[i] + ' : ' + ReceviedArray[i]);
    }
  }

  async getExpectedItemIndex(itemTitle: any) {
    const totalItem = expectedConfig.planDetails.items.length;
    let i: number;
    for (i = 0; i < totalItem; i++) {
      if (
        await itemTitle.includes(
          String(expectedConfig.planDetails.items[i].description)
        )
      ) {
        return i;
      }
    }
    return undefined;
  }

  async VerifyProductSummary() {
    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Verify Product Summary \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );
    const expectedValues = await utility.callExpectedJson(); //open the expectedJSON against the merchantName
    const rows = page.locator('tbody tr');
    const rowsCount = await rows.count();
    const productCount = rowsCount - 1;
    //const productCount = expectedValues.planDetails.items.length;
    console.log('Number Of Products => ', productCount);
    for (let i = 1; i <= productCount; i++) {
      const productName = await page
        .locator('#product-item-' + i)
        .first()
        .innerText();
      const productPrice = await page
        .locator('#product-price-' + i)
        .first()
        .innerText();
      const productQuantity = await page
        .locator('#product-quantity-' + i)
        .first()
        .innerText();
      const productTotal = await page
        .locator('#product-total-' + i)
        .first()
        .innerText();

      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m Product ' +
          i +
          ' \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );

      console.log('Product Name => ', productName);
      console.log('Product Price => ', productPrice);
      console.log('Product Quantity => ', productQuantity);
      console.log('Product Total => ', productTotal);

      const index: number | undefined = Number(
        await this.getExpectedItemIndex(productName)
      );

      if (config.LocalEnv.verifyFlag === 'true') {
        console.log(
          'expectedValues.planDetails.items[index]: ',
          expectedValues.planDetails.items[index]
        );

        console.log(
          'expectedValues.planDetails.items: ',
          expectedValues.planDetails.items
        );

        console.log(
          'expectedValues.planDetails.items[index].description; ',
          expectedValues.planDetails.items[index].description
        );

        const productNameExp =
          expectedValues.planDetails.items[index].description;

        console.log('productNameExp: ', productNameExp);

        const productPriceExp =
          expectedValues.planDetails.productsAmount[index];
        const productQuantityExp =
          expectedValues.planDetails.productsQuantity[index];

        const productTotalExp = productQuantityExp * productPriceExp;

        const titleArrayProductSummery = [
          'Product name',
          'Product Price',
          'Product Qty',
          'Product Total',
        ];
        const actual = [
          productName,
          await utility.convertPricewithFraction(productPrice),
          productQuantity,
          await utility.convertPricewithFraction(productTotal),
        ];

        const expected = [
          productNameExp,
          productPriceExp,
          productQuantityExp,
          await utility.upto2Decimal(productTotalExp),
        ];

        await utility.matchValues(
          actual,
          expected,
          titleArrayProductSummery,
          'Verify Product Summery',
          expectedConfig.LocalEnv.applicationName
        );
      }
    }
  }

  async printProductSummary(ReceviedArray: any) {
    const titleArray = ['Quantity', 'Product Name', 'Product Price'];

    for (let i = 0; i < ReceviedArray.length; i++) {
      console.log(
        '////////////////////////         Product ',
        i + 1,
        '         //////////////////////////////'
      );

      console.log('Product Quantity ', ReceviedArray[i][0]);
      const ProductQuantity = ReceviedArray[i][0].split(' ');
      console.log('Product Name ', ReceviedArray[i][1]);
      const productPrice = ReceviedArray[i][2].split('$');
      console.log('Product Price ', productPrice[1]);
      const actual = [
        ProductQuantity[0],
        ReceviedArray[i][1],
        await utility.removeComma(productPrice[1]),
      ];

      const expectedValues = await utility.callExpectedJson();
      const producItem = expectedValues.planDetails.producItem.split('$');
      const singleProduct = producItem.indexOf(ReceviedArray[i][1].trim());
      const singleProductName = producItem[singleProduct];

      const expected = [
        expectedValues.planDetails.productsQuantity[singleProduct],
        singleProductName,
        await utility.upto2Decimal(
          expectedValues.planDetails.productsAmount[singleProduct] *
            expectedValues.planDetails.productsQuantity[singleProduct]
        ),
      ];
      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArray,
          'Product Summary',
          expectedConfig.LocalEnv.applicationName
        );
      }
    }
  }

  async VerifyLastPaymentHistory() {
    // let history_detailss: any = [];

    await page.waitForSelector(this.paymentDateandTimeL);
    let paymentDateandTime = await page
      .locator(this.paymentDateandTimeL)
      .innerText();
    await page.waitForSelector(this.lastAmountL);
    const lastAmount = await page.locator(this.lastAmountL).innerText();
    const breakLastAmount = lastAmount.split(' ');
    await page.waitForSelector(this.transactionIdL);
    const transactionId = await page.locator(this.transactionIdL).innerText();
    console.log('============Here is a Last Payment Details =============');
    const ReceviedArray = [];
    paymentDateandTime = await utility.formatDate(paymentDateandTime);
    ReceviedArray[0] = paymentDateandTime;
    ReceviedArray[1] = lastAmount;
    ReceviedArray[2] = transactionId;
    ReceviedArray[3] = breakLastAmount[1];
    const titleArray = [
      'Payment date/time',
      'Paid amount',
      'Transaction ID',
      'Currency',
    ];
    //printing the values.
    await this.printLastPaymentHistory(titleArray, ReceviedArray);
    let expected = [];

    const actual = [
      // data[0],
      await utility.convertPricewithFraction(ReceviedArray[1]),
      breakLastAmount[1],
    ];
    const matchvalueTitle = ['Paid amount', 'Currency'];
    //Calling match function where flag is true.
    if (config.LocalEnv.verifyFlag === 'true') {
      const expectedValues = await utility.callExpectedJson();
      const expectedPaidPayments =
        expectedValues.paidPayments[expectedValues.paidPayments.length - 1];
      expected = [
        expectedPaidPayments.amount,
        expectedValues.planSummary.checkoutCurrency,
      ];
      // expected = [expectedPaidPayments.date, expectedPaidPayments.amount];
      await utility.matchValues(
        actual,
        expected,
        matchvalueTitle,
        'Last Payment Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }

  async printLastPaymentHistory(titleArray: any, ReceviedArray: any) {
    console.log(
      '==============On Last Payment History Printing======================='
    );
    for (let i = 0; i < titleArray.length; i++) {
      console.log(titleArray[i] + ' = ' + ReceviedArray[i]);
    }
  }

  async VerifyOrderDetails() {
    let actual = [];
    let expected = [];
    const myOrderID = await page.locator(this.orderValue_detail).innerText();
    const myPurchaseDate = await page
      .locator(this.customerDate_detail)
      .innerText();
    const myOrderStatus = await page
      .locator(this.orderStatusL)
      .first()
      .innerText();
    const orderSettlementStatus = await page
      .locator(this.orderSettlementStatusL)
      .innerText();
    const myDate = await utility.formatDate(myPurchaseDate);
    const installmentPaid = await utility.convertSpacesStringintoArray(
      orderSettlementStatus
    );
    const myReceviedArray = [
      myOrderID,
      myDate,
      myOrderStatus,
      orderSettlementStatus,
      installmentPaid[0],
      installmentPaid[2],
    ];
    const myTitles = [
      'Order ID',
      'Purchase Date',
      'Order Status',
      'Settlement status',
      'Instalments Paid',
      'TotalNumber Of Installements',
    ];
    await this.printOrderDetails(myTitles, myReceviedArray);
    const matchvalueTitle = [
      'Plan Status',
      'Order ID',
      'Purchase Date',
      'Instalments Paid',
      'TotalNumber Of Installements',
    ];
    actual = [
      myOrderStatus,
      myOrderID,
      myDate,
      installmentPaid[0],
      installmentPaid[2],
    ];

    expected = [];
    //Calling match function where flag is true.

    if (config.LocalEnv.verifyFlag === 'true') {
      const expectedValues = await utility.callExpectedJson();
      expected = [
        expectedValues.planSummary.planStatus,
        expectedValues.planSummary.planID,
        expectedValues.planSummary.planDate,
        expectedValues.planSummary.noOfInstallmentsPaid,
        expectedValues.planSummary.totalNoOfInstallments,
      ];
      console.log('testing the order match values');

      //***************** */

      await utility.matchValues(
        actual,
        expected,
        matchvalueTitle,
        'Plan Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }

  async printOrderDetails(myTitles: any, myReceviedArray: any) {
    console.log(
      '==============On Plan Details Printing======================='
    );
    for (let i = 0; i < myTitles.length; i++) {
      console.log(myTitles[i] + ': ' + myReceviedArray[i]);
    }
  }

  async VerifyBookingDetails() {
    let expectedProduct = [];
    let recievedProduct: any = [];
    for (let i = 0; i < expectedConfig.planDetails.items.length; i++) {
      await expectedProduct.push(
        expectedConfig.planDetails.items[i].description
      );
      const bookingDescription = await page
        .locator(this.bookingDescription)
        .innerText();
      recievedProduct = await bookingDescription.split(',');
    }
    recievedProduct = await utility.removespacefromArr(recievedProduct);
    expectedProduct = await expectedProduct.sort();
    recievedProduct = await recievedProduct.sort();
    let expRedemptionDate = expectedConfig.planSummary.redemptionDate;
    const expRedemptionDateArr = await expRedemptionDate.split('/');
    const mon = await utility.getMonthName(
      Number(expRedemptionDateArr[1]),
      'short'
    );
    expRedemptionDate =
      expRedemptionDateArr[0] + ' ' + mon + ', ' + expRedemptionDateArr[2];
    let actual = [];
    let expected = [];
    const titleArray = ['Travel Date', 'Description'];
    actual = [
      await page.locator(this.redemptionDate).innerText(),
      recievedProduct,
    ];
    expected = [expRedemptionDate, expectedProduct];
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        titleArray,
        'Booking Details',
        expectedConfig.LocalEnv.applicationName
      );
    }
  }
  async printEachPlanDetails(
    rowNumber: any,
    formatRowData: any,
    detailsScreen: any
  ) {
    config.LocalEnv.verifyFlag = 'true';
    const overViewBookingId = formatRowData[0];
    const overViewPlaniD = formatRowData[2];
    const overViewStatus = formatRowData[4];
    const overViewCustomername = formatRowData[6];
    const overViewCustomerEmail = formatRowData[8];
    const overViewBookingTotal = formatRowData[10];
    const overViewPlanStartDate = formatRowData[14];
    const overViewPlanEndDate = formatRowData[16];

    console.log('Booking Id On Overview Page => ', overViewBookingId);
    console.log('Plan Id On Overview Page => ', overViewPlaniD);
    console.log('Status On Overview Page => ', overViewStatus);
    console.log('Customer Name On Overview Page => ', overViewCustomername);
    console.log('Customer Email On Overview Page => ', overViewCustomerEmail);
    console.log('Booking Total On Overview Page => ', overViewBookingTotal);
    console.log('Plan Start Date On Overview Page => ', overViewPlanStartDate);
    console.log('Plan End Date On Overview Page => ', overViewPlanEndDate);

    await page.locator(rowNumber).click();

    console.log(
      '%%%%%%%%%%%%%%%%\x1b[35m Plan Details Page \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
    );

    const merchantOrderId = await page
      .locator(this.merchantOrderId)
      .innerText();
    const planId = await page.locator(this.planId).innerText();
    const planStatus = await page.locator(this.planStatus).innerText();
    const customerName = await page.locator(this.customerName).innerText();
    const customerEmailAddress = await page
      .locator(this.customerEmailAddress)
      .innerText();
    const planTotal = await page.locator(this.planTotal).innerText();
    const planCreatedDate = await page
      .locator(this.planCreatedDate)
      .innerText();
    const planCompletionDate = await page
      .locator(this.planCompletionDate)
      .innerText();

    console.log('Booking Id On Detail Page => ', merchantOrderId);
    console.log('Plan Id On Detail Page => ', planId);
    console.log('Status On Detail Page => ', planStatus);
    console.log('Customer Name On Detail Page => ', customerName);
    console.log('Customer Email On Detail Page => ', customerEmailAddress);
    console.log('Booking Total On Detail Page => ', planTotal);
    console.log('Plan Start Date On Detail Page => ', planCreatedDate);
    console.log('Plan End Date On Detail Page => ', planCompletionDate);

    const titleArrayVerifyPlan = [
      'Booking Id',
      'Plan Id',
      'Plan Status',
      'Customer Name',
      'Customer Email',
      'Booking Total',
      'Plan Start Date',
      'Plan End Date',
    ];
    const actual = [
      overViewBookingId,
      overViewPlaniD,
      overViewStatus,
      overViewCustomername,
      overViewCustomerEmail,
      overViewBookingTotal,
      await utility.formatDate(overViewPlanStartDate),
      await utility.formatDate(overViewPlanEndDate),
    ];
    const expected = [
      merchantOrderId,
      planId,
      planStatus,
      customerName,
      customerEmailAddress,
      planTotal,
      await utility.formatDate(planCreatedDate),
      await utility.formatDate(planCompletionDate),
    ];
    if (config.LocalEnv.verifyFlag === 'true') {
      await utility.matchValues(
        actual,
        expected,
        titleArrayVerifyPlan,
        'Verify Plan',
        expectedConfig.LocalEnv.applicationName
      );

      config.LocalEnv.verifyFlag = 'false';
      if (detailsScreen) {
        const detailsScreenArray = await utility.convertStringtoArray(
          detailsScreen
        );

        for (let j = 0; j < (await detailsScreenArray.length); ++j) {
          console.log(
            '=====================' +
              detailsScreenArray[j] +
              '============================='
          );

          const functionName =
            'this.Verify' +
            detailsScreenArray[j].charAt(0).toUpperCase() +
            detailsScreenArray[j].slice(1) +
            '()';
          console.log('function name: ', functionName);
          await eval(functionName);
        }
      }

      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m Back on Overview Page \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
    await page.goBack();
  }
}
