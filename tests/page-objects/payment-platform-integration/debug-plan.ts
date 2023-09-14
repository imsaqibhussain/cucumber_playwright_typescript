import { expect } from '@playwright/test';
import { request } from 'playwright';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { Utilities } from '../utilities';
const utility = new Utilities();
import * as fs from 'fs';
import { calculations } from '../merchant-checkout/calculations';
const calculation = new calculations();

export class debugPlan {
  expectedValues: any = {};
  upcomingPayment: any = '';
  completionDate = '';
  slashDate1: any = {};

  async debugPlanApiCalls(
    customerEmail: any,
    nTransactions: any,
    finalStatus: any
  ) {
    console.log(nTransactions);
    console.log(finalStatus);
    let value = false;

    console.log('------------ Api Call ----------------');
    const result = await this.getexpectedValues();
    console.log(result);
    const debugApiResult = await this.debugPlan(
      result.planId,
      result.date,
      process.env.PLANPAY_NEXT_URL + '/api/v2/debug/plan'
    );
    console.log(debugApiResult);
    //instalmentamount check for braintree
    if (
      this.expectedValues.planSummary.paymentPlatform_vendor == 'Braintree' ||
      this.expectedValues.planSummary.paymentPlatform_vendor == 'Adyen' ||
      this.expectedValues.planSummary.paymentPlatform_vendor == 'Mint'
    ) {
      //expectedConfig.planSummary.paymentPlatform_vendor = 'Braintree';
      const flag = await utility.depositCheck(
        Number(this.expectedValues.UpcomingPayments[0].amount)
      );
      if (flag == true) {
        expectedConfig.flags.blockedPayInstalment = 'true';
        finalStatus = 'Late';
        await this.updateExpectedJsonForLateCase(finalStatus);
      }
    }
    if (expectedConfig.flags.blockedPayInstalment == 'false') {
      if (debugApiResult.results != '') {
        if (debugApiResult.results[0].type === 'CustomerPaymentDue') {
          value = true;
          console.log(
            '------------ CustomerPaymentDue Available In Api Responce----------------'
          );
          if (finalStatus != 'Late') {
            await this.updateExpectedJson(finalStatus);
            console.log(
              '------------ Call updateExpectedJson ----------------'
            );
          } else {
            await this.updateExpectedJsonForLateCase(finalStatus);
            console.log(
              '------------ Call updateExpectedJson for late case----------------'
            );
          }
        } else {
          console.log(
            '------------ CustomerPaymentDue Not Available In Api Responce----------------'
          );
          value = false;
        }
      } else {
        console.log(
          '------------ Failed to fetch api responce ----------------'
        );
        value = false;
      }

      await expect(value).toEqual(true);
    } else {
      console.log(
        '\x1b[31m--------------------PayInstalment is blocked-----------------\x1b[37m'
      );
    }
  }
  async debugPlan(planId: any, effectiveDate: any, debugApiUrl: any) {
    const apiContext = await request.newContext();
    const body = JSON.stringify({
      planId: [planId],
      effectiveDate: effectiveDate,
    });

    const debugApiResponse = await apiContext.put(debugApiUrl, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + process.env.APP_INTERNAL_REQUEST_KEY,
      },
      data: body,
    });

    await expect(debugApiResponse.ok()).toBeTruthy();
    const debugApResponseJson = await debugApiResponse.json();
    console.log('api response ==>', debugApResponseJson);
    return debugApResponseJson;
  }

  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async getexpectedValues() {
    await this.delay(10000);

    this.expectedValues = await utility.commonJsonReadFunc('expectedFile');
    // this.expectedValues = await utility.readExpectedValue();
    this.upcomingPayment = this.expectedValues.UpcomingPayments[0].date;
    this.upcomingPayment = await utility.convertDateStringtoArray(
      this.upcomingPayment
    );
    this.completionDate =
      this.upcomingPayment[2] +
      '-' +
      this.upcomingPayment[1] +
      '-' +
      this.upcomingPayment[0];
    console.log(' upcoming payment => ' + this.completionDate);
    //this.slashDate1 = await new Date(this.completionDate);
    this.slashDate1 = this.completionDate + 'T10:01:01.000';
    console.log(' upcoming date from expected => ' + this.slashDate1);
    console.log('plan id is ', this.expectedValues.planSummary.planID);
    return {
      planId: this.expectedValues.planSummary.planID,
      date: this.slashDate1,
    };
  }

  async updateExpectedJsonForLateCase(finalStatus?: any) {
    console.log(finalStatus);

    const data = await utility.commonJsonReadFunc('expectedFile');

    const latePayments = this.expectedValues.latePayments;
    await latePayments.push(this.expectedValues.UpcomingPayments[0]);
    data.latePayments = latePayments;
    data.planSummary.planStatus = 'Late';
    data.flags.latePayment = 'true';
    data.flags = expectedConfig.flags;
    await this.delay(10000);

    const upcomingPayment = this.expectedValues.UpcomingPayments;
    const shiftedData = upcomingPayment.shift();
    console.log(shiftedData);
    data.UpcomingPayments = upcomingPayment;
    let merchant = expectedConfig.merchantDetails.merchantName;

    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    for (let i = 0; i < latePayments.length; i++) {
      data.latePayments[i].paymentType = 'LATE';
      data.latePayments[i].status = 'Overdue';
    }

    await fs.writeFile(
      'tests/setup/expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        merchant +
        '/expected-values.json',

      JSON.stringify(data),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );
  }

  async updateExpectedJson(finalStatus: any) {
    await this.delay(10000);

    const data = await utility.commonJsonReadFunc('expectedFile');

    // const data = await utility.readExpectedValue();
    const upcomingPayment = this.expectedValues.UpcomingPayments;
    const paidPayments = this.expectedValues.paidPayments;
    const orderDetails = this.expectedValues.planSummary;
    // const installmentAmount = orderDetails.installmentAmount;
    const installmentAmount = upcomingPayment[0].amount;

    // console.log("paiddo far from expected "  + orderDetails.totalFunds)
    let paid = await (Number(orderDetails.totalFunds) +
      Number(installmentAmount));
    paid = (await Math.round((paid + Number.EPSILON) * 100)) / 100;
    let remaining = await (Number(orderDetails.remainingAmount) -
      Number(installmentAmount));
    remaining = (await Math.round((remaining + Number.EPSILON) * 100)) / 100;

    data.planSummary.totalFunds = await utility.upto2Decimal(paid);
    expectedConfig.planSummary.totalFunds = data.planSummary.totalFunds; //add toString();
    data.planSummary.remainingAmount = await utility.upto2Decimal(remaining);
    expectedConfig.planSummary.remainingAmount =
      data.planSummary.remainingAmount; //add toString();
    data.planSummary.noOfInstallmentsPaid = (
      parseInt(orderDetails.noOfInstallmentsPaid) + 1
    ).toString();
    expectedConfig.planSummary.noOfInstallmentsPaid =
      data.planSummary.noOfInstallmentsPaid;
    data.planSummary.noOfInstallmentsToBePaid = (
      parseInt(orderDetails.noOfInstallmentsToBePaid) - 1
    ).toString();
    expectedConfig.planSummary.noOfInstallmentsToBePaid =
      data.planSummary.noOfInstallmentsToBePaid;
    // await calculation.calculatePlanPayFees(Number(data.planSummary.paidSoFar));
    // data.fees.planpayfee = expectedConfig.fees.planpayfee;
    expectedConfig.planSummary.totalCost = data.planSummary.totalCost;
    // await calculation.calculateMerchantRevenue();
    // data.fees.MerchantRevenue =
    //   expectedConfig.fees.MerchantRevenue;
    await calculation.calculatePercentageInstallmentPaid();
    data.planSummary.percentageInstallmentPaid =
      expectedConfig.planSummary.percentageInstallmentPaid;
    paidPayments.push(this.expectedValues.UpcomingPayments[0]);

    const paidLength = paidPayments.length;

    const chargeType = {
      amountcapturedAvailable: paidPayments[paidLength - 1].amount,
      amountRefunded: '0.00',
    };
    // assigning chargeType for paymentHistory-payInstalments
    // Make sure paidPayments[paidLength-1].type is an object
    if (typeof paidPayments[paidLength - 1].type !== 'object') {
      paidPayments[paidLength - 1].type = {}; // Initialize type as an empty object
    }

    paidPayments[paidLength - 1].type.Charge = chargeType;
    // paidPayments[paidLength-1].type.Charge = chargeType

    const shiftedData = upcomingPayment.shift();
    shiftedData['paymentMethodUsed'] = data.planSummary.paymentMethod;
    // upcomingPayment.shift();
    data.UpcomingPayments = upcomingPayment;
    data.paidPayments = paidPayments;

    data.paidPayments[data.paidPayments.length - 1].status = 'Paid';
    data.paidPayments[data.paidPayments.length - 1].actualPaidDate =
      data.paidPayments[data.paidPayments.length - 1].date;
    data.planSummary.effectiveDate =
      data.paidPayments[data.paidPayments.length - 1].date;
    console.log('paid payment ' + data.planSummary.totalFunds);

    //updating status as complete if its last transaction
    if (
      data.planSummary.totalNoOfInstallments ==
        data.planSummary.noOfInstallmentsPaid ||
      finalStatus == 'Completed'
    ) {
      data.planSummary.planStatus = 'Completed';
      //data.flags.blockedPayInstalment = 'true';
    }
    let merchant = data.merchantDetails.merchantName;
    if (data.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = data.merchantDetails.sub_merchantName;
    }

    data.planSummary.paymentsFrom = paidPayments[paidPayments.length - 1].date;
    data.planSummary.numberOfInstalment =
      data.planSummary.noOfInstallmentsToBePaid;

    expectedConfig.UpcomingPayments = data.UpcomingPayments;
    expectedConfig.planSummary.operationType = 'nTransactions';
    data.UpcomingPayments = await calculation.handleRemainder();

    await utility.writeIntoJsonFile(
      'expected-values',
      data,
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant
    );
  }
}
