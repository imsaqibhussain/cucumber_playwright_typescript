import { config } from '../../setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { Utilities } from '../utilities';
// import * as fs from 'fs';
const utility = new Utilities();
export class BookingCofirmation {
  firatName = '#name';
  description = '#description';
  merchantName = '#merchant_name';
  planId = '#planId';
  paidAmount = '#paid_amount';
  totalAmount = '#total_amount';
  planCreatedDate = '#plan_created_date';
  finalPaymentDate = '#final_payment_date';

  orderInfoL = "//div[@class='order-infor']";
  depContentL =
    '//html[1]/body[1]/center[1]/table[1]/tbody[1]/tr[1]/td[1]/div[1]/div[5]/span[1]';
  totalContentL =
    '//html[1]/body[1]/center[1]/table[1]/tbody[1]/tr[1]/td[1]/div[1]/div[5]/span[2]';
  startDateContentL =
    'body > center:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > div:nth-child(7) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)';
  endDateContentL =
    'body > center:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > div:nth-child(7) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)';
  getPercentageL = "div[class='main'] h1";
  myContentL = "div[class='order-infor'] a[target='_other']";
  async verifyBookingEmail(email: any, emailSubject: any) {
    console.log(
      '%%%%%%%%%% Email Subject => ' + emailSubject + ' Screen %%%%%%%%%'
    );
    //'Payment Confirmed';
    // await utility.delay(1000);
    // const page1 = await utility.openEmail(email, subject);
    // const emailIframe = await page1.waitForSelector('iframe');
    // const emailFrame = await emailIframe.contentFrame();
    // //------- Get Order ID  -------------
    // const allCotent = await emailFrame?.textContent(
    //   'html>body>table>tbody>tr>td>div:nth-of-type(2)>table:nth-of-type(2)>tbody>tr>td:nth-of-type(2)>table>tbody>tr>td:nth-of-type(2)>p'
    // );
    // // console.log('allcontent', emailFrame)
    // const mydate: any = await allCotent?.split(':');

    // const myPlanID = await mydate[1]?.split(' ');
    // let ActualProductList = mydate[2].replace('Paid amount','')

    // ActualProductList = ActualProductList.split(',')
    // let actualProducts: any

    // if(Array.isArray(ActualProductList)){
    //   for(let i = 0 ; i< ActualProductList.length; i++){
    //     if(i==0)
    //     actualProducts = await ActualProductList[i].trimStart()
    //     else
    //     actualProducts = ActualProductList[i-1]+'$'+ await  ActualProductList[i].trimStart()
    //   }
    // }
    // else{
    //   actualProducts = ActualProductList
    // }

    // actualProducts = await actualProducts.trimEnd()
    // actualProducts = await actualProducts.trimStart()

    // let actualPaidAmount = mydate[3].replace('Total amount','')
    // actualPaidAmount = await utility.convertPricewithFraction(actualPaidAmount)
    // let actualTotalAmount = mydate[4].replace('Plan created at','')
    // actualTotalAmount = await utility.convertPricewithFraction(actualTotalAmount)
    // let actualPlanCreatedDate = mydate[5].replace('Final payment at','')
    // actualPlanCreatedDate = await utility.formatDate(actualPlanCreatedDate)
    // const actualFinalPayment = await utility.formatDate(mydate[6])

    console.log('%%%%%%%%%% Verify Booking Email Screen %%%%%%%%%');

    await utility.delay(1000);
    const page1 = await utility.openEmail(email, emailSubject);
    const emailIframe = await page1.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    //------- Get Order ID  -------------

    const firatNameText = await emailFrame?.textContent(this.firatName);

    const descriptionText = await emailFrame?.textContent(this.description);

    const merchantNameText = await emailFrame?.textContent(this.merchantName);

    const planIdText = await emailFrame?.textContent(this.planId);

    const paidAmountText = await emailFrame?.textContent(this.paidAmount);

    const totalAmountText = await emailFrame?.textContent(this.totalAmount);

    const planCreatedDateText = await emailFrame?.textContent(
      this.planCreatedDate
    );

    const finalPaymentDateText = await emailFrame?.textContent(
      this.finalPaymentDate
    );

    console.log('First Name => ', firatNameText);
    console.log('Description => ', descriptionText);
    console.log('Merchant name => ', merchantNameText);
    console.log('PlanID => ', planIdText);
    console.log('Paid so far=>', paidAmountText);
    console.log('Total of your plan=>', totalAmountText);
    console.log('Plan created at=>', planCreatedDateText);
    console.log('Final payment at=>', finalPaymentDateText);

    // const data = await utility.readExpectedValue();
    const data = await utility.callExpectedJson();
    data.planSummary.planID = planIdText;
    let merchant = data.merchantDetails.merchantName;
    if (data.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = data.merchantDetails.sub_merchantName;
    }
    await utility.writeIntoJsonFile(
      'expected-values',
      data,
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant
    );

    const title: any = [
      'PlanID',
      'Product List',
      'Paid Amount',
      'Total Amount',
      'Plan Created at',
      'Final Payment at',
    ];
    const actual: any = [
      planIdText,
      descriptionText,
      await utility.convertPricewithFraction(paidAmountText),
      await utility.convertPricewithFraction(totalAmountText),
      await utility.formatDate(planCreatedDateText),
      await utility.formatDate(finalPaymentDateText),
    ];
    const expected = [
      data.planSummary.planID,
      data.planDetails.producItem,
      data.depositSettings.depositPaid,
      data.planSummary.totalCost,
      data.planSummary.planDate,
      data.planSummary.lastPaymentDate,
    ];

    if (
      config.LocalEnv.verifyFlag == 'true' &&
      expectedConfig.LocalEnv.applicationName == 'merchant-testing'
    ) {
      await utility.matchValues(
        actual,
        expected,
        title,
        'Booking Email',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printExpectedandAcctualValues(
        title,
        actual,
        expected,
        'Booking Email'
      );
    }
    await page1.close();
    return planIdText;
  }

  // async verifyBookingEmailOLD(email: any) {
  //   // We will use this code later
  //   const subject = "You've got a Plan";
  //   //'Payment Confirmed';
  //   await utility.delay(1000);
  //   const page1 = await utility.openEmail(email, subject);
  //   const emailIframe = await page1.waitForSelector('iframe');
  //   const emailFrame = await emailIframe.contentFrame();
  //   //------- Get Order ID  -------------
  //   // const infoOrder = await this.orderInfoL;
  //   const allCotent = await emailFrame?.textContent(this.myContentL);
  //   const myPlanID = await allCotent;
  //   console.log('My Plan ID :', myPlanID);
  //   const data = await utility.readExpectedValue();
  //   data.planSummary.planID = myPlanID;
  //   await fs.writeFile(
  //     'tests/setup/expected/expected-values.json',
  //     JSON.stringify(data),
  //     (err) => {
  //       if (err) console.log('Error writing file:', err);
  //     }
  //   );
  //   //------- Get deposit and total amount ---
  //   const depContent = await emailFrame?.textContent(this.depContentL);
  //   const totalContent = await emailFrame?.textContent(this.totalContentL);
  //   //------- Order Date -----
  //   const startDateContent = await emailFrame?.textContent(
  //     this.startDateContentL
  //   );
  //   //------- Order Date -----
  //   const endDateContent = await emailFrame?.textContent(this.endDateContentL);
  //   //get percentage header
  //   const getPercentage = await emailFrame?.textContent(this.getPercentageL);
  //   const myDepositPaid = await utility.cleanMyString(depContent); //cleaning the deposit paid string
  //   const myPlanTotal = await utility.cleanMyString(totalContent); //cleaning the order total string
  //   const myPercentage = await utility.cleanMyString(getPercentage); //cleaning the percentage string
  //   //Convert order date into comparsion format
  //   const orderDatearray = await utility.converDateFormat(startDateContent);
  //   const myMonthinDigitForm = await utility.convertMyMonthshortformintoDigit(
  //     await utility.monthShortform(orderDatearray[1])
  //   );
  //   const myConvertedOrderDate =
  //     orderDatearray[0] + '/' + myMonthinDigitForm + '/' + orderDatearray[2];
  //   //Convert end date into comparsion format
  //   const orderendDatearray = await utility.converDateFormat(endDateContent);
  //   const myendMonthinDigitForm =
  //     await utility.convertMyMonthshortformintoDigit(
  //       await utility.monthShortform(orderendDatearray[1])
  //     );
  //   const myConvertedendOrderDate =
  //     orderendDatearray[0] +
  //     '/' +
  //     myendMonthinDigitForm +
  //     '/' +
  //     orderendDatearray[2];
  //   await this.printBookingEmailDetails(
  //     depContent,
  //     totalContent,
  //     getPercentage,
  //     myConvertedOrderDate,
  //     myConvertedendOrderDate
  //   );
  //   if (config.LocalEnv.verifyFlag === 'true') {
  //     await this.verifyBookingEmailDetails(
  //       myDepositPaid,
  //       myPlanTotal,
  //       myConvertedOrderDate,
  //       myConvertedendOrderDate,
  //       myPercentage
  //     );
  //   }
  //   await page1.close();
  //   return myPlanID;
  // }
  // async printBookingEmailDetails(
  //   depContent: any,
  //   totalContent: any,
  //   getPercentage: any,
  //   myConvertedOrderDate: any,
  //   myConvertedendOrderDate: any
  // ) {
  //   console.log('======== On Booking Email Printing Function ========');
  //   console.log('Actual Deposit Amount: ', depContent);
  //   console.log('Actual Total Amount: ', totalContent);
  //   console.log('Actual percetage from header: ', getPercentage);
  //   console.log('Actual Started Date is: ', myConvertedOrderDate);
  //   console.log('Actual Last Payment date: ', myConvertedendOrderDate);
  // }
  // async verifyBookingEmailDetails(
  //   depositPaid: any,
  //   OrderTotal: any,
  //   OrderDate: any,
  //   lastPaymentDate: any,
  //   PaidPercentage: any
  // ) {
  //   console.log('===========On Match Value Booking Email============');
  //   const expectedValues = await utility.readExpectedValue();
  //   let total_order = OrderTotal;
  //   //Convert Received value into fractional. We will remove this code later after fixation of the bug.
  //   //Start delete code after bug fixation
  //   if ((await total_order?.includes('.')) === false) {
  //     total_order = OrderTotal + '.00';
  //     console.log(total_order);
  //   }
  //   //End. delete code after bug fixation
  //   const titleArray = [
  //     'Deposit Paid',
  //     'Total Amount',
  //     'Order Placement Date',
  //     'Last Payment Date',
  //     'Total paid percentage',
  //   ];
  //   const actual = [
  //     depositPaid,
  //     total_order,
  //     OrderDate,
  //     lastPaymentDate,
  //     PaidPercentage,
  //   ];
  //   const expected = [
  //     expectedValues.planDetails.depositPaid,
  //     expectedValues.planDetails.totalCost,
  //     expectedValues.planDetails.planDate,
  //     expectedValues.planSummary.lastPaymentDate,
  //     expectedValues.planSummary.percentageInstallmentPaid,
  //   ];
  //   await utility.delay(6000);
  //   await utility.matchValues(
  //     actual,
  //     expected,
  //     titleArray,
  //     'Booking Email',
  //     expectedConfig.LocalEnv.applicationName
  //   );
  // }
}
// module.exports = { BookingCofirmation };
