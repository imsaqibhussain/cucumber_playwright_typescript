import { expect } from '@playwright/test';
import { expectedConfig } from '../../../../setup/expected/expected-ts.conf';
import { Utilities } from '../../../utilities';
import { eventsTransactionCommon } from '../../events-transaction-common';
const events_trans_common = new eventsTransactionCommon();
const utility = new Utilities();

export class eventsTransactionsRequest {
  async eventsTransaction() {
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    if (expectedJson.planSummary.planStatus == 'Completed') {
      await events_trans_common.getEventsTransactions(
        //get events&Transaction from db
        expectedConfig.planSummary.planID
      );
      await utility.delay(10000);
      await events_trans_common.updateTransactionFee();
      await utility.delay(10000);
      await this.validateEventsTransaction();
    } else {
      console.log('\x1b[33m Plan Status is not set as Completed \x1b[37m');
    }
  }
  async validateEventsTransaction() {
    console.log('*******here****************');
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    if (
      await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCompleted'
      )
    ) {
      const eventsTransactions = await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCompleted'
      );
      console.log('PlanCompleted Validation Started!...');
      await expect('PlanCompleted').toEqual(eventsTransactions.type);

      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m ' +
          eventsTransactions.type +
          ' Transctions for Paid Payment Start \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
      await expect(eventsTransactions.transactions.length).toEqual(0);
      console.log(
        'No transaction against ' + eventsTransactions.type + ' Event'
      );

      console.log(
        '\u001b[1;32mPlan Compeleted Event Validated Successfully!..\u001b[1;37m.'
      );
    } else {
      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m PlanCompleted entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
  }
}
