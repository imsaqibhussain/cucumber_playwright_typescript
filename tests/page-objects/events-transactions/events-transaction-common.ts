import { calculations } from '../merchant-checkout/calculations';
import { Utilities } from '../utilities';
const utility = new Utilities();
const calculation = new calculations();
import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';
// import * as fs from 'fs';
import { expectedConfig } from '../../header';

export class eventsTransactionCommon {
  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async getEventsTransactions(planID: any) {
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }

    const path =
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant;

    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT * from Event where planId =
    ${planID} `);
    await results.forEach((item: any) => {
      item.transactions = [];
    });
    console.log('results: ', results);
    await utility.writeIntoJsonFile('events-transactions', results, path);

    await this.delay(9000);
    const JSONData: any = await utility.readJSON();
    // console.log('json ', JSONData);
    for (let i = 0; i < JSONData.length; i++) {
      const results1: any =
        await prisma.$queryRaw(Prisma.sql`SELECT * from Transaction where eventId=
      ${JSONData[i].id} `);
      await results1.forEach((element: any) => {
        JSONData[i].transactions.push(element);
        this.delay(4000);
      });
      await utility.WriteJSON(JSONData);
    }
  }

  async updateTransactionFee() {
    let merchant;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    } else {
      merchant = expectedConfig.merchantDetails.merchantName;
    }
    const jsonData = await calculation.calculateMerchantTransactionFee();
    await this.delay(10000);
    let json_data = await calculation.calculatePlanPayFeesSoFar(jsonData);
    await this.delay(10000);
    json_data = await calculation.calculateMerchantPaymentPayable(json_data); //Revenue
    await this.delay(10000);

    expectedConfig.merchantDetails.merchantName = merchant;
    await utility.writeIntoJsonFile(
      'expected-values',
      json_data,
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant
    );
  }

  async paymentPlatformTransactionData(eventID: string, planID: string) {
    console.log('event id ', eventID);
    console.log('plan id ', planID);
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT planId,merchantId,type,amountCaptured,vendor,currencyCode,instalmentNo,includedRemainder,amountCapturedAvailable,amountRefunded from PaymentHistory where planId =
    ${planID} AND eventId= ${eventID}`);
    return results[0];
  }

  async paymentRefundData(planID: string) {
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT instalmentNo,amountRefunded,amountCapturedAvailable from PaymentHistory where planId =
  ${planID} AND type='Refund' ORDER BY instalmentNo DESC`);
    return results;
  }

  async paymentChargeData(planID: string) {
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT instalmentNo,amountRefunded,amountCapturedAvailable from PaymentHistory where planId =
  ${planID} AND type='Charge' ORDER BY instalmentNo DESC`);
    return results;
  }
}
