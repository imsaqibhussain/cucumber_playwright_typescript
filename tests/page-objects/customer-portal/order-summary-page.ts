import { Utilities } from '../utilities';
import { config, expectedConfig } from '../../header';

const utility = new Utilities();
export class OrderSummary {
  installmentNumber_locator = "//p[text()=' Payment']";
  installmentAmount_locator = "//p[text()='$']";
  installmentDate_locator = "//span[text()='Due']";
  installmentPaidButton_locator = "//button[text()='PAID']";
  instllmentPadAmount_locator = "//span[text()='Paid']/following-sibling::span";
  instalmentDate = '#Instalment_date';
  async orderSummary(orderItem: any) {
    const expectedJSON = await utility.callExpectedJson();
    console.log('Application name:', expectedConfig.LocalEnv.applicationName);
    const title: any = [];
    const actual: any = [];
    const expected: any = [];
    const orderData = await orderItem.innerText();
    const separatedSummary = await orderData.split('\n');
    const data = await utility.convertSpacesStringintoArray(
      separatedSummary[2]
    );
    title.push(
      'Merchant Name',
      'Total Number of Installments',
      'Remaining Amount',
      'Plan status'
    );
    actual.push(
      separatedSummary[0],
      data[4],
      await separatedSummary[8].replace(/[^0-9.]/g, ''),
      separatedSummary[10]
    );
    let expectedMerchantName: any;
    let expectedRemainingAmount: any;
    let expectedPlanStatus: any;
    let installmentNext: any;
    let expectedNextInstallment: any;
    let expectedInstallmentDate: any;
    if (expectedConfig.merchantDetails.checkoutCategory == 'merchant') {
      expectedMerchantName = expectedJSON.merchantDetails.merchantName;
    } else {
      expectedMerchantName = expectedJSON.merchantDetails.sub_merchantName;
    }
    if (expectedJSON.flags.cancelPlanFlag === 'true') {
      expectedRemainingAmount = '0.00';
    } else {
      expectedRemainingAmount = expectedJSON.planSummary.remainingAmount;
    }
    if (expectedJSON.planSummary.planStatus == 'Late') {
      expectedPlanStatus = 'On Schedule';
    } else {
      expectedPlanStatus = expectedJSON.planSummary.planStatus;
    }
    expected.push(
      expectedMerchantName,
      expectedJSON.planSummary.totalNoOfInstallments,
      expectedRemainingAmount,
      expectedPlanStatus
    );
    //Next installment handling cases.
    if (expectedConfig.planSummary.planStatus == 'Late') {
      installmentNext = expectedJSON.latePayments[0].instalment.split('/');
      expectedNextInstallment = installmentNext[0];
      expectedInstallmentDate = expectedJSON.latePayments[0].date;
    } else if (expectedConfig.planSummary.planStatus == 'On Schedule') {
      installmentNext = expectedJSON.UpcomingPayments[0].instalment.split('/');
      expectedNextInstallment = installmentNext[0];
      expectedInstallmentDate = expectedJSON.UpcomingPayments[0].date;
    } else if (expectedConfig.planSummary.planStatus == 'Completed') {
      expectedNextInstallment = expectedJSON.planSummary.totalNoOfInstallments;
      expectedInstallmentDate = expectedJSON.planSummary.lastPaymentDate;
    } else if (expectedConfig.planSummary.planStatus == 'Cancelled') {
      if (expectedJSON.UpcomingPayments.length == 0) {
        expectedNextInstallment =
          expectedJSON.planSummary.totalNoOfInstallments;
        expectedInstallmentDate = expectedJSON.planSummary.lastPaymentDate;
      } else {
        expectedNextInstallment = expectedJSON.planSummary.noOfInstallmentsPaid;
        expectedInstallmentDate = expectedJSON.planSummary.lastPaymentDate;
      }
    }
    if (
      expectedConfig.planSummary.planStatus == 'On Schedule' ||
      expectedConfig.planSummary.planStatus == 'Late'
    ) {
      title.push('Next Installmet Number', 'Next Installmet Date');
      actual.push(data[2], await utility.formatDate(separatedSummary[4]));
      expected.push(expectedNextInstallment, expectedInstallmentDate);
    } else {
      title.push('Last Payment', 'Last Payment Paid Date');
      actual.push(data[2], await utility.formatDate(separatedSummary[4]));
      expected.push(expectedNextInstallment, expectedInstallmentDate);
    }
    await utility.printValues(title, actual, 'Summary Details');
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        'Order Summary',
        'Customer portal'
      );
    }
  }
}
