import { expect } from '@playwright/test';
import { config } from '../../../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../../../setup/expected/expected-ts.conf';
import { Utilities } from '../../../utilities';
import { eventsTransactionCommon } from '../../events-transaction-common';
const events_trans_common = new eventsTransactionCommon();
const utility = new Utilities();

export class eventsTransactionsRequest {
  static transctionNotFoundCount: any = 3;
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
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

    if (
      await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) =>
          item.type === 'RevenueRecognition'
      )
    ) {
      const eventsTransactions = await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) =>
          item.type === 'RevenueRecognition'
      );

      // const planCreatedPayload = eventsTransactions.payload;

      const titleArrayEvents = ['Event Name'];

      const actual = [eventsTransactions.type];
      const expected = ['RevenueRecognition'];
      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArrayEvents,
          'RevenueRecognition',
          expectedConfig.LocalEnv.applicationName
        );
      }

      console.log(
        '-------------- RevenueRecognition Transctions -------------- '
      );

      const allTransactions = eventsTransactions.transactions;

      let serviceFeeTotal = '';
      const totalTransctions = allTransactions.length;
      let TotalDebitAmount = 0;
      let TotalCreditAmount = 0;
      let value = false;

      console.log('Total Transctions => ', totalTransctions);
      if (totalTransctions == 0) {
        while (eventsTransactionsRequest.transctionNotFoundCount > 0) {
          eventsTransactionsRequest.transctionNotFoundCount =
            eventsTransactionsRequest.transctionNotFoundCount - 1;
          await this.eventsTransaction();
        }
        value = true;
      } else {
        value = false;
      }
      await expect(value).toEqual(false);
      for (let m = 0; m < allTransactions.length; m++) {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
          m + 1,
          ' Start %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );

        TotalDebitAmount += +allTransactions[m].debitAmount;
        TotalCreditAmount += +allTransactions[m].creditAmount;

        if (
          allTransactions[m].accountCode ==
          'PlanPay Deferred Revenue - Service Fees (Enterprise)'
        ) {
          serviceFeeTotal = allTransactions[m].debitAmount;
        } else if (
          allTransactions[m].accountCode ==
          'PlanPay Sales - Service Fees (Enterprise)'
        ) {
          serviceFeeTotal = allTransactions[m].creditAmount;
        }
        const titleArrayTransctions = ['Service Fee'];
        const actualTransctions = [
          String(await utility.upto2Decimal(serviceFeeTotal)),
        ];
        const expectedTransctions = [
          await utility.upto2Decimal(expectedJson.fees.TotalServiceFeesExcGST),
        ];

        titleArrayTransctions.push('currencyCode');
        actualTransctions.push(allTransactions[m].currencyCode);
        expectedTransctions.push(expectedJson.planSummary.checkoutCurrency);

        if (config.LocalEnv.verifyFlag === 'true') {
          await utility.matchValues(
            actualTransctions,
            expectedTransctions,
            titleArrayTransctions,
            'RevenueRecognitionTransction',
            expectedConfig.LocalEnv.applicationName
          );
        } else {
          await utility.printValues(
            titleArrayTransctions,
            actualTransctions,
            'RevenueRecognitionTransction'
          );
        }

        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
          m + 1,
          ' End %%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
        );
      }

      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Total Debit Amount',
        TotalDebitAmount,
        '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
      );
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Total Credit Amount',
        TotalCreditAmount,
        '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
      );

      await expect(TotalDebitAmount).toEqual(TotalCreditAmount);
      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    } else {
      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m Revenue Recognition entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
  }
}
