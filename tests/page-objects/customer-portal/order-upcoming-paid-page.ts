import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { expectedConfig, config } from '../../header';
const utility = new Utilities();

export class OrderUpcomingPaid {
  async VerifyUpcomimngValues() {
    const data = await utility.callExpectedJson();
    expectedConfig.UpcomingPayments = data.UpcomingPayments;
    expectedConfig.paidPayments = data.paidPayments;
    const upcomingCount = expectedConfig.UpcomingPayments.length;
    const paidCount = expectedConfig.paidPayments.length;
    const late_Count = expectedConfig.latePayments.length;
    console.log('expectedData', expectedConfig.paidPayments);
    const amount: any[] = [];
    const curreny: any[] = [];
    const instalmentNumber: any[] = [];
    const instalmentDate: any[] = [];
    const status: any[] = [];
    const total = upcomingCount + paidCount + late_Count;
    let count = 0;
    let lateCount = 0;
    let expected: any[];
    for (let i = paidCount + 1; i <= total; i++) {
      status[count] = await page.locator('#instalment_status_' + i).innerText(); //get status
      console.log('status for ', i, ' is ', status[count]);
      if (status[count] == 'Overdue') {
        const latePayments = await data.latePayments;
        amount[count] = '';
        curreny[count] = '';
        expected = [
          '',
          latePayments[lateCount].instalment,
          // latePayments[count].date,
          latePayments[lateCount].status,
          '',
        ];
        lateCount++;
      } else {
        amount[count] = (
          await page.locator('#instalment_amount_' + i).innerText()
        ).replace(/[^0-9.]/g, ''); //cleaning amount string
        curreny[count] = (
          await page.locator('#instalment_amount_' + i).innerText()
        ).replace(/[^A-Z]/g, ''); // get currencey

        expected = [
          data.UpcomingPayments[count].amount,
          data.UpcomingPayments[count].instalment,
          // data.UpcomingPayments[count].date,
          data.UpcomingPayments[count].status,
          // data.planSummary.checkoutCurrency,
        ];
      }
      instalmentNumber[count] = (
        await page.locator('#instalment_number_' + i).innerText()
      ).replace(' of ', '/'); //replacing installment of with /
      instalmentDate[count] = await utility.formatDate(
        await page
          .locator('#instalment_date_' + i)
          .last()
          .innerText()
      ); //get and convert instalment date format.
      status[count] = await page.locator('#instalment_status_' + i).innerText(); //get status

      const actual: any[] = [
        amount[count],
        instalmentNumber[count],
        // instalmentDate[count],
        status[count],
        // curreny[count],
      ];

      const title: any[] = [
        'Amount',
        'No. of Instalment',
        // 'Due Date',
        'Status',
        // 'Currency',
      ];

      //Printing installments
      console.log(
        '\u001b[1;33mUpcoming Installment no: ' + count + '!..\u001b[1;37m.'
      );
      await utility.printValues(title, actual, 'Upcoming Installments');

      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actual,
          expected,
          title,
          'Upcoming Installments',
          expectedConfig.LocalEnv.applicationName
        );
      }
      if (status[count] != 'Overdue') {
        count++;
      }
    }
  }

  async VerifyPaidDetails() {
    const data = await utility.callExpectedJson();

    expectedConfig.paidPayments = data.paidPayments;
    const paidCount = expectedConfig.paidPayments.length;

    const amount: any[] = [];
    const curreny: any[] = [];
    const creditCard: any[] = [];
    const instalmentDate: any[] = [];
    const status: any[] = [];
    let count = 0;
    for (let i = 0 + 1; i <= paidCount; i++) {
      amount[count] = (
        await page.locator('#paid_instalment_amount_' + i).innerText()
      ).replace(/[^0-9.]/g, ''); //cleaning amount string
      creditCard[count] = await page
        .locator('#paid_instalment_card_number_' + i)
        .innerText(); // get card 4 digits
      instalmentDate[count] = await utility.formatDate(
        await page.locator('#paid_instalment_date_' + i).innerText()
      ); //get date and convert format
      status[count] = await page.locator('#instalment_status_' + i).innerText(); // get status
      curreny[count] = (
        await page.locator('#paid_instalment_amount_' + i).innerText()
      ).replace(/[^A-Z]/g, ''); // get currencey

      const actual: any[] = [
        amount[count],
        creditCard[count],
        instalmentDate[count],
        status[count],
        // curreny[count],
      ];
      console.log(
        'data.paidPayments[count].amount',
        data.paidPayments[count].amount
      );
      const expected: any[] = [
        // String(await utility.upto2Decimal(Number(data.paidPayments[count].amount) + Number(data.paidPayments[count].remainder))),
        data.paidPayments[count].amount,
        data.paidPayments[count].paymentMethodUsed,
        data.paidPayments[count].actualPaidDate,
        data.paidPayments[count].status,
        // data.planSummary.checkoutCurrency,
      ];

      const title: any[] = [
        'Amount',
        'Credit Card',
        'Due Date',
        'Status',
        // 'Currency',
      ];

      //Printing installments
      console.log(
        '\u001b[1;33mPaid Installment no: ' + count + '!..\u001b[1;37m.'
      );
      await utility.printValues(title, actual, 'Paid Installments');
      await utility.printExpectedValues(title, expected, 'Paid Installments');

      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actual,
          expected,
          title,
          'Paid Installments',
          expectedConfig.LocalEnv.applicationName
        );
      }
      count++;
    }
  }
}
