/* eslint-disable no-case-declarations */
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
    const merchantConfiguration = await utility.commonJsonReadFunc('jsonFile'); //reading merchant config file
    const eventType = [
      'CustomerPaymentDue',
      'CustomerPaymentRequested',
      'CustomerPaymentSucceeded',
    ];
    // const titleArray = ['Amount', 'Installment No'];

    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );

    const expectedJson = await utility.commonJsonReadFunc('expectedFile');

    for (let x = 0; x < expectedJson.paidPayments.length; x++) {
      for (let i = 0; i < eventType.length; i++) {
        // const titleArray = ['Amount', 'Installment No', 'Date'];
        const titleArray = ['Amount', 'Installment No', 'Payment Type'];

        if (
          await eventsTransactionsJson.find(
            (item: { type: string; payload: any }) =>
              item.type === eventType[i] && item.payload.instalmentNo == x + 1
          )
        ) {
          const eventsTransactions = await eventsTransactionsJson.find(
            (item: { type: string; payload: any }) =>
              item.type === eventType[i] && item.payload.instalmentNo == x + 1
          );

          console.log(
            '\x1b[33m Event => ',
            eventType[i],
            ' Validating Start \x1b[37m'
          );

          const CustomerPaymentSucceeded = eventsTransactions.payload;
          const paidAmount = CustomerPaymentSucceeded.amount;
          const paidNumber = CustomerPaymentSucceeded.instalmentNo;
          const paymentType = CustomerPaymentSucceeded.paymentType;
          // const paidDate = await utility.formatDate(
          //   eventsTransactions.createdAt
          // );
          const paidDate = await utility.convertUTCDateIntoLocal(
            eventsTransactions.createdAt
          );

          console.log('Paid Amount=> ', paidAmount);
          console.log('Paid instalment No => ', paidNumber);
          console.log('Paid Date => ', paidDate);
          console.log('paymentType =>', paymentType);

          const actual = [
            await utility.upto2Decimal(paidAmount),
            paidNumber,
            paymentType,
            // paidDate,
          ];

          // const expexctedAmount = String(await utility.upto2Decimal(Number(expectedJson.paidPayments[x].amount) + Number(expectedJson.paidPayments[x].remainder)));
          const expexctedAmount = expectedJson.paidPayments[x].amount;
          const expexctedInstallmentNo = x + 1;
          const expectedPaymentType = expectedJson.paidPayments[x].paymentType;
          // const expexctedDate = expectedJson.paidPayments[x].date;

          const expected = [
            expexctedAmount,
            expexctedInstallmentNo,
            expectedPaymentType,
            // expexctedDate,
          ];
          if (eventType[i] == 'CustomerPaymentSucceeded') {
            await titleArray.push('Payment Platform Vendor');
            await expected.push(
              merchantConfiguration.merchant.MerchantPaymentPlatform[0].vendor
            );
            await actual.push(
              CustomerPaymentSucceeded.paymentMetaData.paymentPlatformVendor
            );
          }
          if (x == 0) {
            let Remainder = String(CustomerPaymentSucceeded.includedRemainder);
            if (Remainder.includes('.') == false) {
              Remainder = Remainder + '.00';
            } else {
              Remainder = await utility.upto2Decimal(Remainder);
            }
            await actual.push(Remainder);
            await expected.push(expectedJson.paidPayments[x].remainder);
            await titleArray.push('Remainder');
          }

          if (
            config.LocalEnv.verifyFlag === 'true' &&
            eventType[i] == 'CustomerPaymentSucceeded'
          ) {
            await utility.matchValues(
              actual,
              expected,
              titleArray,
              eventType[i],
              expectedConfig.LocalEnv.applicationName
            );
          } else {
            await utility.printValues(
              titleArray,
              actual,
              'Customer Payment Succeeded Event '
            );
          }
          if (eventType[i] != 'CustomerPaymentDue') {
            console.log(
              '\x1b[34m	Payment Meta Data =>\x1b[37m',
              CustomerPaymentSucceeded.paymentMetaData
            );
          }

          await expect(eventType[i]).toEqual(eventsTransactions.type);
          console.log('Event => ', eventType[i], ' Validated ');
          let value = false;
          switch (eventsTransactions.type) {
            case 'CustomerPaymentSucceeded':
              console.log(
                '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Customer Payment Succeeded Transctions for Paid Payment ',
                x + 1,
                ' Start \x1b[37m %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
              );
              const allTransactions = eventsTransactions.transactions;
              let TotalAmount = '';
              let TransactionFeeActual = '';
              let TransactionFeeMerchant = '';
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
                console.log(
                  '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Transctions',
                  m + 1,
                  ' Start %%%%%%%%%%%%%%%%%%%%%%%%%%%%% '
                );

                TotalDebitAmount += +allTransactions[m].debitAmount;
                TotalCreditAmount += +allTransactions[m].creditAmount;

                // const expexctedTotalPriceItems =
                // String(await utility.upto2Decimal(Number(expectedJson.paidPayments[x].amount) + Number(expectedJson.paidPayments[x].remainder)));
                const expexctedTotalPriceItems =
                  expectedJson.paidPayments[x].amount;
                const expexctedPaymentGatewayFee =
                  expectedJson.paidPayments[x].paymentGatewayFee;
                // const expexctedServiceFeesExcGSTonPaid =
                //   expectedJson.fees.ServiceFeesExcGSTonPaid;

                const expexctedServiceFeesExcGSTonPaid =
                  expectedJson.paidPayments[x].serviceFee;

                if (
                  allTransactions[m].accountCode ==
                  'PlanPay Merchant Deposit (Enterprise)'
                ) {
                  TotalAmount = allTransactions[m].debitAmount;
                  titleArrayTransctions.push(
                    'PlanPay Merchant Deposit (Enterprise) - Debit Amount'
                  );
                  actualTransctions.push(
                    await utility.upto2Decimal(TotalAmount)
                  );
                  expectedTransctions.push(
                    String(await utility.upto2Decimal(expexctedTotalPriceItems))
                  );
                } else if (
                  allTransactions[m].accountCode ==
                  'PlanPay Customer Receivable (Enterprise)'
                ) {
                  TotalAmount = allTransactions[m].creditAmount;
                  titleArrayTransctions.push(
                    'PlanPay Customer Receivable (Enterprise)- Credit Amount'
                  );
                  actualTransctions.push(
                    await utility.upto2Decimal(TotalAmount)
                  );
                  expectedTransctions.push(
                    String(await utility.upto2Decimal(expexctedTotalPriceItems))
                  );
                }

                if (
                  expectedJson.planSummary.paymentPlatform_vendor == 'Stripe' &&
                  expectedJson.planSummary.paymentPlatform_variant ==
                    'Enterprise'
                ) {
                  if (
                    allTransactions[m].accountCode ==
                    'Cost of Sales - Transaction Fees (Enterprise)'
                  ) {
                    TransactionFeeMerchant = allTransactions[m].debitAmount;
                    titleArrayTransctions.push(
                      'Cost of Sales - Transaction Fees (Enterprise)'
                    );
                    actualTransctions.push(
                      await utility.upto2Decimal(TransactionFeeMerchant)
                    );
                    expectedTransctions.push(
                      String(
                        await utility.upto2Decimal2(
                          expectedJson.paidPayments[x]
                            .paymentGatewayFeeExcludedSalesTax
                        )
                      )
                    );
                  } else if (
                    allTransactions[m].accountCode ==
                    'Cash Clearing - Transaction Fees (Enterprise)'
                  ) {
                    TransactionFeeMerchant = allTransactions[m].creditAmount;
                    titleArrayTransctions.push(
                      'Cash Clearing - Transaction Fees (Enterprise)'
                    );
                    actualTransctions.push(
                      await utility.upto2Decimal(TransactionFeeMerchant)
                    );
                    expectedTransctions.push(
                      String(
                        await utility.upto2Decimal2(
                          expectedJson.paidPayments[x]
                            .paymentGatewayFeeExcludedSalesTax
                        )
                      )
                    );
                  }
                }

                if (
                  allTransactions[m].accountCode ==
                  'PlanPay Accounts Receivable (Enterprise)'
                ) {
                  TransactionFeeActual = allTransactions[m].debitAmount;
                  titleArrayTransctions.push(
                    'PlanPay Accounts Receivable (Enterprise) - Debit Amount'
                  );
                  actualTransctions.push(
                    await utility.upto2Decimal(TransactionFeeActual)
                  );
                  expectedTransctions.push(
                    String(
                      await utility.upto2Decimal(
                        expexctedServiceFeesExcGSTonPaid
                      )
                    )
                  );
                } else if (
                  allTransactions[m].accountCode ==
                  'PlanPay Deferred Billing - Service Fees (Enterprise)'
                ) {
                  TransactionFeeActual = allTransactions[m].creditAmount;
                  titleArrayTransctions.push(
                    'PlanPay Deferred Billing - Service Fees (Enterprise) - Credit Amount'
                  );
                  actualTransctions.push(
                    await utility.upto2Decimal(TransactionFeeActual)
                  );
                  expectedTransctions.push(
                    String(
                      await utility.upto2Decimal(
                        expexctedServiceFeesExcGSTonPaid
                      )
                    )
                  );
                }

                titleArrayTransctions.push('currencyCode');
                actualTransctions.push(allTransactions[m].currencyCode);
                expectedTransctions.push(
                  expectedJson.planSummary.checkoutCurrency
                );

                if (config.LocalEnv.verifyFlag === 'true') {
                  await utility.matchValues(
                    actualTransctions,
                    expectedTransctions,
                    titleArrayTransctions,
                    'Customer Payment Succeeded',
                    expectedConfig.LocalEnv.applicationName
                  );
                } else {
                  await utility.printValues(
                    titleArrayTransctions,
                    actualTransctions,
                    ' Transactions - Customer Payment Succeeded'
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
              if (TotalDebitAmount === TotalCreditAmount) {
                console.log(
                  '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount for Paid Payment ',
                  x + 1,
                  ' End \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
                );
              } else {
                console.log(
                  '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is not equal to Credit Amount for Paid Payment ',
                  x + 1,
                  ' \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
                );
              }

              console.log(
                '%%%%%%%%%%%%%%%%\x1b[35m ' +
                  eventsTransactions.type +
                  ' Transctions for Paid Payment ',
                x + 1,
                ' End \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
              );

              break;
            default:
              await expect(eventsTransactions.transactions.length).toEqual(0);
              console.log(
                'No transaction against ' + eventsTransactions.type + ' Event'
              );
              break;
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
}
