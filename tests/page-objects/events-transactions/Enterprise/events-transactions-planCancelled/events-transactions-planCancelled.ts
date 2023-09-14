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
          expectedJson.flags.PaymentEligible == 'true' &&
          expectedJson.planSummary.planStatus == 'Cancelled'
        ) {
          if (expectedJson.cancellationDetails.refundType === 'Partial') {
            const totalWithoutMerchantNonRefundAmount =
              Number(expectedJson.cancellationDetails.ActualRefundAmountUI) +
              Number(expectedJson.planSummary.remainingAmount);
            if (
              allTransactions[m].accountCode ==
              'PlanPay Customer Receivable (Enterprise)'
            ) {
              MerchantLiability = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Customer Receivable (Enterprise) - Credit Amount'
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
              'PlanPay Merchant Deposit (Enterprise)'
            ) {
              CashClearing = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Merchant Deposit (Enterprise) -  Debit Amount'
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
          }
          if (expectedJson.cancellationDetails.refundType === 'Full') {
            if (
              allTransactions[m].accountCode ==
              'PlanPay Sales - Service Fees (Enterprise)'
            ) {
              MerchantLiability = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Sales - Service Fees (Enterprise) - Debit Amount'
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
              'PlanPay Accounts Receivable (Enterprise)'
            ) {
              MerchantLiability = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Accounts Receivable (Enterprise) - Credit Amount'
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
          let actualDepositAdjustment = 0;
          let actualTotalExpectedServiceFee = 0;
          let actualUnpaidServiceFees = 0;
          let actualPaidServiceFees = 0;

          if (expectedJson.cancellationDetails.refundType === 'Partial') {
            if (
              allTransactions[m].accountCode ==
              'PlanPay Merchant Deposit (Enterprise)'
            ) {
              actualDepositAdjustment = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Merchant Deposit (Enterprise) - Debit Amount test'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualDepositAdjustment)
              );

              if (expectedJson.planSummary.noOfInstallmentsToBePaid > 0) {
                expectedTransctions.push(
                  expectedJson.planSummary.remainingAmount
                );
              } else {
                expectedTransctions.push(
                  await utility.upto2Decimal(
                    expectedJson.cancellationDetails.ActualRefundAmountUI
                  )
                );
              }
            }

            if (
              allTransactions[m].accountCode ==
              'PlanPay Customer Receivable (Enterprise)'
            ) {
              actualDepositAdjustment = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Customer Receivable (Enterprise) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualDepositAdjustment)
              );
              if (expectedJson.planSummary.noOfInstallmentsToBePaid > 0) {
                expectedTransctions.push(
                  expectedJson.planSummary.remainingAmount
                );
              } else {
                expectedTransctions.push(
                  await utility.upto2Decimal(
                    expectedJson.cancellationDetails.ActualRefundAmountUI
                  )
                );
              }
            }

            if (
              allTransactions[m].accountCode ==
              'PlanPay Deferred Revenue - Service Fees (Enterprise)'
            ) {
              actualTotalExpectedServiceFee = allTransactions[m].debitAmount;
              titleArrayTransctions.push(
                'PlanPay Deferred Revenue - Service Fees (Enterprise) - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualTotalExpectedServiceFee)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.TotalServiceFeesExcGST
                )
              );
            }

            if (
              allTransactions[m].accountCode ==
              'PlanPay Deferred Billing - Service Fees (Enterprise)'
            ) {
              actualUnpaidServiceFees = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Deferred Billing - Service Fees (Enterprise) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualUnpaidServiceFees)
              );

              expectedTransctions.push(
                await utility.upto2Decimal(
                  (await Math.round(
                    (expectedJson.fees.TotalServiceFeesExcGST -
                      expectedJson.fees.ServiceFeesExcGSTonPaid +
                      Number.EPSILON) *
                      100
                  )) / 100
                )
              );
            }

            if (
              allTransactions[m].accountCode ==
              'PlanPay Sales - Service Fees (Enterprise)'
            ) {
              actualPaidServiceFees = allTransactions[m].creditAmount;
              titleArrayTransctions.push(
                'PlanPay Sales - Service Fees (Enterprise) - Credit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualPaidServiceFees)
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.ServiceFeesExcGSTonPaid
                )
              );
            }
          }

          if (expectedJson.cancellationDetails.refundType === 'Full') {
            if (
              allTransactions[m].accountCode ===
              'PlanPay Merchant Deposit (Enterprise)'
            ) {
              actualDepositAdjustment = allTransactions[m].debitAmount;
            } else if (
              allTransactions[m].accountCode ===
              'PlanPay Customer Receivable (Enterprise)'
            ) {
              actualDepositAdjustment = allTransactions[m].creditAmount;
            }

            if (
              allTransactions[m].accountCode ===
                'PlanPay Merchant Deposit (Enterprise)' ||
              allTransactions[m].accountCode ===
                'PlanPay Customer Receivable (Enterprise)'
            ) {
              titleArrayTransctions.push(
                'PlanPay Merchant Deposit (Enterprise) - Debit Amount'
              );
              actualTransctions.push(
                await utility.upto2Decimal(actualDepositAdjustment)
              );
              if (expectedJson.planSummary.noOfInstallmentsToBePaid > 0) {
                expectedTransctions.push(
                  expectedJson.planSummary.remainingAmount
                );
              } else {
                expectedTransctions.push(
                  await utility.upto2Decimal(
                    expectedJson.cancellationDetails.ActualRefundAmountUI
                  )
                );
              }
            }

            if (
              allTransactions[m].accountCode ===
              'PlanPay Deferred Billing - Service Fees (Enterprise)'
            ) {
              actualPaidServiceFees = allTransactions[m].debitAmount;
            } else if (
              allTransactions[m].accountCode ===
              'PlanPay Accounts Receivable (Enterprise)'
            ) {
              actualPaidServiceFees = allTransactions[m].creditAmount;
            }

            if (
              allTransactions[m].accountCode ===
                'PlanPay Deferred Billing - Service Fees (Enterprise)' ||
              allTransactions[m].accountCode ===
                'PlanPay Accounts Receivable (Enterprise)'
            ) {
              titleArrayTransctions.push(
                'PlanPay Deferred Billing - Service Fees (Enterprise) - this is testing'
              );
              actualTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.ServiceFeesExcGSTonPaid
                )
              );
              expectedTransctions.push(
                String(
                  await utility.upto2Decimal(
                    expectedJson.fees.ServiceFeesExcGSTonPaid
                  )
                )
              );
            }

            if (
              allTransactions[m].accountCode ===
              'PlanPay Deferred Revenue - Service Fees (Enterprise)'
            ) {
              actualTotalExpectedServiceFee = allTransactions[m].debitAmount;
            } else if (
              allTransactions[m].accountCode ===
              'PlanPay Deferred Billing - Service Fees (Enterprise)'
            ) {
              actualTotalExpectedServiceFee = allTransactions[m].creditAmount;
            }

            if (
              allTransactions[m].accountCode ===
                'PlanPay Deferred Revenue - Service Fees (Enterprise)' ||
              allTransactions[m].accountCode ===
                'PlanPay Deferred Billing - Service Fees (Enterprise)'
            ) {
              titleArrayTransctions.push(
                'PlanPay Deferred Billing - Service Fees (Enterprise)'
              );
              actualTransctions.push(
                await utility.upto2Decimal(
                  expectedJson.fees.TotalServiceFeesExcGST
                )
              );
              expectedTransctions.push(
                String(
                  await utility.upto2Decimal(
                    expectedJson.fees.TotalServiceFeesExcGST
                  )
                )
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
            'Plan Cancel',
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
