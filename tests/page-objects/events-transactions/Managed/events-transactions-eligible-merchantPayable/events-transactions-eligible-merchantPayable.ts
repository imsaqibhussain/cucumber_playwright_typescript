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
    const titleArrayTransactions = [];
    const actualTransctions = [];
    const expectedTransctions = [];

    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

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

        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ',
          eventType[i],
          ' Transctions  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
        );

        const allTransactions = eventsTransactions.transactions;
        const totalTransctions = allTransactions.length;
        let TotalServiceFeesExcGST = '';
        let TotalServiceFeesIncGST = '';
        let MerchantPaymentPayable = '';
        let TotalDebitAmount = 0;
        let TotalCreditAmount = 0;
        let value = false;
        console.log(
          'Total Transctions  ',
          eventType[i],
          '  => ',
          totalTransctions
        );
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
          TotalDebitAmount += +allTransactions[m].debitAmount;
          TotalCreditAmount += +allTransactions[m].creditAmount;
          console.log(
            '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
            m + 1,
            ' Start %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
          );
          if (eventType[i] == 'PaymentEligible') {
            if (expectedJson.planSummary.planStatus === 'Cancelled') {
              if (
                allTransactions[m].accountCode ==
                'PlanPay Deferred Revenue - Service Fees (Managed)'
              ) {
                TotalServiceFeesExcGST = allTransactions[m].debitAmount;
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Deferred Billing - Service Fees (Managed)'
              ) {
                TotalServiceFeesExcGST = allTransactions[m].creditAmount;
              }

              if (
                allTransactions[m].accountCode ==
                'PlanPay Sales - Service Fees (Managed)'
              ) {
                TotalServiceFeesIncGST = allTransactions[m].creditAmount;
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Liability (Managed)'
              ) {
                TotalServiceFeesIncGST = allTransactions[m].debitAmount;
              }
              const expexctedServiceFeeExcGST =
                expectedJson.fees.TotalServiceFeesExcGST;
              // const ServiceFeesExcGSTonPaid = Number(
              //   expectedJson.fees.ServiceFeesExcGSTonPaid
              // );

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Deferred Revenue - Service Fees (Managed)' ||
                allTransactions[m].accountCode ==
                  'PlanPay Deferred Billing - Service Fees (Managed)'
              ) {
                titleArrayTransactions.push('Total Service Fees ExcGST');
                actualTransctions.push(
                  String(await utility.upto2Decimal(TotalServiceFeesExcGST))
                );
                expectedTransctions.push(
                  await utility.upto2Decimal(expexctedServiceFeeExcGST)
                );
              }

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Sales - Service Fees (Managed)' ||
                allTransactions[m].accountCode ==
                  'PlanPay Merchant Liability (Managed)'
              ) {
                titleArrayTransactions.push('Total Service Fees ExcGST');
                actualTransctions.push(
                  String(await utility.upto2Decimal(TotalServiceFeesIncGST))
                );
                expectedTransctions.push(
                  await utility.upto2Decimal(
                    Math.round(
                      (Number(expexctedServiceFeeExcGST) + Number.EPSILON) * 100
                    ) / 100
                  )
                );
              }
            }
            if (
              expectedJson.planSummary.planStatus === 'Completed' ||
              (expectedJson.planSummary.planStatus === 'Cancelled' &&
                expectedJson.flags.PaymentEligible == 'true')
            ) {
              if (
                allTransactions[m].accountCode ==
                'PlanPay Deferred Revenue - Service Fees (Managed)'
              ) {
                TotalServiceFeesExcGST = allTransactions[m].debitAmount;
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Deferred Billing - Service Fees (Managed)'
              ) {
                TotalServiceFeesExcGST = allTransactions[m].creditAmount;
              }

              if (
                allTransactions[m].accountCode ==
                'PlanPay Sales - Service Fees (Managed)'
              ) {
                TotalServiceFeesIncGST = allTransactions[m].creditAmount;
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Liability (Managed)'
              ) {
                TotalServiceFeesIncGST = allTransactions[m].debitAmount;
              }
              const expexctedServiceFeeExcGST =
                expectedJson.fees.TotalServiceFeesExcGST;
              //const ServiceFeesExcGSTonPaid = expectedJson.fees.ServiceFeesExcGSTonPaid;

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Deferred Revenue - Service Fees (Managed)' ||
                allTransactions[m].accountCode ==
                  'PlanPay Deferred Billing - Service Fees (Managed)'
              ) {
                titleArrayTransactions.push('Total Service Fees ExcGST');
                actualTransctions.push(
                  String(await utility.upto2Decimal(TotalServiceFeesExcGST))
                );
                expectedTransctions.push(
                  await utility.upto2Decimal(expexctedServiceFeeExcGST)
                );
              }

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Sales - Service Fees (Managed)' ||
                allTransactions[m].accountCode ==
                  'PlanPay Merchant Liability (Managed)'
              ) {
                titleArrayTransactions.push('Total Service Fees ExcGST');
                actualTransctions.push(
                  String(await utility.upto2Decimal(TotalServiceFeesIncGST))
                );
                expectedTransctions.push(
                  await utility.upto2Decimal(TotalServiceFeesExcGST)
                );
              }
            }

            if (config.LocalEnv.verifyFlag === 'true') {
              await utility.matchValues(
                actualTransctions,
                expectedTransctions,
                titleArrayTransactions,
                'Payment Eligible Transction',
                expectedConfig.LocalEnv.applicationName
              );
            } else {
              await utility.printValues(
                titleArrayTransactions,
                actualTransctions,
                'Transactions - PaymentEligible Event '
              );
            }
          }
          if (eventType[i] == 'MerchantPaymentPayable') {
            if (
              expectedJson.planSummary.planStatus === 'Cancelled' &&
              expectedJson.cancellationDetails.refundType === 'Partial' &&
              expectedJson.flags.PaymentEligible == 'false'
            ) {
              if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Liability (Managed)'
              ) {
                MerchantPaymentPayable = allTransactions[m].debitAmount;
                titleArrayTransactions.push(
                  'PlanPay Merchant Liability (Managed) -  Debit Amount'
                );
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Payable (Managed)'
              ) {
                MerchantPaymentPayable = allTransactions[m].creditAmount;
                titleArrayTransactions.push(
                  'PlanPay Merchant Payable (Managed) - Cridt Amount'
                );
              }
              // const allPaidPayments = expectedJson.paidPayments;
              // let totalPaidMerchantTransactionFeeCancelPartial = 0;

              // for (let k = 0; k < allPaidPayments.length; k++) {
              //   totalPaidMerchantTransactionFeeCancelPartial +=
              //     allPaidPayments[k].MerchantTransactionFee;
              // }

              // const MerchantPayableManaged =
              //   expectedJson.planSummary.totalFunds -
              //   expectedJson.cancellationDetails.ActualRefundAmountUI -
              //   expectedJson.fees.ServiceFeesExcGSTonPaid -
              //   totalPaidMerchantTransactionFeeCancelPartial;

              actualTransctions.push(
                await utility.upto2Decimal(String(MerchantPaymentPayable))
              );
              expectedTransctions.push(
                await utility.upto2Decimal(
                  String(expectedJson.fees.merchantRevenue)
                )
              );
            }
            if (
              expectedJson.planSummary.planStatus === 'Cancelled' &&
              expectedJson.cancellationDetails.refundType === 'Full' &&
              expectedJson.flags.PaymentEligible == 'false'
            ) {
              if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Payable (Managed)'
              ) {
                actualTransctions.push(String(allTransactions[m].debitAmount));
                titleArrayTransactions.push('Merchant Liability Debit Amount');
              } else if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Liability (Managed)'
              ) {
                actualTransctions.push(String(allTransactions[m].creditAmount));
                titleArrayTransactions.push(
                  'PlanPay Merchant Payable (Managed)'
                );
              }
              const allPaidPayments = expectedJson.paidPayments;
              let totalPaidMerchantTransactionFeeCancelFull = 0;
              for (let k = 0; k < allPaidPayments.length; k++) {
                totalPaidMerchantTransactionFeeCancelFull +=
                  allPaidPayments[k].MerchantTransactionFee;
              }

              expectedTransctions.push(
                String(totalPaidMerchantTransactionFeeCancelFull)
              );
            }

            if (
              expectedJson.planSummary.planStatus === 'Completed' ||
              (expectedJson.planSummary.planStatus === 'Cancelled' &&
                expectedJson.flags.PaymentEligible == 'true')
            ) {
              const allPaidPayments = expectedJson.paidPayments;
              let totalPaidMerchantTransactionFee = 0;

              for (let k = 0; k < allPaidPayments.length; k++) {
                totalPaidMerchantTransactionFee +=
                  allPaidPayments[k].MerchantTransactionFee;
              }

              const merchantPayableAmount =
                expectedJson.planSummary.totalFunds -
                expectedJson.fees.TotalServiceFeesExcGST -
                totalPaidMerchantTransactionFee;

              if (
                allTransactions[m].accountCode ==
                'PlanPay Merchant Liability (Managed)'
              ) {
                MerchantPaymentPayable = allTransactions[m].debitAmount;
                titleArrayTransactions.push('Merchant Liability Debit Amount');
                actualTransctions.push(String(MerchantPaymentPayable));
                expectedTransctions.push(String(merchantPayableAmount));
              }

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Merchant Payable (Managed)' &&
                allTransactions[m].creditAmount == 0
              ) {
                MerchantPaymentPayable = allTransactions[m].debitAmount;
                titleArrayTransactions.push(
                  'PlanPay Merchant Payable (Managed)'
                );

                actualTransctions.push(
                  await utility.upto2Decimal2(Number(MerchantPaymentPayable))
                );

                if (expectedJson.cancellationDetails.refundType === 'Full') {
                  const refundAmount =
                    Number(expectedJson.fees.totalMerchantTransactionFee) +
                    Number(expectedJson.fees.TotalServiceFeesExcGST);
                  expectedTransctions.push(
                    await utility.upto2Decimal2(Number(refundAmount))
                  );
                } else {
                  expectedTransctions.push(
                    await utility.upto2Decimal2(
                      Number(expectedJson.fees.planPayFeesSoFar)
                    )
                  );
                }
              }

              if (
                allTransactions[m].accountCode ==
                  'PlanPay Merchant Payable (Managed)' &&
                allTransactions[m].debitAmount == 0
              ) {
                MerchantPaymentPayable = allTransactions[m].creditAmount;
                titleArrayTransactions.push(
                  'PlanPay Merchant Payable (Managed)'
                );

                actualTransctions.push(
                  await utility.upto2Decimal(String(MerchantPaymentPayable))
                );
                expectedTransctions.push(
                  String(expectedJson.planSummary.totalCost)
                );
              }
            }

            // titleArrayTransactions.push('currencyCode');
            // actualTransctions.push(allTransactions[m].currencyCode);
            // expectedTransctions.push(expectedJson.planSummary.checkoutCurrency);

            if (config.LocalEnv.verifyFlag === 'true') {
              await utility.matchValues(
                actualTransctions,
                expectedTransctions,
                titleArrayTransactions,
                'Merchan tPayment Payable',
                expectedConfig.LocalEnv.applicationName
              );
            } else {
              await utility.printValues(
                titleArrayTransactions,
                actualTransctions,
                'Transactions - MerchantPaymentPayable Event '
              );
            }
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
          '%%%%%%%%%%%%%%%%\x1b[35m ' +
            eventType[i] +
            ' entry is not available in database \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
      }
    }
  }
}
