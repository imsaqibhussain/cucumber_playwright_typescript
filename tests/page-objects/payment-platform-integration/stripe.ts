import { Utilities } from '../utilities';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
const utility = new Utilities();
import { expect } from '@playwright/test';
import * as fs from 'fs';
import { calculations } from '../merchant-checkout/calculations';
const calculation = new calculations();
import Stripe from 'stripe';

export class StripeTransaction {
  //DEV
  stripe = new Stripe(
    'sk_test_51Kiy8vEtAT17u78BqzVRfamhj6NGWHiLYessZqhPcmpa4Np0AGgjhpcplxp6G91A1KjTrFDPhwEYpxrjdDAWP4wK00yzKKb6ye',
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      apiVersion: '2022-11-15',
    }
  );
  //UAT
  // stripe = new Stripe(
  //   'sk_test_51LAsbACU1uW59RyueqDtDQz7oZe6MuolxHwRNkAiRmp3288J5MzR96As2Ke68bYlFOP35n8mktLHsEVhSyhddfCE00jtRlTOpy',
  //   {
  //     apiVersion: '2022-11-15',
  //   }
  // );
  page1 = {};
  usernameField = '[data-testid="login-email-input"]';
  passwordField = '[data-testid="login-password-input"]';
  loginBtn =
    "//div[@class='Box-root Flex-flex Flex-alignItems--baseline Flex-direction--row Flex-justifyContent--center']";
  customer_id = '';
  test_clock = '';
  endTime = [];
  endDateGMT = [];
  advanceTime = 0;
  expectedValues: any = {};
  upcomingPayment: any = '';
  completionDate = '';
  slashDate1: any = {};

  async startApiCalls(
    customerEmail: any,
    nTransactions: any,
    finalStatus: any
  ) {
    console.log(nTransactions);
    console.log(finalStatus);

    console.log('\n************* STRIPE API CALLING ****************');

    await this.searchCustomer(customerEmail);
    await this.getSubscriptions();
    await this.advanceClock();
    await this.updateExpectedJson();
  }

  async searchCustomer(customerEmail: any) {
    console.log('************* CUSTOMER SEARCH API ****************');
    //Calling stripe customer search API https://stripe.com/docs/api/customers/search
    console.log('Email =>' + customerEmail);
    const customer = await this.stripe.customers.search({
      query: "email:'" + customerEmail + "'",
    });

    const responseData = await JSON.stringify(customer);
    const responseJson = await JSON.parse(responseData);
    // utility.delay(5000)
    if (responseJson.data.length !== 0) {
      console.log(
        '********** CUSTOMER SEARCH API RESPONSE *************** \n \n' +
          responseData
      );
      this.customer_id = responseJson.data[0].id;
      this.test_clock = responseJson.data[0].test_clock;
      console.log('CUSTOMER ID   => ' + this.customer_id);
      console.log('TEST CLOCK ID => ' + this.test_clock);
    } else {
      console.log('NO RECORD FOUND FOR THIS CUSTOMER');
      await expect(responseJson.data.length).toBeGreaterThan(0);
    }
  }

  async getSubscriptions() {
    console.log(
      '\n ************* GET CUSTOMER SUBSCRIPTIONS API ****************'
    );
    const subscriptions = await this.stripe.subscriptions.list({
      customer: this.customer_id,
    });

    const responseData = await JSON.stringify(subscriptions);
    const responseJson = await JSON.parse(responseData);
    // console.log("************* SUBSCRIPTION API RESPONSE *************** \n \n"
    // + responseData);

    const countSubscriptions = await responseJson.data.length;
    console.log(' TOTAL CUSTOMER SUBSCRIPTION ' + countSubscriptions);

    await this.getexpectedValues();
    // const earliestTimeGMT = 0;

    if (countSubscriptions == 1) {
      // await this.verifyOrderFeilds(responseJson);
      const apiNextInstallment = responseJson.data[0].current_period_end;
      const expectedNextInstallment = await this.nextInstallmentDate();
      console.log(
        ' Next instalment date TIMESTAMP => ' + expectedNextInstallment
      );
      console.log(
        ' API Next instalment date TIMESTAMP => ' + apiNextInstallment
      );
      this.advanceTime = expectedNextInstallment;
    }
  }

  async getexpectedValues() {
    this.expectedValues = await utility.callExpectedJson();
    // this.expectedValues = await utility.readExpectedValue();
    this.upcomingPayment = this.expectedValues.UpcomingPayments[0].date;
    this.upcomingPayment = await utility.convertDateStringtoArray(
      this.upcomingPayment
    );
    this.completionDate =
      this.upcomingPayment[1] +
      '/' +
      this.upcomingPayment[0] +
      '/' +
      this.upcomingPayment[2];
    // console.log(" upcoming payment => " + completionDate);
    this.slashDate1 = await new Date(this.completionDate);
    console.log(' upcoming payment from expected => ' + this.slashDate1);
  }

  async verifyOrderFeilds(responseJson: any) {
    const dueDate = responseJson.data[0].current_period_end;
    const amount = responseJson.data[0].items.data[0].plan.amount_decimal;
    const expectedDuedate = this.expectedValues.UpcomingPayments[0].date;
    const expectedamount = this.expectedValues.planSummary.installmentAmount;

    console.log('dueDate ' + dueDate);
    console.log('amount ' + amount);
    console.log('expectedDuedate ' + expectedDuedate);
    console.log('expectedamount ' + expectedamount);
  }
  async nextInstallmentDate() {
    console.log(' CALCULATING NEXT INSTALMENT DATE FROM EXPECTED ');
    await this.slashDate1.setDate(this.slashDate1.getDate() + 1);
    await this.slashDate1.setTime(
      this.slashDate1.getTime() + 5 * 60 * 60 * 1000
    );
    const advaneDate = await Math.floor(this.slashDate1.getTime() / 1000);
    return advaneDate;
  }

  async advanceClock() {
    console.log('\n ************* ADVANCE CLOCK API ****************');
    // let advancingTime= await Math.floor(this.advanceTime.getTime() / 1000);
    // console.log("ADVANCE TIME IN TIMESTAMP FORMAT =>" + advancingTime);

    utility.delay(10000);
    const testClock = await this.stripe.testHelpers.testClocks.advance(
      this.test_clock,
      { frozen_time: this.advanceTime }
    );

    const responseData = await JSON.stringify(testClock);
    const responseJson = await JSON.parse(responseData);

    console.log(
      '********** ADVANCE CLOCK API RESPONSE *************** \n \n' +
        (await JSON.stringify(testClock))
    );

    const clockFrozen = await responseJson.frozen_time;
    console.log(clockFrozen);
  }

  async updateExpectedJson() {
    const data = await utility.callExpectedJson();
    const upcomingPayment = this.expectedValues.UpcomingPayments;
    const paidPayments = this.expectedValues.paidPayments;
    const orderDetails = this.expectedValues.planSummary;
    const installmentAmount = orderDetails.installmentAmount;
    // console.log("paiddo far from expected "  + orderDetails.totalFunds)
    const paid = await (parseFloat(orderDetails.totalFunds) +
      parseFloat(installmentAmount));
    const remaining = await (parseFloat(orderDetails.remainingAmount) -
      parseFloat(installmentAmount));
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
    data.fees.MerchantRevenue =
      // expectedConfig.fees.MerchantRevenue;
      await calculation.calculatePercentageInstallmentPaid();
    data.planSummary.percentageInstallmentPaid =
      expectedConfig.planSummary.percentageInstallmentPaid;
    paidPayments.push(this.expectedValues.UpcomingPayments[0]);
    upcomingPayment.shift();
    data.UpcomingPayments = upcomingPayment;
    data.paidPayments = paidPayments;
    console.log('upcoming payment ' + upcomingPayment[0].instalment);
    console.log('paid payment ' + data.planSummary.totalFunds);

    //updating status as complete if its last transaction
    if (
      data.planSummary.totalNoOfInstallments ==
      data.planSummary.noOfInstallmentsPaid
    ) {
      data.planSummary.planStatus = 'Completed';
    }
    await fs.writeFile(
      'tests/setup/expected/' +
        expectedConfig.planSummary.checkoutType +
        '/expected-values.json',
      JSON.stringify(data),
      (err) => {
        if (err) console.log('Error writing file:', err);
      }
    );
  }

  /**
     * 
     * else block after if(countSubscriptions == 1)
     * else if(countSubscriptions > 1){
      const earliestTime= await Math.floor((this.slashDate1.getTime()) / 1000);

      for(let i=0;i<countSubscriptions;i++){

        console.log('\n ************* iterating for '+ i +'th subscription****************\n');
        this.endTime[i]=responseJson.data[i].current_period_end;
      
        console.log(" END TIME FROM API IN TIMESTAMP => " +this.endTime[i]);
        this.endDateGMT[i] = new Date(this.endTime[i] * 1000);
        console.log(" NEXT INSTALMENT DUE DATE => "+ this.endDateGMT[i] +'\n');
        if(this.endTime[i] < earliestTime){
          earliestTime=this.endTime[i];
          earliestTimeGMT=this.endDateGMT[i];
        }
        console.log("earliestTime " + earliestTime)
      }
      console.log(" earliest DUE DATE => "+ earliestTimeGMT +'\n');
      if(this.slashDate1 > earliestTimeGMT){
          this.advanceTime = earliestTimeGMT;
      }else{
        this.advanceTime= this.slashDate1;
      }
      console.log(" this.advanceTime => "+ this.advanceTime +'\n');
      await this.advanceTime.setDate(this.advanceTime.getDate() + 1);
      console.log(" ADVANCE TIME => "+ this.advanceTime +'\n');
    }
     */
}
