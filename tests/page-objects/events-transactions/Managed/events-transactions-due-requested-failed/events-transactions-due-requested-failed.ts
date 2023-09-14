import { expect } from '@playwright/test';
import { config } from '../../../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../../../setup/expected/expected-ts.conf';
import { Utilities } from '../../../utilities';
import { eventsTransactionCommon } from '../../events-transaction-common';
const events_trans_common = new eventsTransactionCommon();
const utility = new Utilities();

export class eventsTransactionsRequest {
  async eventsTransaction() {
    await events_trans_common.getEventsTransactions(
      //get events&Transaction from db
      expectedConfig.planSummary.planID
    );
    await events_trans_common.updateTransactionFee();
    await utility.delay(10000);
    await this.validateEventsTransaction();
  }

  async validateEventsTransaction() {
    const eventType = [
      'CustomerPaymentDue',
      'CustomerPaymentRequested',
      'CustomerPaymentFailed',
    ];
    // const titleArray = ['Amount', 'Installment No', 'Date'];
    const titleArray = ['Amount', 'Installment No'];

    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

    let instalmentNo = expectedJson.latePayments[0].instalment;
    instalmentNo = await instalmentNo.split('/');
    for (let i = 0; i < eventType.length; i++) {
      if (
        await eventsTransactionsJson.find(
          (item: { type: string; payload: any }) =>
            item.type === eventType[i] &&
            item.payload.instalmentNo == instalmentNo[0]
        )
      ) {
        const eventsTransactions = await eventsTransactionsJson.find(
          (item: { type: string; payload: any }) =>
            item.type === eventType[i] &&
            item.payload.instalmentNo == instalmentNo[0]
        );

        console.log('Event => ', eventType[i], ' Validation Start');

        const CustomerPaymentSucceeded = eventsTransactions.payload;
        const paidAmount = CustomerPaymentSucceeded.amount;
        const paidNumber = CustomerPaymentSucceeded.instalmentNo;
        const paidDate = await utility.formatDate(eventsTransactions.createdAt);

        console.log('Paid Amount=> ', paidAmount);
        console.log('Paid instalment No => ', paidNumber);
        console.log('Date => ', paidDate);

        const actual = [
          await utility.upto2Decimal(paidAmount),
          String(paidNumber),
          // paidDate,
        ];

        const expected = [
          expectedJson.latePayments[0].amount,
          instalmentNo[0],
          // expectedJson.latePayments[0].date,
        ];

        console.log('actual', actual);
        console.log('expected', expected);

        if (config.LocalEnv.verifyFlag === 'true') {
          await utility.matchValues(
            actual,
            expected,
            titleArray,
            'Customer Payment Failed',
            expectedConfig.LocalEnv.applicationName
          );
        } else {
          await utility.printValues(
            titleArray,
            actual,
            'Customer Payment Failed Event '
          );
        }
        //}

        await expect(eventType[i]).toEqual(eventsTransactions.type);
        console.log('Event => ', eventType[i], ' Validated ');

        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m ' +
            eventsTransactions.type +
            ' Transctions for Paid Payment Start \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
        await expect(eventsTransactions.transactions.length).toEqual(0);
        console.log(
          'No transaction against ' + eventsTransactions.type + ' Event'
        );
      } else {
        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m ' +
            eventType[i] +
            ' entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
      }
    }
  }
}
