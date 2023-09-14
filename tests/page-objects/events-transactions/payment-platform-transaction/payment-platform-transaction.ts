import { config } from '../../.././setup/configurations/test-data-ts.conf';

import { Utilities } from '../../utilities';
import { eventsTransactionCommon } from '../events-transaction-common';
const utility = new Utilities();
const events_transaction_common = new eventsTransactionCommon();

export class paymentPlatformTransaction {
  async verifyTransaction(screen: string) {
    let instalmentno: number;
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    if (screen == 'paymentHistory-planCreated') {
      instalmentno = 1;
    }
    if (screen == 'paymentHistory-payInstalment') {
      let instalment_no =
        expectedJson.paidPayments[expectedJson.paidPayments.length - 1]
          .instalment;
      instalment_no = await instalment_no.split('/');
      instalmentno = Number(instalment_no[0]);
    }

    const eventsTransactions = await eventsTransactionsJson.find(
      (item: { type: string; payload: any }) =>
        item.type === 'CustomerPaymentSucceeded' &&
        item.payload.instalmentNo == instalmentno
    );

    const transactionData =
      await events_transaction_common.paymentPlatformTransactionData(
        eventsTransactions.id,
        expectedJson.planSummary.planID
      );

    console.log('transactionData:', transactionData);
    const title = [
      'planId',
      'merchantID',
      'type',
      'amountCaptured',
      'vendor',
      'currencyCode',
      'instalmentNo',
      'includedRemainder',
      'amountCapturedAvailable',
      'amountRefunded',
    ];

    const amountCaptured = String(transactionData.amountCaptured);
    if (amountCaptured.includes('.') == false) {
      transactionData.amountCaptured = amountCaptured + '.00';
    } else {
      transactionData.amountCaptured = await utility.upto2Decimal(
        transactionData.amountCaptured
      );
    }
    const includedRemainder = String(transactionData.includedRemainder);
    if (includedRemainder.includes('.') == false) {
      transactionData.includedRemainder = includedRemainder + '.00';
    }
    const actual = [
      transactionData.planId,
      transactionData.merchantId,
      transactionData.type,
      String(transactionData.amountCaptured),
      transactionData.vendor,
      transactionData.currencyCode,
      transactionData.instalmentNo,
      String(await utility.upto2Decimal(transactionData.includedRemainder)),
      transactionData.amountCapturedAvailable.toFixed(2),
      transactionData.amountRefunded.toFixed(2),
    ];
    const expected = [
      expectedJson.planSummary.planID,
      expectedJson.merchantDetails.merchantId,
      'Charge',
      expectedJson.paidPayments[instalmentno - 1].amount,
      expectedJson.planSummary.paymentPlatform_vendor,
      expectedJson.planSummary.checkoutCurrency,
      instalmentno,
      expectedJson.paidPayments[instalmentno - 1].remainder,
      expectedJson.paidPayments[instalmentno - 1].type.Charge
        .amountcapturedAvailable,
      expectedJson.paidPayments[instalmentno - 1].type.Charge.amountRefunded,
    ];

    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        screen,
        'paymentHistory'
      );
    } else {
      await utility.printExpectedandAcctualValues(
        title,
        actual,
        expected,
        'paymentHistory'
      );
    }
  }
}
