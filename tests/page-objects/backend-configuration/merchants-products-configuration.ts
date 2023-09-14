import { Utilities } from '../utilities';
const utility = new Utilities();
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import fetch from 'cross-fetch';
import { merchantDemo } from '../../setup/configurations/merchant';
import { subMerchantDemo } from '../../setup/configurations/subMerchants';
import { config } from '../../setup/configurations/test-data-ts.conf';
import { readFileSync } from 'fs';
import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';

export class merchantConfig {
  async getMerchnatDetails(merchantName: any, merchantID: any) {
    // await prisma.$connect();
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT Merchant.*, Address.line1,Address.line2,Address.city,Address.state,Address.postcode,Address.countryAlpha3Code FROM Merchant INNER JOIN Address ON Merchant.billingAddressId = Address.id WHERE Merchant.id =
    ${merchantID} `);
    console.log('results are ', results);
    const queryResult = {
      merchant: {
        MerchantDefaultRefundPolicy: [],
        MerchantPaymentPlatform: [],
      },
    };

    await utility.delay(4000);
    console.log('Query resopnse', results);
    queryResult.merchant = results[0];
    queryResult.merchant.MerchantDefaultRefundPolicy = [];
    await utility.writeIntoJsonFile(
      merchantName,
      queryResult,
      'configurations/merchants-products-configuration/' + merchantName
    );

    await utility.delay(5000);
    const expectedData = await utility.readJsonFile(
      'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json'
    );
    const queryresults: any = await prisma.$queryRaw(
      Prisma.sql`SELECT MerchantPaymentPlatform.id, MerchantPaymentPlatform.merchantId, MerchantPaymentPlatform.paymentPlatformId, MerchantPaymentPlatform.default , PaymentPlatform.label , PaymentPlatform.vendor , PaymentPlatform.variant FROM MerchantPaymentPlatform INNER JOIN PaymentPlatform ON MerchantPaymentPlatform.paymentPlatformId = PaymentPlatform.id WHERE MerchantPaymentPlatform.merchantId = ${merchantID} `
    );
    await utility.delay(4000);
    console.log('Query resopnse', queryresults);
    expectedData.merchant.MerchantPaymentPlatform = queryresults;
    await utility.writeIntoJsonFile(
      merchantName,
      expectedData,
      'configurations/merchants-products-configuration/' + merchantName
    );

    await utility.delay(5000);
    const extractedJSONData = await utility.readJsonFile(
      'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json'
    );
    const queryresults1: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM MerchantPaymentPlatformCurrency WHERE merchantPaymentPlatformId = ${extractedJSONData.merchant.MerchantPaymentPlatform[0].id} `
    );

