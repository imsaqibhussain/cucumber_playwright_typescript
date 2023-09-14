import { Utilities } from '../utilities';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { config } from '../../setup/configurations/test-data-ts.conf';

const utility = new Utilities();

export class PlanCompletionConfirmation {
  getPercentageL = 'div[class="main"] h1';
  paidSoFarL =
    '//html[1]/body[1]/center[1]/table[1]/tbody[1]/tr[1]/td[1]/div[1]/div[5]/span[1]';
  totalAmountL =
    '//html[1]/body[1]/center[1]/table[1]/tbody[1]/tr[1]/td[1]/div[1]/div[5]/span[2]';
  contantL = 'div[class="order-infor"] span';
  startDateContentL =
    'body > center:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > div:nth-child(7) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)';
  endDateContentL =
    'body > center:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > div:nth-child(7) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)';

  async verifyCompletionConfirmation(email: any) {
    console.log(
      '%%%%%%%%%%%%%%Inside Plan Completion Confirmation%%%%%%%%%%%%%%'
    );
    const subject = 'Payment Completed';
    const page1 = await utility.openEmail(email, subject);
    const emailIframe = await page1.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    const getPercentage = await emailFrame?.textContent(this.getPercentageL);
    const allCotent = await emailFrame?.textContent(this.contantL);
    const totalAmount = await emailFrame?.textContent(this.totalAmountL);
    const paidSoFar = await emailFrame?.textContent(this.paidSoFarL);
    const startDateContent = await emailFrame?.textContent(
      this.startDateContentL
    );
    const endDateContent = await emailFrame?.textContent(this.endDateContentL);
    // const myOrderID = await allCotent;
    console.log('FirstName and LastName :', allCotent);
    const startDate: string = await utility.formatDate(startDateContent);
    const endDate: string = await utility.formatDate(endDateContent);
    const percentageInstallmentPaid: any = await utility.cleanMyString(
      getPercentage
    );
    const covertedPaidSoFar = await utility.convertPricewithFraction(paidSoFar);
    const convertedTotalAmount = await utility.convertPricewithFraction(
      totalAmount
    );
    await this.printCompletionConfirmation(
      percentageInstallmentPaid,
      startDate,
      endDate,
      convertedTotalAmount,
      covertedPaidSoFar
    );
    if (config.LocalEnv.verifyFlag === 'true') {
      await this.verifyCompletionConfirmationMail(
        percentageInstallmentPaid,
        startDate,
        endDate,
        convertedTotalAmount,
        covertedPaidSoFar
      );
    }
    await page1.close();
  }
  async printCompletionConfirmation(
    percentageInstallmentPaid: any,
    startDate: any,
    endDate: any,
    totalAmount: any,
    paidSoFar: any
  ) {
    console.log(
      '%%%%%%%%%%%Inside Plan Completion Confirmation Printing%%%%%%%%%%%'
    );
    console.log('Percentage', percentageInstallmentPaid);
    console.log('Start Date', startDate);
    console.log('End Date', endDate);
    console.log('Total Amount', totalAmount);
    console.log('Paid So Far', paidSoFar);
  }

  async verifyCompletionConfirmationMail(
    percentageInstallmentPaid: any,
    startDate: any,
    endDate: any,
    totalAmount: any,
    paidSoFar: any
  ) {
    console.log(
      '===========On Match Value Plan Completion Confirmation============'
    );
    const titleArray = [
      'Total paid percentage',
      'Paid So Far',
      'Total Amount',
      'Order Placement Date',
      'Last Payment Date',
    ];
    const actual = [
      percentageInstallmentPaid,
      paidSoFar,
      totalAmount,
      startDate,
      endDate,
    ];

    const expectedValues = await utility.commonJsonReadFunc('expectedFile');

    // const expectedValues = await utility.readExpectedValue();
    const expected = [
      expectedValues.planSummary.percentageInstallmentPaid,
      expectedValues.planSummary.paidSoFar,
      expectedValues.planSummary.totalCost,
      expectedValues.planSummary.orderDate,
      expectedValues.planSummary.lastPaymentDate,
    ];
    await utility.delay(6000);

    await utility.matchValues(
      actual,
      expected,
      titleArray,
      'Instalment Paid Email',
      expectedConfig.LocalEnv.applicationName
    );
  }
}
