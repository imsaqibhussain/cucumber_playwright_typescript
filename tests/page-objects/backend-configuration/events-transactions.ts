import { calculations } from '../merchant-checkout/calculations';
import { Utilities } from '../utilities';
const utility = new Utilities();
const calculation = new calculations();
import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';

export class eventsTransactions {
  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async getEventsTransactions(planID: any) {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * from Event where planId = ${planID}`
    );
    await results.forEach((item: any) => {
      item.transactions = [];
    });
    await utility.writeIntoJsonFile('events-transactions', results, 'actual');

    await this.delay(7000);
    const JSONData: any = await utility.readJSON();
    for (let i = 0; i < JSONData.length; i++) {
      const results1: any = await prisma.$queryRaw(
        Prisma.sql`SELECT * from Transaction where eventId = ${JSONData[i].id}`
      );
      results1.forEach((element: any) => {
        JSONData[i].transactions.push(element);
        this.delay(1000);
        utility.writeIntoJsonFile('events-transactions', results1, 'actual');
      });
    }
  }

  async updateTransactionFee() {
    const jsonData = await calculation.calculateMerchantTransactionFee();
    await this.delay(5000);
    let json_data = await calculation.calculatePlanPayFeesSoFar(jsonData);

    json_data = await calculation.calculateMerchantPaymentPayable(json_data); //Revenue
    await this.delay(10000);
    let merchant = json_data.merchantDetails.merchantName;
    if (json_data.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = json_data.merchantDetails.sub_merchantName;
    }
    utility.writeIntoJsonFile(
      'expected-values',
      json_data,
      'expected/' + jsonData.planSummary.checkoutType + '/' + merchant
    );
  }
}