    await utility.delay(4000);
    console.log('Query resopnse here is ', queryresults1);
    const MerchantPaymentPlatformCurrency = {
      MerchantPaymentPlatformCurrency: queryresults1,
    };
    let defaultVal;
    if (extractedJSONData.merchant.MerchantPaymentPlatform[0].default == 1) {
      defaultVal = true;
    } else {
      defaultVal = false;
    }
    extractedJSONData.merchant.MerchantPaymentPlatform[0].default = defaultVal;
    await Object.assign(
      extractedJSONData.merchant.MerchantPaymentPlatform[0],
      MerchantPaymentPlatformCurrency
    );
    await utility.delay(4000);
    await utility.writeIntoJsonFile(
      merchantName,
      extractedJSONData,
      'configurations/merchants-products-configuration/' + merchantName
    );
    //to get submerchants
    if (extractedJSONData.merchant.merchantGroupId != null) {
      const queryresultssubmerchant: any = await prisma.$queryRaw(
        Prisma.sql`SELECT * FROM SubMerchant WHERE merchantId = ${extractedJSONData.merchant.id} `
      );
      utility.delay(4000);
      console.log('submerchants length', results.length);
      for (let i = 0; i < queryresultssubmerchant.length; i++) {
        queryResult.merchant.MerchantDefaultRefundPolicy = [];
        queryResult.merchant = extractedJSONData.merchant;
        queryResult.merchant.MerchantPaymentPlatform =
          extractedJSONData.merchant.MerchantPaymentPlatform;
        queryResult.merchant.id = queryresultssubmerchant[i].id;
        queryResult.merchant.name = queryresultssubmerchant[i].name;
        queryResult.merchant.companyEmail =
          queryresultssubmerchant[i].companyEmail;
        queryResult.merchant.merchantSupportEmail =
          queryresultssubmerchant[i].merchantSupportEmail;
        queryResult.merchant.customerSupportEmail =
          queryresultssubmerchant[i].customerSupportEmail;
        utility.delay(4000);
        utility.writeIntoJsonFile(
          queryresultssubmerchant[i].name,
          queryResult,
          'configurations/merchants-products-configuration/' +
            queryresultssubmerchant[i].name
        );
        utility.delay(4000);
      }
    }
  }
  env = config.LocalEnv.env;

  async updateMerchantProducts(merchantName: string) {
    const merchantData = await utility.readJsonFile(
      'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json'
    );
    const allMerchantConfig = { merchant: {}, products: { itemArray: [] } };

    //adding merchant products
    const merchantProducts = merchantDemo.find(
      (it) => it.merchantId === merchantData.merchant.id
    );
    console.log('merchant products ', merchantProducts);
    let itemArray = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (let i = 0; i < merchantProducts.items.length; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      itemArray.push(merchantProducts.items[i].productName);
    }

    console.log('itemArray ', itemArray);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allMerchantConfig.merchant = merchantData.merchant;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allMerchantConfig.products = merchantProducts;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allMerchantConfig.products.itemArray = itemArray;
    console.log('allMerchantConfig ', allMerchantConfig);

    utility.delay(4000);
    utility.writeIntoJsonFile(
      merchantName,
      allMerchantConfig,
      'configurations/merchants-products-configuration/' + merchantName
    );
    //to get submerchants
    if (merchantData.merchant.merchantGroupId != null) {
      const results: any = await prisma.$queryRaw(
        Prisma.sql`SELECT * FROM SubMerchant WHERE merchantId = ${merchantData.merchant.id} `
      );
      utility.delay(4000);
      console.log('Query resopnse here', results[0]);
      console.log('length', results.length);
      for (let i = 0; i < results.length; i++) {
        itemArray = [];
        let subMerchantData = readFileSync(
          'tests/setup/configurations/merchants-products-configuration/' +
            results[i].name +
            '/' +
            results[i].name +
            '.json',
          'utf-8'
        );
        subMerchantData = JSON.parse(subMerchantData);
        // const subMerchantData:any = utility.readJsonFile(
        //   'configurations/merchants-products-configuration/'+merchantName+'/'+results[i].name+'/'+
        //   results[i].name +
        //     '.json'
        // );
        console.log('subMerchantData ', subMerchantData);
        const submerchantsProducts = subMerchantDemo.find(
          (merchant) => merchant.subMerchantId == subMerchantData.merchant.id
        );
        console.log('submerchants ', submerchantsProducts);
        for (let i = 0; i < submerchantsProducts.items.length; i++) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          itemArray.push(submerchantsProducts.items[i].productName);
        }
        allMerchantConfig.merchant = subMerchantData.merchant;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allMerchantConfig.products = submerchantsProducts;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allMerchantConfig.products.itemArray = itemArray;
        utility.delay(4000);
        utility.writeIntoJsonFile(
          results[i].name,
          allMerchantConfig,
          'configurations/merchants-products-configuration/' + results[i].name
        );
        utility.delay(4000);
      }
    }
  }

  async getMerchantUser(merchantName: string) {
    const expectedData = await utility.readJsonFile(
      'configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json'
    );
    const allMerchantConfig = { user: {} };
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT UserMerchantRole.userId, User.emailAddress, User.phoneNumber, User.firstName, User.lastName FROM 
      UserMerchantRole INNER JOIN User ON UserMerchantRole.userId = User.id WHERE UserMerchantRole.merchantId = 
      ${expectedData.merchant.id} `
    );
    utility.delay(4000);
    console.log('Query resopnse', results);
    allMerchantConfig.user = results[0];
    utility.writeIntoJsonFile(
      results[0].firstName,
      allMerchantConfig,
      'configurations/merchants-users-configuration'
    );
  }
  /*
  async fetchAndWriteMerchant(merchantName: any, merchantId: any) {
    // console.log('merchant id from signin function', merchantId);
    try {
      const url = process.env.PLANPAY_NEXT_URL;
      console.log(url);
      const client = createTRPCProxyClient({
        transformer: superjson,
        links: [
          httpBatchLink({
            url: `${url}/api/trpc`,
            fetch,
            headers() {
              return {
                Authorization: 'Bearer ' + process.env.APP_INTERNAL_REQUEST_KEY,
              };
            },
          }),
        ],
      });

      console.log('client.merchant ', client.merchant);

      console.log('merchant Id ', merchantId);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const merchant = await client.merchant.getMerchant.query({
        id: merchantId,
      });
      console.log('merchant ',merchant)
      const merchantProducts = merchantDemo.find(
        (it) => it.merchantId === merchantId
      );
      const itemArray = [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (let i = 0; i < merchantProducts.items.length; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        itemArray.push(merchantProducts.items[i].description);
      }

      console.log('itemArray ', itemArray);

      const allMerchantConfig = { merchant: {}, products: { itemArray: [] } };
      allMerchantConfig.merchant = merchant;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allMerchantConfig.products = merchantProducts;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allMerchantConfig.products.itemArray = itemArray;

      console.log('allMerchantConfig', allMerchantConfig.merchant);

      await utility.writeIntoJsonFile(
        merchantName,
        allMerchantConfig,
        'configurations/merchants-products-configuration'
      );
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
*/
  async fetchAndWriteMerchantUser(userId: any) {
    // console.log('merchant id from signin function', merchantId, userId);
    try {
      const url = process.env.PLANPAY_NEXT_URL;
      console.log(url);
      const client = createTRPCProxyClient({
        transformer: superjson,
        links: [
          httpBatchLink({
            url: `${url}/api/trpc`,
            fetch,
            headers() {
              return {
                Authorization: 'Bearer ' + process.env.APP_INTERNAL_REQUEST_KEY,
              };
            },
          }),
        ],
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const user = await client.user.getUser.query({
        id: userId,
      });
      const allMerchantConfig = { user: {} };
      allMerchantConfig.user = user;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log('allMerchantConfig', allMerchantConfig.user.firstName);

      await utility.writeIntoJsonFile(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allMerchantConfig.user.firstName,
        allMerchantConfig,
        'configurations/merchants-users-configuration'
      );
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}
