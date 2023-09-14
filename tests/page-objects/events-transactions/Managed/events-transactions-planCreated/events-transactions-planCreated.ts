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
    await utility.delay(10000);
    await events_trans_common.getEventsTransactions(
      //get events&Transaction from db
      expectedConfig.planSummary.planID
    );
    await events_trans_common.updateTransactionFee();
    await utility.delay(10000);
    await this.validateEventsTransaction();
  }

  async validateEventsTransaction() {
    let value = false;
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

    if (
      await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCreated'
      )
    ) {
      const eventsTransactions = await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCreated'
      );

      const planCreatedPayload = eventsTransactions.payload;

      const titleArrayEvents = ['Event Name', 'Amount', 'Service Fee'];
      const totalActualAmount = planCreatedPayload.amount;
      const totalActualServideFee = planCreatedPayload.serviceFee;

      const actual = [
        eventsTransactions.type,
        String(await utility.upto2Decimal(totalActualAmount)),
        String(totalActualServideFee),
      ];
      const expected = [
        'PlanCreated',
        await utility.upto2Decimal(expectedJson.planSummary.totalCost),
        expectedJson.fees.TotalServiceFeesExcGST,
      ];
      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArrayEvents,
          'PlanCreated',
          expectedConfig.LocalEnv.applicationName
        );
      }

      console.log('-------------- planCreated Transctions -------------- ');

      const allTransactions = eventsTransactions.transactions;

      let TotalPriceItems = '';
      let ServiceFee = '';
      const totalTransctions = allTransactions.length;
      let TotalDebitAmount = 0;
      let TotalCreditAmount = 0;

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
          'PlanPay Customer Receivable (Managed)'
        ) {
          TotalPriceItems = allTransactions[m].debitAmount;
        } else if (
          allTransactions[m].accountCode ==
          'PlanPay Merchant Liability (Managed)'
        ) {
          TotalPriceItems = allTransactions[m].creditAmount;
        }

        if (
          allTransactions[m].accountCode ==
          'PlanPay Deferred Billing - Service Fees (Managed)'
        ) {
          ServiceFee = allTransactions[m].debitAmount;
        } else if (
          allTransactions[m].accountCode ==
          'PlanPay Deferred Revenue - Service Fees (Managed)'
        ) {
          ServiceFee = allTransactions[m].creditAmount;
        }

        const planID = allTransactions[m].planId;

        const expexctedPlanID = expectedJson.planSummary.planID;
        const expexctedTotalPriceItems = expectedJson.planSummary.totalCost;
        const expexctedServiceFee = expectedJson.fees.TotalServiceFeesExcGST;

        const titleArrayTransctions = ['planId'];
        const actualTransctions = [planID];
        const expectedTransctions = [expexctedPlanID];

        if (allTransactions[m].label == 'Purchase') {
          titleArrayTransctions.push('Total Price Items');
          actualTransctions.push(await utility.upto2Decimal(TotalPriceItems));
          expectedTransctions.push(
            await utility.upto2Decimal(expexctedTotalPriceItems)
          );
        }

        if (allTransactions[m].label == 'Service Fee') {
          titleArrayTransctions.push('Service Fee');
          actualTransctions.push(
            String(await utility.upto2Decimal(ServiceFee))
          );
          expectedTransctions.push(
            await utility.upto2Decimal(expexctedServiceFee)
          );
        }
        titleArrayTransctions.push('currencyCode');
        actualTransctions.push(allTransactions[m].currencyCode);
        expectedTransctions.push(expectedJson.planSummary.checkoutCurrency);

        if (config.LocalEnv.verifyFlag === 'true') {
          await utility.matchValues(
            actualTransctions,
            expectedTransctions,
            titleArrayTransctions,
            'PlanCreatedTransction',
            expectedConfig.LocalEnv.applicationName
          );
        } else {
          await utility.printValues(
            titleArrayTransctions,
            actualTransctions,
            'PlanCreatedTransction'
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
        '%%%%%%%%%%%%%%%%\x1b[35m PlanCreated entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
  }
}
