import { request } from '@playwright/test';
import { expect } from '@playwright/test';
import { Utilities } from '../utilities';
const utility = new Utilities();
//import { expectedConfig } from '../../setup/expected/expected-ts.conf';

export class CreateCheckoutSession {
  async CreateCheckoutSession(
    apiCallName: any,
    merchantName: any,
    nItems: any,
    sku: any,
    quantity: any,
    redemptionDate: any
  ) {
    console.log('Application Name : => ', apiCallName);
    const items: any = [];
    let item_quantities = [];
    let item_skus = [];
    let item_redemptionDates = [];

    if (await quantity.includes(',')) {
      item_quantities = await quantity.split(',');
    } else {
      await item_quantities.push(quantity);
    }

    if (await sku.includes(',')) {
      item_skus = await sku.split(',');
    } else {
      await item_skus.push(sku);
    }

    if (await redemptionDate.includes(',')) {
      item_redemptionDates = await redemptionDate.split(',');
    } else {
      await item_redemptionDates.push(redemptionDate);
    }

    for (let i = 0; i < nItems; i++) {
      const obj = {
        quantity: parseFloat(item_quantities),
        estimatedShipmentDate: item_redemptionDates[i],
        sku: item_skus[i],
      };
      items.push(obj);
    }
    const path =
      'configurations/merchants-products-configuration/' +
      merchantName +
      '/' +
      merchantName +
      '.json';

    const merchantConfiguration = await utility.readJsonFile(path); //reading merchant config file
    console.log(
      '*************** Start create-checkout-session Api Call ***************'
    );

    const apiContextUrl = `${process.env.CHECKOUT_API_URL}`;

    const apiContext = await request.newContext();
    const checkoutPayload = {
      merchantId: merchantConfiguration.merchant.id,
      items: items,
    };

    console.log(
      '*************** create-checkout-session Api Payload ***************'
    );
    console.log(checkoutPayload);

    await utility.delay(10000);
    const checkoutApResponse = await apiContext.post(apiContextUrl, {
      data: checkoutPayload,
    });

    await expect(checkoutApResponse.ok()).toBeTruthy();
    await expect(checkoutApResponse.status()).toBe(201);
    const checkoutApResponseJson = await checkoutApResponse.json();
    console.log(checkoutApResponseJson);
    await utility.writeIntoJsonFile(
      'create-checkout-session',
      checkoutApResponseJson,
      'actual'
    );
    await apiContext.dispose();
  }

  async CreateCheckout(apiCallName: any) {
    console.log('Application Name : => ', apiCallName);

    console.log(
      '*************** Start Calling  create-checkout  Api using Create Checkpot Session Api Responce ***************'
    );

    const createCheckoutSessionFilePath =
      '/../setup/actual/create-checkout-session.json';
    const createCheckoutSessionFile = await utility.readJsonFile(
      createCheckoutSessionFilePath
    ); //Read create-checkout-session.json
    const createChecoutApiContextUrl =
      `${process.env.PLANPAY_NEXT_URL}` + 'api/v2/checkout';
    const createChecoutApiContexContext = await request.newContext();
    const createCheckoutPayload = {
      currencyCode: 'AUD',
      merchantId: createCheckoutSessionFile.merchantId,
      merchantOrderId: createCheckoutSessionFile.merchantOrderId,
      expiry: 234,
      redirectURL: createCheckoutSessionFile.redirectURL,
      items: createCheckoutSessionFile.items,
    };

    console.log('*************** Create-checkout Api Payload ***************');
    console.log(createCheckoutPayload);

    const createCheckoutApiResponse = await createChecoutApiContexContext.post(
      createChecoutApiContextUrl,
      {
        headers: {
          'content-type': 'application/json',
          Authorization: 'Basic ' + process.env.CREATE_CHECKOUT_API_REQUEST_KEY,
        },
        data: createCheckoutPayload,
      }
    );
    console.log(
      '*************** create-checkout  Api Responce ***************'
    );
    console.log(createCheckoutApiResponse);

    await expect(createCheckoutApiResponse.ok()).toBeTruthy();
    // await expect(createCheckoutApResponse.status()).toBe(201);
    const createCheckoutApResponseJson = await createCheckoutApiResponse.json();
    console.log(createCheckoutApResponseJson);
    await utility.writeIntoJsonFile(
      'create-checkout-checkoutID',
      createCheckoutApResponseJson,
      'actual'
    );
    await createChecoutApiContexContext.dispose();
  }

  async GetCheckout(apiCallName: any) {
    console.log('Application Name : => ', apiCallName);

    console.log('*************** Start Calling  get-checkout  ***************');

    const createCheckoutSessionFilePath =
      '/../setup/actual/create-checkout-session.json';
    const createCheckoutSessionFile = await utility.readJsonFile(
      createCheckoutSessionFilePath
    ); //Read create-checkout-session.json
    const createCheckoutFile = await utility.readJsonFile(
      createCheckoutSessionFilePath
    ); //Read create-checkout-checkoutID.json
    const getChecoutApiContextUrl =
      `${process.env.PLANPAY_NEXT_URL}` +
      'api/v2/checkout/' +
      createCheckoutFile.id;

    const getChecoutApiContexContext = await request.newContext();
    const getCheckoutPayload = {
      currencyCode: 'AUD',
      merchantId: createCheckoutSessionFile.merchantId,
      merchantOrderId: createCheckoutSessionFile.merchantOrderId,
      redirectURL: createCheckoutSessionFile.redirectURL,
      items: createCheckoutSessionFile.items,
    };

    console.log('*************** get-checkout Api Payload ***************');
    console.log('URL =>', getChecoutApiContextUrl);
    console.log(getCheckoutPayload);

    const getCheckoutApiResponse = await getChecoutApiContexContext.get(
      getChecoutApiContextUrl,
      {
        headers: {
          'content-type': 'application/json',
          Authorization: 'Basic ' + process.env.CREATE_CHECKOUT_API_REQUEST_KEY,
        },
        data: getCheckoutPayload,
      }
    );
    console.log(
      '*************** create-checkout  Api Responce ***************'
    );
    console.log(getCheckoutApiResponse);

    await expect(getCheckoutApiResponse.ok()).toBeTruthy();
    // await expect(createCheckoutApResponse.status()).toBe(201);
    const getCheckoutApResponseJson = await getCheckoutApiResponse.json();
    console.log(getCheckoutApResponseJson);
    await utility.writeIntoJsonFile(
      'get-checkout',
      getCheckoutApResponseJson,
      'actual'
    );
    await getChecoutApiContexContext.dispose();
  }
}

//module.exports = { CreateCheckoutSession };
