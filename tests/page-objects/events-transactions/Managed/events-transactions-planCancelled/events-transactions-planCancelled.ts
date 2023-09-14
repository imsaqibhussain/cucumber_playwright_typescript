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

    if (expectedJson.planSummary.planStatus == 'Cancelled') {
      await events_trans_common.getEventsTransactions(
        //get events&Transaction from db
        expectedConfig.planSummary.planID
      );
      await events_trans_common.updateTransactionFee();
      await utility.delay(10000);
      await this.validateEventsTransaction();
    } else {
      console.log('\x1b[33m Plan Status is not set as Cancelled \x1b[37m');
    }
  }

  async validateEventsTransaction() {
    const titleArray = ['Amount', 'Refund Type'];

    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

    if (
      await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCancelled'
      )
    ) {
      const eventsTransactions = await eventsTransactionsJson.find(
        (item: { type: string; payload: any }) => item.type === 'PlanCancelled'
      );

      console.log('Event => PlanCancelled Validation Start');

      const planCancelled = eventsTransactions.payload;
      const paidAmount = planCancelled.amount;
      const refundType = planCancelled.refundType;

      console.log('Paid Amount=> ', paidAmount);
      console.log('Refund Type => ', refundType);

      const actual = [
        String(await utility.upto2Decimal(paidAmount)),
        refundType,
      ];
      const expected = [
        expectedJson.cancellationDetails.ActualRefundAmountUI,
        expectedJson.cancellationDetails.refundType,
      ];

      console.log('actual', actual);
      console.log('expected', expected);

      if (config.LocalEnv.verifyFlag === 'true') {
        await utility.matchValues(
          actual,
          expected,
          titleArray,
          'Plan Cancelled',
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        await utility.printValues(titleArray, actual, 'Plan Cancelled Event ');
      }

      await expect('PlanCancelled').toEqual(eventsTransactions.type);
      console.log('Event => Plan Cancelled  Validated ');

      console.log('-------------- Plan Cancelled Transctions -------------- ');

      const allTransactions = eventsTransactions.transactions;

      let MerchantLiability = '';
      let CashClearing = '';
      let value = false;
      // let CustomerReceivable = '';
      const totalTransctions = allTransactions.length;

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
      const titleArrayTransctions = [];
      const actualTransctions = [];
      const expectedTransctions = [];
      let TotalDebitAmount = 0;
      let TotalCreditAmount = 0;
      for (let m = 0; m < allTransactions.length; m++) {
        TotalDebitAmount += +allTransactions[m].debitAmount;
        TotalCreditAmount += +allTransactions[m].creditAmount;

        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
          m + 1,
          ' Start %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
        );

        if (
          expectedJson.flags.PaymentEligible == 'false' &&
          expectedJson.planSummary.planStatus == 'Cancelled'
        ) {
          if (expectedJson.cancellationDetails.refundType === 'Partial') {
            const totalWithoutMerchantNonRefundAmount =
              Number(expectedJson.cancellationDetails.ActualRefundAmountUI) +
              Number(expectedJson.planSummary.remainingAmount);
            let refundPartisalPaymentDue =
              expectedJson.planSummary.totalCost -
              expectedJson.planSummary.totalFunds;

            if (
              allTransactions[m].accountCode ==
              'PlanPay Merchant Liability (Managed)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Merchant Liability (Managed) - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(totalWithoutMerchantNonRefundAmount)
              );
            }
            if (
              allTransactions[m].accountCode ==
              'Cash Clearing - Customer Refunds (Managed)'
            ) {
              CashClearing = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'Cash Clearing - Customer Refunds (Managed) - Credit Amount'
              );
              actualTransctions.push(await utility.upto2Decimal(CashClearing));
              expectedTransctions.push(
                String(
                  await utility.upto2Decimal(
                    expectedJson.cancellationDetails.ActualRefundAmountUI
                  )
                )
              );
            }

            if (
              allTransactions[m].accountCode ==
              'PlanPay Customer Receivable (Managed)'
            ) {
              CashClearing = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Customer Receivable (Managed) - Credit Amount'
              );
              actualTransctions.push(await utility.upto2Decimal(CashClearing));
              expectedTransctions.push(
                String(
                  await utility.upto2Decimal(
                    (refundPartisalPaymentDue =
                      (await Math.round(
                        (refundPartisalPaymentDue + Number.EPSILON) * 100
                      )) / 100)
                  )
                )
              );
            }
          }
          if (expectedJson.cancellationDetails.refundType === 'Full') {
            if (
              allTransactions[m].accountCode ==
              'PlanPay Merchant Liability (Managed)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Merchant Liability (Managed) - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(expectedJson.planSummary.totalCost)
              );
            }
            if (
              allTransactions[m].accountCode ==
              'Cash Clearing - Customer Refunds (Managed)'
            ) {
              MerchantLiability = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'Cash Clearing - Customer Refunds (Managed) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(expectedJson.planSummary.totalFunds)
              );
            }
            if (
              allTransactions[m].accountCode ==
              'PlanPay Customer Receivable (Managed)'
            ) {
              MerchantLiability = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Customer Receivable (Managed) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.planSummary.remainingAmount
                )
              );
            }
            if (
              allTransactions[m].accountCode ==
              'PlanPay Deferred Revenue - Service Fees (Managed)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Deferred Revenue - Service Fees (Managed) - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.TotalServiceFeesExcGST
                )
              );
            }
            if (
              allTransactions[m].accountCode ==
              'PlanPay Deferred Billing - Service Fees (Managed)'
            ) {
              MerchantLiability = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Deferred Billing - Service Fees (Managed) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.TotalServiceFeesExcGST
                )
              );
            }
          }
        } else {
          let expectedMerchantLiability = 0;
          if (expectedJson.cancellationDetails.refundType === 'Partial') {
            if (
              allTransactions[m].accountCode ==
              'PlanPay Merchant Payable (Managed)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'Merchant Liability - Managed - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.cancellationDetails.ActualRefundAmountUI
                )
              );
            }
            if (
              allTransactions[m].accountCode ==
              'Cash Clearing - Customer Funds - Managed'
            ) {
              CashClearing = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'Cash Clearing - Customer Funds - Managed - Credit Amount'
              );
              actualTransctions.push(await utility.upto2Decimal(CashClearing));
              expectedTransctions.push(
                String(expectedJson.cancellationDetails.ActualRefundAmountUI)
              );
            }
          }

          if (expectedJson.cancellationDetails.refundType === 'Full') {
            expectedMerchantLiability =
              expectedJson.planSummary.totalCost -
              expectedJson.fees.TotalServiceFeesExcGST;
            if (
              allTransactions[m].accountCode ==
              'PlanPay Merchant Payable (Managed)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push('Payment Refund - Debit Amount');
              actualTransctions.push(
                await utility.upto2Decimal(MerchantLiability)
              );

              expectedTransctions.push(
                String(
                  await utility.upto2Decimal(
                    (expectedMerchantLiability =
                      (await Math.round(
                        (expectedMerchantLiability + Number.EPSILON) * 100
                      )) / 100)
                  )
                )
              );
            }
            if (
              allTransactions[m].accountCode ==
              'PlanPay Sales - Service Fees (Managed)'
            ) {
              CashClearing = allTransactions[m].debitAmount;
              titleArrayTransctions.push('Service Fee Refund - Credit Amount');
              actualTransctions.push(String(CashClearing));
              expectedTransctions.push(
                String(expectedJson.fees.TotalServiceFeesExcGST)
              );
            }
            if (
              allTransactions[m].accountCode ==
              'Cash Clearing - Customer Refunds (Managed)'
            ) {
              CashClearing = allTransactions[m].creditAmount;
              titleArrayTransctions.push('Payment Refund - Credit Amount');
              actualTransctions.push(await utility.upto2Decimal(CashClearing));
              expectedTransctions.push(
                String(expectedJson.planSummary.totalCost)
              );
            }
          }
        }
        titleArrayTransctions.push('currencyCode');
        actualTransctions.push(allTransactions[m].currencyCode);
        expectedTransctions.push(expectedJson.planSummary.checkoutCurrency);
        if (config.LocalEnv.verifyFlag === 'true') {
          await utility.matchValues(
            actualTransctions,
            expectedTransctions,
            titleArrayTransctions,
            'Customer Payment Succeeded',
            expectedConfig.LocalEnv.applicationName
          );
        }

        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
          m + 1,
          ' End %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
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
      if (TotalDebitAmount === TotalCreditAmount) {
        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
      } else {
        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is not equal to Credit Amount  \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
      }
    } else {
      console.log(
        '%%%%%%%%%%%%%%%%\x1b[35m PlanCancelled entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
      );
    }
  }
}
