import { Utilities } from '../utilities';
import { expect } from '@playwright/test';
import { request } from 'playwright';
import { config } from '../../header';
const utility = new Utilities();
export class PaymentEligibleScheduler {
  async debugPlan(effectiveDate: any, debugApiUrl: any) {
    const apiContext = await request.newContext();
    const body = JSON.stringify({
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

  async paymentEligbleScheduler() {
    await utility.delay(10000);
    const data = await utility.callExpectedJson();
    await utility.delay(10000);
    console.log('RedemptionDate: ', data.planSummary.redemptionDate);
    const redemptionDate = data.planSummary.redemptionDate.split('/');
    const year = redemptionDate[2];
    const month = redemptionDate[1];
    let day = redemptionDate[0];
    const redemDate = year + '-' + month + '-' + day;
    //await new Date(year + '-' + month + '-' + day);
    console.log(
      'Redemption Date format is converted:',
      redemDate + 'T10:01:01.000'
    );
    day = '0' + (Number(day) + 1);
    // this.completionDate + 'T10:01:01.000';
    // const effectiveDate = new Date(redemDate)
    // await effectiveDate.setDate(redemDate.getDate() + 1)
    const effectiveDate = year + '-' + month + '-' + day;
    console.log(
      'Request parameters: effective Date: ' + effectiveDate + 'T10:01:01.000'
    );

    await utility.delay(9000);
    if (
      data.planSummary.planStatus == 'Completed' &&
      data.planSummary.paymentPlatform_variant == 'Managed'
    ) {
      const APIurl = `${process.env.PLANPAY_NEXT_URL}${process.env.PAYMENT_ELIGIBLE_URL}`;
      console.log('URL:', APIurl);
      await utility.delay(5000);
      console.log('\u001b[1;33mlets wait for calling the API!..\u001b[1;37m.');
      await utility.delay(10000);
      //In case no records found, failing the test case.
      const res = await this.debugPlan(effectiveDate, APIurl);
      await expect(res.results.length).not.toEqual(0);
      let actual: any;

      // actual = res.results[0].planId
      const data = await utility.commonJsonReadFunc('expectedFile');
      // const data = await utility.readExpectedValue()
      await utility.delay(3000);
      const expected = data.planSummary.planID;
      for (let i = 0; i < res.results.length; i++) {
        if (res.results[i].planId == expected) {
          actual = res.results[i].planId;
          if (config.LocalEnv.verifyFlag == 'true') {
            await utility.matchValues(
              actual,
              expected,
              'PlanID',
              'Eligible API',
              'API'
            );
          }
        }
      }

      await utility.delay(9000);
    }
  }
}
