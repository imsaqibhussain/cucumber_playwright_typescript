import { Utilities } from '../utilities';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { config } from '../../setup/configurations/test-data-ts.conf';
// import { page } from '../../features/support/hooks';

const utility = new Utilities();

export class InstalmentPaidConfirmation {
  firatName = '#name';
  description = '#description';
  merchantName = '#merchant_name';
  planId = '#planId';
  paidAmount = '#paid_amount';
  totalAmount = '#total_amount';

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
  async verifyPaidInstallment(email: any, emailSubject: any) {
    console.log('%%%%%%%%%% Verify Installment Paid Email Screen %%%%%%%%%');

    console.log(
      '%%%%%%%%%% Email Subject => ' + emailSubject + ' Screen %%%%%%%%%'
    );

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

    console.log('First Name => ', firatNameText);
    console.log('Description => ', descriptionText);
    console.log('Merchant name => ', merchantNameText);
    console.log('PlanID => ', planIdText);
    console.log('Paid so far=>', paidAmountText);
    console.log('Total of your plan=>', totalAmountText);
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
      'Firat Name',
      'PlanID',
      'Description',
      'Merchant name',
      'Paid so far',
      'Total of your plan',
      'installment number',
    ];
    const actual: any = [
      firatNameText,
      planIdText,
      descriptionText,
      merchantNameText,
      await utility.convertPricewithFraction(paidAmountText),
      await utility.convertPricewithFraction(totalAmountText),
      subject,
    ];
    const expected = [
      data.customer.firstName,
      data.planSummary.planID,
      data.planDetails.producItem,
      data.merchantDetails.merchantName,
      data.depositSettings.depositPaid,
      data.planSummary.totalCost,
      data.paidPayments[data.paidPayments.length - 1].instalment,
    ];
    console.log(expected);
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        'Installment Paid Email',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printExpectedandAcctualValues(
        title,
        actual,
        expected,
        'Installment Paid Email'
      );
    }
    await page1.close();
    return planIdText;

    // const emailIframe = await page1.waitForSelector('iframe');
    // const emailFrame = await emailIframe.contentFrame();
    //  console.log('allcontent', emailFrame)
    //  console.log('allcontent', emailFrame)
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
    // actualProducts = await actualProducts.trimStart()
    //actualProducts = await actualProducts.trimEnd()
    // const actualProducts = ActualProductList[0]+'$'+ ActualProductList[1]
    // let actualPaidAmount = mydate[3].replace('Total amount','')
    // actualPaidAmount = await utility.convertPricewithFraction(actualPaidAmount)
    // let actualTotalAmount = mydate[4].replace('Plan created at','')
    // actualTotalAmount = await utility.convertPricewithFraction(actualTotalAmount)
    // let actualPlanCreatedDate = mydate[5].replace('Final payment at','')
    // actualPlanCreatedDate = await utility.formatDate(actualPlanCreatedDate)
    // const actualFinalPayment = await utility.formatDate(mydate[6])

    // data.planSummary.planID = myPlanID[1];
    // await fs.writeFile(
    //   'tests/setup/expected/expected-values.json',
    //   JSON.stringify(data),
    //   (err) => {
    //     if (err) console.log('Error writing file:', err);
    //   }
    // );
  }

  // async printInstallmentPaidPrinting(
  //   depContent: any,
  //   totalContent: any,
  //   getPercentage: any,
  //   myConvertedOrderDate: any,
  //   myConvertedendOrderDate: any
  // ) {
  //   console.log('======== On Installment Paid Email Printing Function ========');
  //   console.log('Actual Deposit Amount: ', depContent);
  //   console.log('Actual Total Amount: ', totalContent);
  //   console.log('Actual percetage from header: ', getPercentage);
  //   console.log('Actual Started Date is: ', myConvertedOrderDate);
  //   console.log('Actual Last Payment date: ', myConvertedendOrderDate);
  // }

  // async verifyPaidInstllmentConfirmation(
  //   depositPaid: any,
  //   OrderTotal: any,
  //   OrderDate: any,
  //   lastPaymentDate: any,
  //   PaidPercentage: any
  // ) {
  //   console.log('===========On Match Value Installment Paid Email============');
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
  //     expectedValues.planDetails.lastPaymentDate,
  //     expectedValues.planDetails.percentageInstallmentPaid,
  //   ];
  //   await utility.delay(6000);
  //   await utility.matchValues(
  //     actual,
  //     expected,
  //     titleArray,
  //     'Installment Paid',
  //     expectedConfig.LocalEnv.applicationName
  //   );
  // }
}
