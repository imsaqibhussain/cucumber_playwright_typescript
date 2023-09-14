import { expect } from '@playwright/test';
import { config } from '../../../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../../../setup/expected/expected-ts.conf';
import { Utilities } from '../../../utilities';
import { eventsTransactionCommon } from '../../events-transaction-common';
//import { PaymentEligibleScheduler } from '../../../page-objects/payment-platform-integration/PaymentEligibleScheduler';
const events_trans_common = new eventsTransactionCommon();
const utility = new Utilities();
//const paymentEligible = new PaymentEligibleScheduler();

export class eventsTransactionsRequest {
  static transctionNotFoundCount: any = 3;
  async eventsTransaction() {
    //await paymentEligible.paymentEligbleScheduler();
    await utility.delay(20000);
    await events_trans_common.getEventsTransactions(
      //get events&Transaction from db
      expectedConfig.planSummary.planID
    );
    await events_trans_common.updateTransactionFee();
    await utility.delay(10000);
    await this.validateEventsTransaction();
  }

  async validateEventsTransaction() {
    const eventType = ['PaymentEligible', 'MerchantPaymentPayable'];
    const titleArrayEvents = ['Event Name'];
    // const titleArrayTransactions = [];
    // const actualTransctions = [];
    // const expectedTransctions = [];

    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );

    for (let i = 0; i < eventType.length; i++) {
      if (
        eventsTransactionsJson.find(
          (item: { type: string; payload: any }) => item.type === eventType[i]
        )
      ) {
        const eventsTransactions = await eventsTransactionsJson.find(
          (item: { type: string; payload: any }) => item.type === eventType[i]
        );

        console.log('Event => ', eventType[i], ' Validating Start');

        const actual = [eventsTransactions.type];
        const expected = [eventType[i]];
        if (config.LocalEnv.verifyFlag === 'true') {
          await utility.matchValues(
            actual,
            expected,
            titleArrayEvents,
            'Eligible Merchant Payable',
            expectedConfig.LocalEnv.applicationName
          );
        } else {
          await utility.printValues(
            titleArrayEvents,
            actual,
            'Eligible Merchant Payable Event '
          );
        }
        await expect(eventType[i]).toEqual(eventsTransactions.type);
        console.log('Event => ', eventType[i], ' Validated ');

        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ', eventType[i], ' Transctions  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%')

        // const allTransactions = eventsTransactions.transactions;
        // const totalTransctions = allTransactions.length;
        // let TotalServiceFeesExcGST = '';
        // let TotalServiceFeesIncGST = '';
        // let MerchantPaymentPayable = '';
        // let TotalDebitAmount = 0;
        // let TotalCreditAmount = 0;

        // console.log('Total Transctions  ', eventType[i], '  => ', totalTransctions)
        // for (let m = 0; m < allTransactions.length; m++) {

        //     TotalDebitAmount += +allTransactions[m].debitAmount;
        //     TotalCreditAmount += +allTransactions[m].creditAmount;
        //     console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions', m + 1, ' Start %%%%%%%%%%%%%%%%%%%%%%%%%%%%% ')
        //     if (eventType[i] == 'PaymentEligible') {

        //         if (allTransactions[m].accountCode == 'Deferred Revenue - Service Fees - Managed') {
        //             TotalServiceFeesExcGST = allTransactions[m].debitAmount;
        //         }
        //         else if (allTransactions[m].accountCode == 'Deferred Billing - Service Fees - Managed') {
        //             TotalServiceFeesExcGST = allTransactions[m].creditAmount;
        //         }

        //         if (allTransactions[m].accountCode == 'Revenue - Service Fees - Managed') {
        //             TotalServiceFeesIncGST = allTransactions[m].creditAmount;
        //         }
        //         else if (allTransactions[m].accountCode == 'Merchant Liability - Managed') {
        //             TotalServiceFeesIncGST = allTransactions[m].debitAmount;
        //         }

        //         const expexctedServiceFeeExcGST = expectedJson.fees.TotalServiceFeesExcGST;
        //         const expexctedServiceFeeIncGST = expectedJson.fees.TotalServiceFeesIncGST;

        //         if (allTransactions[m].accountCode == 'Deferred Revenue - Service Fees - Managed' || allTransactions[m].accountCode == 'Deferred Billing - Service Fees - Managed') {
        //             titleArrayTransactions.push('Total Service Fees ExcGST');
        //             actualTransctions.push(String(TotalServiceFeesExcGST));
        //             expectedTransctions.push(expexctedServiceFeeExcGST);
        //         }

        //         if (allTransactions[m].accountCode == 'Revenue - Service Fees - Managed' || allTransactions[m].accountCode == 'Merchant Liability - Managed') {
        //             titleArrayTransactions.push('Total Service Fees ExcGST');
        //             actualTransctions.push(String(TotalServiceFeesIncGST));
        //             expectedTransctions.push(expexctedServiceFeeIncGST);
        //         }

        //         if (config.LocalEnv.verifyFlag === 'true') {
        //             await utility.matchValues(
        //                 actualTransctions,
        //                 expectedTransctions,
        //                 titleArrayTransactions,
        //                 'Payment Eligible Transction',
        //                 expectedConfig.LocalEnv.applicationName
        //             );
        //         } else {
        //             await utility.printValues(titleArrayTransactions, actualTransctions, 'Transactions - PaymentEligible Event ');
        //         }
        //     }
        //     if (eventType[i] == 'MerchantPaymentPayable') {

        //         if (allTransactions[m].accountCode == 'Merchant Liability - Managed') {
        //             MerchantPaymentPayable = allTransactions[m].debitAmount;
        //             titleArrayTransactions.push('Merchant Liability Debit Amount');
        //         }
        //         else if (allTransactions[m].accountCode == 'Merchant Payable - Managed') {
        //             MerchantPaymentPayable = allTransactions[m].creditAmount;
        //             titleArrayTransactions.push('Merchant Payable Credit Amount');
        //         }

        //         actualTransctions.push(String(MerchantPaymentPayable));
        //         expectedTransctions.push(expectedJson.fees.merchantRevenue);

        //         if (config.LocalEnv.verifyFlag === 'true') {
        //             await utility.matchValues(
        //                 actualTransctions,
        //                 expectedTransctions,
        //                 titleArrayTransactions,
        //                 'Merchan tPayment Payable',
        //                 expectedConfig.LocalEnv.applicationName
        //             );
        //         } else {
        //             await utility.printValues(titleArrayTransactions, actualTransctions, 'Transactions - MerchantPaymentPayable Event ');

        //         }

        //     }
        //     console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions', m + 1, ' End %%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
        // }
        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Total Debit Amount', TotalDebitAmount, '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Total Credit Amount', TotalCreditAmount, '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
        // if (TotalDebitAmount === TotalCreditAmount) {
        //     console.log('%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount \x1b[37m%%%%%%%%%%%%%%%%%%%%%% ')
        // }
        // else {
        //     console.log('%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is not equal to Credit Amount  \x1b[37m%%%%%%%%%%%%%%%%%%%%%% ')
        // }
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
