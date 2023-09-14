import { Utilities } from '../utilities';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import { expectedConfig } from '../../header';
import { Prisma } from '@prisma/client';
import { prisma } from '@planpay/planpay-next-lib';
import { merchantConfig } from '../../setup/expected/merchant-ts.conf';
const utility = new Utilities();

export class databaseConnectDisconnect {
  async getMerchantDetails(merchantName: any) {
    await prisma.$connect();
    console.log(
      "\u001b[1;32mLet's wait we are looking Merchant Type from DataBase!..\u001b[1;37m."
    );
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT * FROM SubMerchant WHERE name =
    ${merchantName} `);
    await utility.delay(4000);
    if (results.length == 0) {
      console.log(merchantName, ' is a Merchant.');
      const results1: any =
        await prisma.$queryRaw(Prisma.sql`SELECT * FROM Merchant WHERE name =
          ${merchantName} `);
      await utility.delay(4000);
      expectedConfig.merchantDetails.merchantId = results1[0].id;
      expectedConfig.merchantDetails.merchantName = results1[0].name;
      expectedConfig.merchantDetails.checkoutCategory = 'merchant';
    } else {
      console.log(merchantName, ' is a Sub-Merchant. ');
      expectedConfig.merchantDetails.sub_merchantId = results[0].id;
      expectedConfig.merchantDetails.sub_merchantName = results[0].name;
      expectedConfig.merchantDetails.checkoutCategory = 'submerchant';
      console.log(
        "\u001b[1;32mLet's wait we are looking parent Merchant from DataBase!..\u001b[1;37m."
      );
      const results2: any =
        await prisma.$queryRaw(Prisma.sql`SELECT * FROM Merchant WHERE id =
          ${results[0].merchantId} `);

      utility.delay(4000);
      // console.log('Merchant ID Results', results);
      expectedConfig.merchantDetails.merchantId = results2[0].id;
      expectedConfig.merchantDetails.merchantName = results2[0].name;
    }
  }

  async verifyEmailExist(email: any) {
    console.log(
      '\u001b[1;32mVerifying Email Address from DataBase!..\u001b[1;37m.'
    );
    console.log('email ', email);
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM User WHERE emailAddress = ${email}`
    );
    await utility.delay(4000);
    if (results.length == 0) {
      console.log(
        '\u001b[1;32mUser does not Exists in the DataBase!..\u001b[1;37m.'
      );
      expectedConfig.flags.userExists = 'false';
    } else {
      console.log('\u001b[1;31mUser email is already Exists!..\u001b[1;37m.');
      expectedConfig.flags.userExists = 'true';
    }
  }

  async allTransactions() {
    const results = await prisma.$queryRaw(
      Prisma.sql`SELECT t.id as transaction_id,t.label as transaction_label,t.eventId as transaction_eventId,t.debitAmount as transaction_debitAmount,t.creditAmount as transaction_creditAmount,t.accountCode as transaction_accountCode, t.accountId as transaction_accountId,t.currencyCode as transaction_currencyCode,t.amountInUsd as transaction_amountInUsd,t.planId as transaction_planId, t.creditCardTransactionId as transaction_creditCardTransactionId,t.createdAt as transaction_createdAt,t.updatedAt as transaction_updatedAt, t.taxRate as transaction_taxRate,e.id as event_id,e.type as event_type,e.planId as event_planId,e.createdAt as event_createdAt,e.payload ->>  '$.userPaymentMethodId' AS event_userPaymentMethodId, e.payload ->>  '$.paymentGatewayFee' AS event_paymentGatewayFee,p.id as plan_id,p.merchantId as plan_merchantId,p.userId as plan_userId,p.currencyCode as plan_currencyCode,p.status as plan_status,p.pausePaymentUntil as plan_pausePaymentUntil,p.installmentFrequency as plan_installmentFrequency,p.cadenceOnDayOfMonth as plan_cadenceOnDayOfMonth,p.cadenceOnDayOfWeek as plan_cadenceOnDayOfWeek,p.timeZone as plan_timeZone,p.serviceFeePercentage as plan_serviceFeePercentage,p.createdAt as plan_createdAt,p.updatedAt as plan_updatedAt,p.userPaymentMethodId as plan_userPaymentMethodId,p.checkoutId as plan_checkoutId, p.effectiveDate as plan_effectiveDate,c.id as checkout_id,c.created as checkout_created,c.merchantId as checkout_merchantId, c.merchantOrderId as checkout_merchantOrderId, c.currencyCode as checkout_currencyCode, c.redirectURL as checkout_redirectURL, c.timeZone as checkout_timeZone, c.createdAt as checkout_createdAt, c.updatedAt as checkout_updatedAt, c.expiry as checkout_expiry,m.id as merchant_id,m.name as merchant_name,m.companyEmail as merchant_companyEmail, m.phoneNumber as merchant_phoneNumber,m.merchantSupportEmail as merchant_merchantSupportEmail,m.customerSupportEmail as merchant_customerSupportEmail, m.merchantPageUrl as merchant_merchantPageUrl,m.billingAddressId as merchant_billingAddressId,m.defaultPaymentDeadlineInDays as merchant_defaultPaymentDeadlineInDays, m.serviceFeePercentage as merchant_serviceFeePercentage,m.createdAt as merchant_createdAt,m.updatedAt as merchant_updatedAt,m.defaultMinimumDepositType as merchant_defaultMinimumDepositType, m.defaultMinimumDepositValue as merchant_defaultMinimumDepositValue,u.id as user_id,u.emailAddress as user_emailAddress, u.phoneNumber as user_phoneNumber,u.firstName as user_firstName, u.lastName as user_lastName,u.status as user_status, u.defaultLocale as user_defaultLocale,u.billingAddressId as user_billingAddressId, u.createdAt as user_createdAt,upm.id as userPaymentMethod_id, upm.description as userPaymentMethod_description,upm.last4Digits as userPaymentMethod_last4Digits, upm.expMonth as userPaymentMethod_expMonth,upm.expYear as userPaymentMethod_expYear, upm.cardBrand as userPaymentMethod_cardBrand,upm.funding as userPaymentMethod_funding, upm.createdAt as userPaymentMethod_createdAt,upm.updatedAt as userPaymentMethod_updatedAt, upi.externalCustomerId as userPaymentIdentity_externalCustomerId, pp.id as paymentPlatform_id,pp.label as paymentPlatform_label, pp.vendor as paymentPlatform_vendor,pp.variant as paymentPlatform_variant, mppc.markupFeePercentage as MerchantPaymentPlatformCurrency_markupFeePercentage, group_concat( i.sku ) item_skus,sum( i.quantity * i.costPerItem ) item_total, min( redemptionDate ) as item_min_redemptionDate,max( paymentDeadline ) as item_max_paymentDeadline FROM Transaction t left join Event e on e.id = t.eventId join Plan p on p.id = t.planId join Checkout c on c.id = p.checkoutId join Merchant m on m.id = p.merchantId join User u on u.id = p.userId left join UserPaymentMethod upm on e.payload ->> '$.userPaymentMethodId' = upm.id left join UserPaymentIdentity upi on upm.userPaymentIdentityId = upi.id left join MerchantPaymentPlatform mpp on upi.merchantPaymentPlatformId = m.id left join MerchantPaymentPlatformCurrency mppc on mppc.merchantPaymentPlatformId = mpp.id and mppc.currencyCode = p.currencyCode left join PaymentPlatform pp on pp.id = mpp.paymentPlatformId join Item i on i.planId = p.id group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83`
    );
    utility.delay(4000);
    console.log('Query resopnse', results);
    fs.writeFile(
      'tests/setup/actual/financialdata.csv',
      JSON.stringify(results),
      (err: any) => {
        if (err) console.log('Error writing file:', err);
      }
    );
  }

  async getPlanDetails(planID: any) {
    const results = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM Plan WHERE id = ${planID}`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    await utility.writeIntoJsonFile('plan-details', results, 'actual');
  }

  async getEmailAddress(planId: string) {
    const results = await prisma.$queryRaw(
      Prisma.sql`SELECT User.emailAddress FROM Plan INNER JOIN User ON User.id = Plan.userId WHERE Plan.id = ${planId}`
    );
    await utility.delay(4000);
    console.log(results);
  }

  async getCustomerDetails(emailAddress: any) {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM User WHERE emailAddress = ${emailAddress}`
    );
    await utility.delay(4000);
    if (results.length == 0) {
      console.log(
        '\u001b[1;31mUser does not Exists in the DataBase!..\u001b[1;37m.'
      );
    } else {
      console.log('Query Responce =>', results);
    }
    await utility.writeIntoJsonFile('user-details', results, 'actual');
  }

  async getRefundPolicies(merchantName: any, merchantId: any) {
    console.log('merchant name ', merchantId);
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT MerchantDefaultRefundPolicy.merchantId, MerchantDefaultRefundPolicy.refundPolicyId , RefundPolicy.type , RefundPolicy.daysWithinRedemptionDate , RefundPolicy.refundablePercentage FROM MerchantDefaultRefundPolicy INNER JOIN RefundPolicy ON MerchantDefaultRefundPolicy.refundPolicyId = RefundPolicy.id WHERE MerchantDefaultRefundPolicy.merchantId = ${merchantId} `
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    //Read merchant json file.
    const extractedData = await readFileSync(
      'tests/setup/configurations/merchants-products-configuration/' +
        merchantName +
        '/' +
        merchantName +
        '.json',
      'utf-8'
    );
    const expectedData = await JSON.parse(extractedData);
    console.log('json', expectedData);
    expectedData.merchant.MerchantDefaultRefundPolicy = results;
    await utility.writeIntoJsonFile(
      merchantName,
      expectedData,
      'configurations/merchants-products-configuration/' + merchantName
    );
  }

  async getCurrencyDetails(currencyCode: string) {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM Currency WHERE currencyCode = ${currencyCode} `
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    if (results.length != 0) {
      await utility.writeIntoJsonFile(
        currencyCode,
        results,
        'configurations/currency'
      );
    }
  }

  async getEventProcessorErrors() {
    const commonValues = await utility.readCustomerDetails();
    let eventProcessorError = '';
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT * FROM EventProcessor WHERE errorCount != 0 `
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);

    if (results.length != 0) {
      eventProcessorError = 'true';
      await utility.writeIntoJsonFile(
        'eventProcessor_errors',
        results,
        'expected'
      );
    } else {
      eventProcessorError = 'false';
    }
    commonValues.eventProcessorError = eventProcessorError;
    await utility.writeIntoJsonFile('common-details', commonValues, 'expected');
  }

  async getSumOfDebitCreditForTransction(planId: string) {
    console.log('planId = > ', planId);
    // const tableName = 'Transaction';
    let TotalDebitAmount = 0;
    let TotalCreditAmount = 0;

    if (planId === 'ALL') {
      const results: any = await prisma.$queryRaw(
        Prisma.sql`SELECT SUM(debitAmount) AS TotalDebitAmount , SUM(creditAmount) AS TotalCreditAmount FROM Transaction`
      );

      await utility.delay(4000);
      console.log('Query resopnse', results);

      if (results.length != 0) {
        TotalDebitAmount = results[0]['TotalDebitAmount'];
        TotalCreditAmount = results[0]['TotalCreditAmount'];

        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m Query result Run on full transacction table  \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
        console.log('Total Debit Amount => ', TotalDebitAmount);
        console.log('Total Credit Amount => ', TotalCreditAmount);

        if (Number(TotalDebitAmount) == Number(TotalCreditAmount)) {
          console.log(
            '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount Run on full transacction table \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
          );
        } else {
          console.log(
            '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is not equal to Credit Amount Run on full transacction table \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
          );
        }
      }
    } else {
      const results: any = await prisma.$queryRaw(
        Prisma.sql`SELECT SUM(debitAmount) AS TotalDebitAmount , SUM(creditAmount) AS TotalCreditAmount FROM Transaction WHERE planId = ${planId}`
      );

      await utility.delay(4000);
      console.log('Query resopnse', results);

      if (results.length != 0) {
        TotalDebitAmount = results[0]['TotalDebitAmount'];
        TotalCreditAmount = results[0]['TotalCreditAmount'];

        console.log(
          '%%%%%%%%%%%%%%%%\x1b[35m Query result for plan id',
          planId,
          '  \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
        );
        console.log('Total Debit Amount => ', TotalDebitAmount);
        console.log('Total Credit Amount => ', TotalCreditAmount);

        if (Number(TotalDebitAmount) == Number(TotalCreditAmount)) {
          console.log(
            '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is equal to Credit Amount for plan id',
            planId,
            ' \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
          );
        } else {
          console.log(
            '%%%%%%%%%%%%%%%%\x1b[35m Debit Amount is not equal to Credit Amount for plan id',
            planId,
            ' \x1b[37m%%%%%%%%%%%%%%%%%%%%%% '
          );
        }
      }
    }
  }

  async identify_gateway() {
    console.log('merchant id ', expectedConfig.merchantDetails.merchantId);
    console.log(
      'checkout currency ',
      expectedConfig.planSummary.checkoutCurrency
    );
    const results: any =
      await prisma.$queryRaw(Prisma.sql`SELECT pp.vendor as paymentPlatform_vendor,pp.variant as paymentPlatform_variant FROM Merchant m join
    MerchantPaymentPlatform mpp on mpp.merchantId = m.id join
    MerchantPaymentPlatformCurrency mppc on mppc.merchantPaymentPlatformId = mpp.id join
    PaymentPlatform pp on mpp.paymentPlatformId = pp.id where m.id =
    ${expectedConfig.merchantDetails.merchantId} and m.status ="Active" and mppc.currencyCode=
    ${expectedConfig.planSummary.checkoutCurrency}`);

    await utility.delay(2000);
    console.log('Query resopnse ', results[0]);
    if (results.length == 0) {
      expectedConfig.flags.blockedCheckout = 'true';
    } else {
      console.log('Query resopnse ', results[0]);
      expectedConfig.planSummary.paymentPlatform_vendor =
        results[0].paymentPlatform_vendor;
      expectedConfig.planSummary.paymentPlatform_variant =
        results[0].paymentPlatform_variant;
    }
  }

  async get_createdmerchant() {
    const results: any = await prisma.$queryRaw(
      Prisma.sql`SELECT id FROM Merchant WHERE name = ${merchantConfig.merchant.name}`
    );
    await utility.delay(4000);
    console.log('Query resopnse', results);
    if (results.length != 0) {
      console.log('Merchant Id', results);
    }
  }
}
