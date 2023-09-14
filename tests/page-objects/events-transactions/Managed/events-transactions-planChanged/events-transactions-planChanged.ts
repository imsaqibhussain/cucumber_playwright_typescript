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
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    if (expectedJson.planSummary.planStatus == 'On Schedule') {
      await utility.delay(10000);
      await events_trans_common.getEventsTransactions(
        //get events&Transaction from db
        expectedConfig.planSummary.planID
      );
      await events_trans_common.updateTransactionFee();
      await utility.delay(10000);
      await this.validateEventsTransaction();
    } else {
      console.log(
        '\x1b[33m Plan is Already Complated. Plancganged Event Is Not Available. \x1b[37m'
      );
    }
  }

  async validateEventsTransaction() {
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    let value = false;
    // let numberOfInstalment:any;
    // numberOfInstalment=expectedJson.planSummary.numberOfInstalment;
    // if( expectedConfig.LocalEnv.operationType == 'skip-instalment'){
    //   numberOfInstalment=expectedJson.planSummary.skippedInstalments;
    // }
    if (
      await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) =>
          item.type === 'PlanChanged' &&
          expectedJson.planSummary.numberOfInstalment ==
            item.payload.output.installmentNumber
        //   &&
        // expectedJson.planSummary.installmentAmount ==
        //   item.payload.output.installmentAmount
      )
    ) {
      value = true;
      const eventsTransactions = await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) =>
          item.type === 'PlanChanged' &&
          expectedJson.planSummary.numberOfInstalment ==
            item.payload.output.installmentNumber &&
          expectedJson.planSummary.installmentAmount ==
            item.payload.output.installmentAmount
      );

      console.log('eventsTransactions', eventsTransactions);

      const PlanChangedPayload = eventsTransactions.payload;

      const titleArrayEvents = [
        'Event Name',
        'Installment Amount',
        'Number Of Instalment',
        'Frequency',
        'Completion Date',
        'Payments From',
        'Remaining Balance',
      ];

      const actual = [
        eventsTransactions.type,
        String(
          await utility.upto2Decimal(
            PlanChangedPayload.output.installmentAmount
          )
        ),
        String(PlanChangedPayload.output.installmentNumber),
        String(PlanChangedPayload.frequency),
        String(await utility.formatDate(PlanChangedPayload.completionDate)),
        String(await utility.formatDate(PlanChangedPayload.paymentsFrom)),
        String(await utility.upto2Decimal(PlanChangedPayload.remainingBalance)),
      ];

      const expected = [
        'PlanChanged',
        await utility.upto2Decimal(expectedJson.UpcomingPayments[0].amount),
        expectedJson.planSummary.numberOfInstalment,
        expectedJson.planSummary.installmentPeriod,
        expectedJson.planSummary.completionDate,
        expectedJson.planSummary.paymentsFrom,
        await utility.upto2Decimal(expectedJson.planSummary.remainingAmount),
      ];

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArrayEvents,
          'PlanChanged',
          expectedConfig.LocalEnv.applicationName
        );
      }
    } else {
      while (eventsTransactionsRequest.transctionNotFoundCount > 0) {
        eventsTransactionsRequest.transctionNotFoundCount =
          eventsTransactionsRequest.transctionNotFoundCount - 1;
        await this.eventsTransaction();
      }
      value = false;
      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m PlanChanged entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
    await expect(value).toEqual(true);
  }
}
