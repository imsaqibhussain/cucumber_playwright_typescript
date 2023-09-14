import { expectedConfig } from '../../../setup/expected/expected-ts.conf';
import { Utilities } from '../../utilities';
import { eventsTransactionCommon } from '../events-transaction-common';
import { config } from '../../../setup/configurations/test-data-ts.conf';

const utility = new Utilities();
const events_transaction_common = new eventsTransactionCommon();
export class planRefunded {
  async paymentPlanRefunded() {
    const planRefundedHistory = [];
    let refundedAmount = Number(
      expectedConfig.cancellationDetails.ActualRefundAmountUI
    );
    let captureAmount;
    let captureAmountAvailable;
    // console.log('refundedAmount: ', refundedAmount);
    for (let i = expectedConfig.paidPayments.length - 1; i >= 0; i--) {
      captureAmount = Number(
        expectedConfig.paidPayments[expectedConfig.paidPayments.length - 1]
          .amount
      );
      // console.log('captureAmount', captureAmount);
      if (Number(expectedConfig.paidPayments[i].amount) <= refundedAmount) {
        refundedAmount =
          refundedAmount - Number(expectedConfig.paidPayments[i].amount);
        captureAmountAvailable = refundedAmount - captureAmount;
        captureAmountAvailable = 0; //Number(captureAmountAvailable.toFixed(2))
        // console.log('captureAmountAvailable: ', captureAmountAvailable);
        await planRefundedHistory.push({
          instalmentNo: i + 1,
          refundedAmount: Number(expectedConfig.paidPayments[i].amount),
          captureAmountAvailable,
        });
        const refundObj = {
          amountcapturedAvailable: String(captureAmountAvailable),
          amountRefunded: expectedConfig.paidPayments[i].amount,
        };

        const chargObj = {
          amountcapturedAvailable: String(captureAmountAvailable),
          amountRefunded: '0',
        };

        console.log('refundObj', refundObj);
        console.log('chargObj', chargObj);
        expectedConfig.paidPayments[i].type.Refund = refundObj;
        expectedConfig.paidPayments[i].type.Charge = chargObj;
      } else {
        const value =
          Number(expectedConfig.paidPayments[i].amount) -
          (Number(expectedConfig.paidPayments[i].amount) - refundedAmount);
        // console.log('final refundAmount from depositpaid: ', value);
        captureAmountAvailable =
          Number(expectedConfig.paidPayments[i].amount) - refundedAmount;
        captureAmountAvailable = Number(captureAmountAvailable.toFixed(2));
        const refundObj = {
          amountcapturedAvailable: '0',
          amountRefunded: String(value),
        };
        const chargObj = {
          amountcapturedAvailable: String(captureAmountAvailable),
          amountRefunded: '0',
        };
        console.log('refundObj', refundObj);
        console.log('chargObj', chargObj);
        expectedConfig.paidPayments[i].type.Refund = refundObj;
        expectedConfig.paidPayments[i].type.Charge = chargObj;
        await planRefundedHistory.push({
          instalmentNo: i + 1,
          refundedAmount: Number(await utility.upto2Decimal2(value)),
          captureAmountAvailable,
        });
      }
    }

    //fetch results from paymenthistory table and call match.values
    const refundData = await events_transaction_common.paymentRefundData(
      expectedConfig.planSummary.planID
    );

    //fetch results from paymenthistory table and call match.values
    const chargeData = await events_transaction_common.paymentChargeData(
      expectedConfig.planSummary.planID
    );

    const TitleArray = [];
    const expected = [];
    const actual = [];
    // console.log('planRefundedHistory:', planRefundedHistory);
    // console.log('refundData:', refundData);

    const minLength = Math.min(planRefundedHistory.length, refundData.length);

    for (let i = 0; i < minLength; i++) {
      const planRefunded = planRefundedHistory[i];
      const refund = refundData[i];
      const expectedEntry = `instalmentNo: ${planRefunded.instalmentNo} ==> RefundedAmount: ${planRefunded.refundedAmount} ==> captureAmountAvailable: ${planRefunded.captureAmountAvailable}`;
      const actualEntry = `instalmentNo: ${refund.instalmentNo} ==> RefundedAmount: ${refund.amountRefunded} ==> captureAmountAvailable: ${chargeData[i].amountCapturedAvailable}`;
      TitleArray.push(`Instalment: ${i + 1}`);
      expected.push(expectedEntry);
      actual.push(actualEntry);
    }

    // console.log('TitleArray:', TitleArray);
    // console.log('Expected:', expected);
    // console.log('Actual:', actual);

    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        TitleArray,
        'Plan Refunded History',
        'merchant-testing'
      );
    } else {
      await utility.printExpectedandAcctualValues(
        TitleArray,
        actual,
        expected,
        'Plan Refunded History'
      );
    }
    //write expectedconfig into json
    await utility.writeIntoJsonFile(
      'expected-values',
      expectedConfig,
      'expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        expectedConfig.merchantDetails.merchantName
    );
  }
}
