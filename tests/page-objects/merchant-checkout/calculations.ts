import { page } from '../../features/support/hooks';
// import { expect } from '@playwright/test';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
const UpcomingPayments = expectedConfig.UpcomingPayments;
import { Utilities } from '../utilities';
const utility = new Utilities();
import Stripe from 'stripe';
import { config } from '../../setup/configurations/test-data-ts.conf';
let due_today_locator = "[data-planpay-test-id='first_instalment_amount']";

export class calculations {
  incrementButton = "[data-planpay-test-id='plus_btn']";
  decrementButton = "[data-planpay-test-id='minus_btn']";

  stripe = new Stripe(process.env.STRIPE_MN_AUD_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
  });

  static merchantConfiguration: any;
  static merchantCurrency: any;
  static selectTypeInstallment: any;
  static selectTypenumberofInstallment: any;
  static actualDeposit: any;
  static actualDepositwithRemainder: any;

  async calculateMerchantFeeExclTax(settlementAmount: number) {
    const merchanFeeExclTax: number = (5 / 100) * settlementAmount + 0.15;
    expectedConfig.planSummary.MerchantFeeExclTax =
      merchanFeeExclTax.toFixed(2);
  }
  async calculateMerchantFeeTax() {
    const merchantFeeTax: number =
      (10 / 100) * Number(expectedConfig.planSummary.MerchantFeeExclTax);
    expectedConfig.planSummary.MerchantFeeTax = merchantFeeTax.toFixed(2);
  }
  async calculateMerchantFeeinclTax() {
    const MerchantFeeInclTax =
      (await parseFloat(expectedConfig.planSummary.MerchantFeeExclTax)) +
      (await parseFloat(expectedConfig.planSummary.MerchantFeeTax));
    expectedConfig.planSummary.MerchantFeeinclTax =
      MerchantFeeInclTax.toFixed(2);
  }

  async calculateMaxDepositAmount() {
    expectedConfig.planSummary.currencySymbol =
      calculations.merchantCurrency.currencySymbol;
    console.log(
      'currency here ',
      calculations.merchantCurrency.minimumPaymentAmount
    );
    // totalCost-currency,{merchantName.currencyCode).minimumPaymentAmount
    const calculateMaxDepositAmount =
      Number(expectedConfig.planSummary.totalCost) -
      calculations.merchantCurrency.minimumPaymentAmount;
    // (await 10.0) * Number(expectedConfig.planSummary.numberOfInstalment);
    expectedConfig.depositSettings.MaxDepositAmount =
      await calculateMaxDepositAmount.toString();
    if (
      Number(expectedConfig.depositSettings.MaxDepositAmount) >
        calculations.merchantCurrency.maximumPaymentAmount &&
      expectedConfig.planSummary.paymentPlatform_variant == 'Managed'
    ) {
      expectedConfig.depositSettings.MaxDepositAmount = String(
        await utility.upto2Decimal(
          calculations.merchantCurrency.maximumPaymentAmount
        )
      );
    }
    expectedConfig.depositSettings.MaxDepositAmount_rounddown = String(
      await utility.RoundUpRoundDownNear50(
        Number(expectedConfig.depositSettings.MaxDepositAmount),
        'roundDown'
      )
    );
    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      expectedConfig.depositSettings.MaxDepositAmount_rounddown = String(
        await utility.upto2Decimal(
          Number(expectedConfig.depositSettings.MaxDepositAmount)
        )
      );
    }
    console.log(
      'MAX DEPOSIT ==>' + expectedConfig.depositSettings.MaxDepositAmount
    );
    console.log(
      'MaxDepositAmount_rounddown=>',
      expectedConfig.depositSettings.MaxDepositAmount_rounddown
    );
  }

  async calculatenoOfInstallmentsToBePaid() {
    // noOfInstallmentsToBePaid = totalNoOfInstallments - noOfInstallmentsPaid
    let totalInstalments = '';
    if (expectedConfig.LocalEnv.applicationName == 'assisted-checkout') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      totalInstalments =
        expectedConfig.planSummary[expectedConfig.LocalEnv.installmentType]
          .totalNoOfInstallments;
    } else {
      totalInstalments = expectedConfig.planSummary.totalNoOfInstallments;
    }
    const noOfInstallmentsToBePaid =
      (await Number(totalInstalments)) -
      Number(expectedConfig.planSummary.noOfInstallmentsPaid);
    console.log('total No Of Instalments', totalInstalments);
    console.log(
      'no Of Instalments Paid',
      expectedConfig.planSummary.noOfInstallmentsPaid
    );
    expectedConfig.planSummary.noOfInstallmentsToBePaid =
      await noOfInstallmentsToBePaid.toString();
    console.log(
      'no Of Instalments ToBe Paid',
      expectedConfig.planSummary.noOfInstallmentsToBePaid
    );
  }

  // async calculatePlanPayFees(amount: number) {
  //   //calculating planpayfee & assigning into expectedConfig planpayfee variable.
  //   // serviceFeePercentage/ 100 * amount + 0.15 * noOfInstallmentPaid
  //   expectedConfig.fees.planpayfee = String(
  //     (
  //       (calculations.merchantConfiguration.merchant.serviceFeePercentage /
  //         100) *
  //         amount +
  //       0.15 * Number(expectedConfig.planSummary.noOfInstallmentsPaid)
  //     ).toFixed(2)
  //   );
  // }

  // async calculateMerchantRevenue() {
  //   const revenue =
  //     Number(expectedConfig.planSummary.totalCost) -
  //     Number(expectedConfig.fees.planpayfee);
  //   const revenueString = revenue.toFixed(2);
  //   expectedConfig.fees.MerchantRevenue = revenueString.toString();
  //   console.log('My Revenue', revenueString);
  // }

  async products_total_cost_calcuation(priceArray: any, quantityArray: any) {
    //calculate plan total
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m PlanPay Widget Screen \x1b[37m%%%%%%%%%%%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%\x1b[35m Calculated Values on Planpay Widget Screen \x1b[37m%%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );

    let products_total_cost = 0;
    let results = 0;

    for (let i = 0; (await i) < quantityArray.length; i++) {
      // if(priceArray[i].includes(',')){
      priceArray[i] = priceArray[i].replace(/[^0-9.]/g, '');
      // }
      //multiplying product amount with quantity
      results = await (Number(priceArray[i]) * quantityArray[i]);
      products_total_cost = await (products_total_cost + results);
    }
    products_total_cost = await utility.upto2Decimal(products_total_cost);

    expectedConfig.planSummary.totalCost = await products_total_cost.toString(); //saving plan total into config file
    console.log('Calculated Total Cost is ' + products_total_cost);
  }

  async calculateFinalCompletionDate(redemptionDate: any, productItem?: any) {
    //calculate final completion date of each product
    const finalCompletionDates = [];
    let length = 1;
    let items = [];
    if (productItem) {
      items = productItem.split('$');
      length = await items.length;
    } else {
      items.push(expectedConfig.merchantDetails.merchantName);
    }
    console.log('items contains ', items);
    const dates = redemptionDate.split(',');
    const paymentDeadlineSettings = await this.commonFunction(
      'paymentDeadline',
      productItem
    );
    console.log('paymentDeadlineSettings ', paymentDeadlineSettings);
    const paymentDeadline = paymentDeadlineSettings[1];
    for (let i = 0; i < length; i++) {
      // await this.determinePaymentDeadline(items[i]);
      console.log(
        'Payment Deadline Retrieved from Merchant configuration file for ' +
          items[i] +
          ' is ' +
          paymentDeadline[i]
      );
      const newdate = await new Date(dates[i]);
      await newdate.setDate(newdate.getDate() - paymentDeadline[i]);
      const formatedDate = await newdate.toLocaleString('en-GB');
      const formatedDateArray = await formatedDate.split(',');
      await finalCompletionDates.push(formatedDateArray[0]); //adding final completion date into array
    }
    if (expectedConfig.LocalEnv.applicationName == 'assisted-checkout') {
      const formatedDated = await this.getredemptionDate(
        finalCompletionDates[0]
      );
      const formatedDated1 =
        formatedDated[2] + '/' + formatedDated[1] + '/' + formatedDated[0];
      const formatedDated2 = new Date(formatedDated1);
      const formatedDate = await formatedDated2.toLocaleString('en-GB');
      const formated_Date = await formatedDate.split(',');

      expectedConfig.planSummary.completionDate = formated_Date[0];
      console.log('calculated completion date is ', formated_Date);
    }
    return finalCompletionDates;
  }
  async calculatePercentageInstallmentPaid() {
    const deposit = Number(expectedConfig.planSummary.totalFunds);
    console.log('deposit ' + deposit);
    const totalAmount = expectedConfig.planSummary.totalCost;
    console.log('total ' + totalAmount);

    const percentage = await (
      ((await Number(deposit)) / (await Number(totalAmount))) *
      100
    ).toFixed();
    expectedConfig.planSummary.percentageInstallmentPaid =
      await percentage.toString();
    console.log('Calculated Percentage is ' + percentage);
  }

  async getEarlierCompletionDate(redemptionDate: any) {
    const productredemptionDates = [];
    const dates = redemptionDate;
    for (let i = 0; i < dates.length; i++) {
      const formatedDated = await this.getredemptionDate(dates[i]);
      const formatedDated1 =
        formatedDated[2] + '/' + formatedDated[1] + '/' + formatedDated[0];
      await productredemptionDates.push(formatedDated1);
    }
    const earlierDate = await utility.getEarlierDate(productredemptionDates); //return the earlier date among all dates
    const formatedDate = await earlierDate.toLocaleString('en-GB');

    const formatedDateArray = await formatedDate.split(',');
    expectedConfig.planSummary.completionDate = formatedDateArray[0]; //saving completion date into config variable
    console.log('Calculated Completion Date ' + formatedDateArray[0]);
  }

  async getredemptionDate(redemptionDate: any) {
    return await utility.convertDateStringtoArray(redemptionDate);
  }
  async determineDepositRule(producItem?: any) {
    // expectedConfig.merchantDetails.merchantId =
    //   calculations.merchantConfiguration.merchant.id;
    let merchantProduct;
    //determine whether merchant or product level deposit will be applied
    if (producItem) {
      const products = producItem.split('$');
      // const product = products[0].replace(/\s/g, '');
      const product = products[0];
      merchantProduct = calculations.merchantConfiguration.products.items.find(
        (item: { productName: string }) => item.productName == product
      );
    } else {
      merchantProduct = undefined;
    }
    if (merchantProduct != undefined) {
      if (merchantProduct?.minimumDepositPerItem?.unit != null) {
        //if product minimum deposit is given
        expectedConfig.depositSettings.depositRuleApplied =
          'productMinimumDeposit';
      } else if (
        calculations.merchantConfiguration.merchant.defaultMinimumDepositType
      ) {
        //merchant level deposit from merchant configurations
        expectedConfig.depositSettings.depositRuleApplied =
          'globalMinimumDeposit';
      } else {
        expectedConfig.depositSettings.depositRuleApplied =
          'evenInstalmentAmount';
      }
    } else {
      expectedConfig.depositSettings.depositRuleApplied =
        'globalMinimumDeposit';
    }
    console.log(
      'Deposit Rule Applied ' +
        expectedConfig.depositSettings.depositRuleApplied
    );
  }

  async calculateDefaultMinDepositAmount(
    productsAmount: any,
    productsQuantity: any,
    producItem?: any
  ) {
    //calculates deposit based on applied rule
    let depositAmount = 0;
    let length = 1;
    let items = [];
    if (producItem) {
      items = await producItem.split('$');
      length = await items.length;
    } else {
      items.push('merchant');
    }
    const settings = await this.commonFunction(
      'minimumDepositPerItem',
      producItem
    );
    console.log('settings is ', settings);
    for (let i = 0; i < length; i++) {
      //loop through each product to calculate deposit
      depositAmount = await (depositAmount +
        (await this.calculateDeposit(
          items[i],
          productsAmount[i],
          productsQuantity[i],
          settings[1][i]
        )));
    }
    console.log('deposit amount is ', depositAmount);

    depositAmount = await utility.upto2Decimal(depositAmount);
    expectedConfig.depositSettings.requiredMinimumDeposit_roundup = String(
      await utility.RoundUpRoundDownNear50(depositAmount, 'roundUp')
    );

    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      if (depositAmount < calculations.merchantCurrency.minimumPaymentAmount) {
        depositAmount = calculations.merchantCurrency.minimumPaymentAmount;
        depositAmount = await utility.upto2Decimal(depositAmount);
      }
      expectedConfig.depositSettings.requiredMinimumDeposit_roundup =
        String(depositAmount);
    }
    console.log('Calculated Deposit Amount ' + depositAmount);
    console.log(
      'requiredMinimumDeposit_roundup=>',
      expectedConfig.depositSettings.requiredMinimumDeposit_roundup
    );
    expectedConfig.depositSettings.requiredMinimumDeposit =
      await depositAmount.toString(); // saving total min deposit into config

    // await this.calculateTotalNonRefundableDeposit(producItem); //to get total non refundable deposit
  }

  async calculateDeposit(
    producItem: any,
    productsAmount: any,
    productsQuantity: any,
    settings: any
  ) {
    let deposit;
    const depositRule = settings.unit;
    const value = settings.value;

    if (depositRule == 'Percentage') {
      deposit = (await (productsAmount / 100)) * value;
      deposit = await (deposit * productsQuantity);
    } else {
      deposit = await (value * productsQuantity);
    }
    /*comenting out this code as couldn't find nonRefundable deposit in merchant.ts
    if (producItem != 'merchant') {
      //saving nonRefundableDeposit against each item
      const product: any = expectedConfig.planDetails.items.find(
        (i: { description: string }) => i.description == producItem
      );
      let nonRefundableDeposit;

      
      if (
        product.depositRefundable == true ||
        expectedConfig.planSummary?.depositRefundable == true
      ) {
        nonRefundableDeposit = 0;
      } else {
        nonRefundableDeposit = deposit;
      }
      const productProperty = {
        nonRefundableDeposit: nonRefundableDeposit,
      };
      Object.assign(product, productProperty);
    }*/
    return deposit;
  }

  async calculateInstalmentAmount(
    type?: any,
    deposit?: any,
    depositRule?: string
  ) {
    await this.readMerchantFile();
    //calculates instalment amount by subtracting deposit from totalcost and dividing by no of instalments
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let total_Amount;
    let noOfInstalments;
    let instalmentAmount;
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      total_Amount = await Number(expectedConfig.planSummary.remainingAmount);
      noOfInstalments = Number(expectedConfig.planSummary.numberOfInstalment);
      deposit = 0;
    } else {
      deposit = await Number(
        expectedConfig.depositSettings.depositExcludingRemainder
      );
      depositRule = expectedConfig.depositSettings.depositRuleApplied;
      // }
      console.log(
        '********instalments are********',
        expectedConfig.planSummary.numberOfInstalment
      );
      console.log(
        '********rule is********',
        expectedConfig.depositSettings.depositRuleApplied
      );
      console.log('********depodit is********', deposit);

      total_Amount = await Number(expectedConfig.planSummary.totalCost);
      noOfInstalments = Number(expectedConfig.planSummary.numberOfInstalment);
    }
    console.log(
      'before calling inst calculations ',
      total_Amount,
      '==',
      deposit,
      ' ===',
      noOfInstalments
    );
    if (
      depositRule == 'evenInstalmentAmount' &&
      expectedConfig.planSummary.checkoutType == 'assisted-checkout'
    ) {
      instalmentAmount = Number(
        Number(expectedConfig.depositSettings.depositPaid)
      );
    } else {
      instalmentAmount = await this.instalmentAmountCalculation(
        total_Amount,
        deposit,
        noOfInstalments
      );
    }

    const minimumPaymentAmount =
      calculations.merchantCurrency.minimumPaymentAmount;
    console.log(
      'minimumPaymentAmount from Currency file ',
      minimumPaymentAmount
    );
    console.log('instalmentAmount ', instalmentAmount);
    while (instalmentAmount < minimumPaymentAmount) {
      // reCalculation = 'true';
      let totalInstalments = Number(
        expectedConfig.planSummary.totalNoOfInstallments
      );
      let noOfInstalment = Number(
        expectedConfig.planSummary.numberOfInstalment
      );
      totalInstalments = totalInstalments - 1;
      noOfInstalment = noOfInstalment - 1;
      expectedConfig.planSummary.totalNoOfInstallments =
        String(totalInstalments);
      expectedConfig.planSummary.numberOfInstalment = String(noOfInstalment);
      instalmentAmount = await this.instalmentAmountCalculation(
        total_Amount,
        deposit,
        noOfInstalment
      );
      expectedConfig.planSummary[
        expectedConfig.planSummary.installmentPeriod
      ].numberOfInstalment = String(noOfInstalment);
      expectedConfig.planSummary[
        expectedConfig.planSummary.installmentPeriod
      ].totalNoOfInstallments = String(totalInstalments);

      if (
        expectedConfig.LocalEnv.installmentType ==
        expectedConfig.planSummary.installmentPeriod
      ) {
        calculations.selectTypeInstallment =
          expectedConfig.planSummary.numberOfInstalment;
        calculations.selectTypenumberofInstallment =
          expectedConfig.planSummary.totalNoOfInstallments;
      }
    }

    // if (reCalculation == 'true') {
    //   await this.calculateMaxDepositAmount(); //calculates maximum deposit
    //   expectedConfig.depositSettings.depositSetting == 'default' //deposit settings-> default OR UserEntered
    //     ? await this.calculateDefaultDeposit()
    //     : await this.inserting_first_Installment_amount(
    //         expectedConfig.depositSettings.depositSetting
    //       );
    // }
    if (type) {
      if (type != 'recalculation') {
        expectedConfig.planSummary.noOfInstallmentsPaid = '1';
      }
    }
    const instalmentAmountString = await utility.upto2Decimal(instalmentAmount);
    console.log('Calculated instalment Amount ' + instalmentAmountString);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (
      expectedConfig.LocalEnv.installmentType ==
      expectedConfig.planSummary.installmentPeriod
    ) {
      expectedConfig.planSummary.installmentAmount = await String(
        instalmentAmountString
      );
    }
    if (
      expectedConfig.planSummary.paymentPlatform_variant == 'Managed' &&
      instalmentAmount > 1000
    ) {
      expectedConfig.planSummary[
        expectedConfig.planSummary.installmentPeriod
      ].status = 'Not available';
    }

    if (
      expectedConfig.LocalEnv.applicationName == 'assisted-checkout' ||
      expectedConfig.LocalEnv.applicationName == 'merchant-testing'
    ) {
      const obj = {
        instalmentAmount: String(instalmentAmountString),
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await Object.assign(
        expectedConfig.planSummary[
          expectedConfig.planSummary.installmentPeriod
        ],
        obj
      );
    }
    return instalmentAmountString;
  }

  async instalmentAmountCalculation(
    total_Amount: number,
    deposit: number,
    noOfInstalments: number
  ) {
    let instalmentAmount = await (total_Amount - deposit);
    instalmentAmount = await (instalmentAmount / noOfInstalments);
    return await utility.upto2Decimal(instalmentAmount);
  }

  async checkSpecialRule(installmentType: any, InstalmentDay: any) {
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%%%%%%% Checking Special Rule %%%%%%%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );
    let firstPaymentDate: any = '';
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      let paymentsFromDate = expectedConfig.planSummary.paymentsFrom;
      const paymentsFromDateArr = await paymentsFromDate.split('/');
      paymentsFromDate =
        paymentsFromDateArr[1] +
        '/' +
        paymentsFromDateArr[0] +
        '/' +
        paymentsFromDateArr[2];
      firstPaymentDate = await new Date(paymentsFromDate);
    } else {
      firstPaymentDate = await new Date();
    }
    const payment_from_formatted = firstPaymentDate;

    let specialRule = 'false';
    let durationSpan = 0;
    let nextInstalmentDate;
    let next;

    if (installmentType == 'Monthly') {
      //monthly case
      InstalmentDay = await Number(InstalmentDay);
      const mon = await firstPaymentDate.getMonth(); //plan month
      let dayBeforePlanDate = 'no';
      if (
        InstalmentDay == 31 ||
        (mon.toString() == '01' && (InstalmentDay == 29 || InstalmentDay == 30))
      ) {
        //special case for feb & last date of every month
        firstPaymentDate = await this.getLastDateOfMonth(
          await firstPaymentDate.getFullYear(),
          await firstPaymentDate.getMonth()
        ); //get last day of month
        console.log('next inst date ' + firstPaymentDate);
      } else if (
        (await firstPaymentDate.getDate()) > InstalmentDay ||
        (await firstPaymentDate.getDate()) == InstalmentDay
      ) {
        //if selected date is lessthan or equal to plandate
        firstPaymentDate = await new Date(firstPaymentDate);
        firstPaymentDate = new Date(
          firstPaymentDate.getFullYear(),
          firstPaymentDate.getMonth() + 1,
          InstalmentDay
        );
        dayBeforePlanDate = 'yes';
      } else {
        firstPaymentDate = await new Date(
          firstPaymentDate.getFullYear(),
          firstPaymentDate.getMonth(),
          InstalmentDay
        );
      }
      const nextInstdate = await utility.getFormatatedDate(
        firstPaymentDate,
        'BR'
      ); //dd/mm/yy
      nextInstalmentDate = await utility.getFormatatedDate(
        firstPaymentDate,
        'US'
      ); //mm//dd/yy
      const first_InstalmentDate = await new Date();
      const differnce = await utility.differenceInDate(
        first_InstalmentDate,
        firstPaymentDate,
        true,
        false
      ); //returns the difference of days between first and next instalment date
      if (differnce < 1 && dayBeforePlanDate == 'no') {
        //special rule applied(monthly)
        specialRule = 'true';
        const mon = await firstPaymentDate.getMonth();
        const day = await firstPaymentDate.getDate();

        if (
          (await day) == 31 ||
          (mon.toString() == '0' && (day == 29 || day == 30))
        ) {
          firstPaymentDate = await this.getLastDateOfMonth(
            await firstPaymentDate.getFullYear(),
            (await firstPaymentDate.getMonth()) + 1
          ); //get last day of month
        } else {
          firstPaymentDate = await new Date(
            firstPaymentDate.getFullYear(),
            firstPaymentDate.getMonth() + 1,
            InstalmentDay
          ); //added 1 month
        }
        nextInstalmentDate = await firstPaymentDate.toLocaleString('en-US');

        firstPaymentDate = await utility.getFormatatedDate(
          firstPaymentDate,
          'BR'
        );

        await this.calculateInstalments(
          installmentType,
          nextInstalmentDate,
          InstalmentDay,
          'specialRule'
        );
        nextInstalmentDate = firstPaymentDate;
      } else {
        console.log('nextInstalmentDate ' + nextInstalmentDate);
        await this.calculateInstalments(
          installmentType,
          nextInstalmentDate,
          InstalmentDay,
          'specialRule'
        );
        if (
          expectedConfig.planSummary.checkoutType == 'assisted-checkout' &&
          expectedConfig.planSummary.operationType != 'updatePlan'
        ) {
          await this.calculationsFunc('selected');
          // await this.calculateRemainder(); //calculates Remainder
          nextInstalmentDate = nextInstdate;
        } else {
          expectedConfig.planSummary.operationType == 'updatePlan'
            ? await this.updatePlanCalculationsFunc()
            : // : await this.calculationsFunc('recalculation');
              await this.newCheckoutCalc('selected');
          nextInstalmentDate = nextInstdate;
        }
      }
    } else {
      //if instalment type is weekly or fortnightly

      const day = await utility.getDateByDay(InstalmentDay, firstPaymentDate); //returns the date of given day in current week
      if ((await day.getDay()) != (await firstPaymentDate.getDay())) {
        //check if user hasn't given same instalment day
        const nextDate = await day.toLocaleString('en');
        nextInstalmentDate = await utility.getFormatatedDate(day, 'US');
        let firstInstalmentDate;
        if (expectedConfig.planSummary.operationType == 'updatePlan') {
          firstInstalmentDate = firstPaymentDate;
        } else {
          firstInstalmentDate = await new Date();
        }
        let differnce = await utility.differenceInDate(
          nextInstalmentDate,
          firstInstalmentDate,
          true,
          false
        ); //returns the difference of days between first and next instalment date

        next = await new Date(nextDate);
        if (installmentType == 'Weekly') {
          if (differnce < 6 || differnce == 6) {
            specialRule = 'true';
            durationSpan = 7;
            await next.setDate(next.getDate() + 7);
            console.log('Calculated next instalment will be on ' + next);
          }
        } else if (installmentType == 'Fortnightly') {
          differnce = differnce + 7;
          if (differnce < 13 || differnce == 13) {
            specialRule = 'true';
            durationSpan = 14;
            await next.setDate(next.getDate() + 14);
            console.log('Calculated next instalment will be on ' + next);
          }
          // eslint-disable-next-line no-empty
        } else {
        }
      }
    }

    if (specialRule == 'true') {
      console.log(
        '\n' + '------------------Special Rule Applied----------------' + '\n'
      );
      if (installmentType != 'Monthly') {
        nextInstalmentDate = await utility.getFormatatedDate(next, 'BR');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const nextInstDate = await next.toLocaleString('en-US');
        await this.calculateInstalments(
          installmentType,
          nextInstDate,
          durationSpan,
          'specialRule'
        );
      }
      if (expectedConfig.flags.blockedCheckout == 'false') {
        if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
          await this.calculationsFunc('selected');
          // await this.calculateRemainder();
        } else {
          expectedConfig.planSummary.operationType == 'updatePlan'
            ? await this.updatePlanCalculationsFunc()
            : // : await this.calculationsFunc('recalculation');
              await this.newCheckoutCalc('selected');
        }
      } else {
        console.log('Checkout is blocked');
      }
    } else {
      let date = new Date();
      if (expectedConfig.planSummary.operationType == 'updatePlan') {
        date = payment_from_formatted;
      }
      if (installmentType == 'Weekly') {
        durationSpan = 7;
        date.setDate(date.getDate() + durationSpan);
        nextInstalmentDate = date;
      } else if (installmentType == 'Fortnightly') {
        durationSpan = 14;
        date.setDate(date.getDate() + durationSpan);
        nextInstalmentDate = date;
        console.log('fortnightly->nextInstalmentDate', nextInstalmentDate);
      } else {
        // nextInstalmentDate = await new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth() , InstalmentDay);
      }
      nextInstalmentDate = await utility.getFormatatedDate(
        nextInstalmentDate,
        'BR'
      );
    }
    if (expectedConfig.flags.blockedCheckout == 'false') {
      await this.upcomingInstalments(
        installmentType,
        nextInstalmentDate,
        durationSpan,
        InstalmentDay
      ); //creates pattern to save all upcoming payments in config
      // console.log('upcoming ', expectedConfig.UpcomingPayments);
      await this.paidInstalmensts(); //creates pattern to save paid payments in config
    }
  }

  async upcomingInstalments(
    installmentType: any,
    nextInstalmentDate: any,
    durationSpan: any,
    InstalmentDay: any
  ) {
    let instalments;
    const totalInstalments = expectedConfig.planSummary.totalNoOfInstallments;
    instalments = await Number(expectedConfig.planSummary.numberOfInstalment);
    //empty array
    while (UpcomingPayments.length > 0) {
      UpcomingPayments.pop();
    }
    let instalmentnumber;
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      instalmentnumber = await expectedConfig.paidPayments.length;

      instalments = await Number(expectedConfig.planSummary.numberOfInstalment);
    } else {
      const secondInstalmentData = '2' + '/' + totalInstalments;
      instalments = instalments - 1;
      const instalment2 = {
        //creates pattern for second payment
        amount: expectedConfig.planSummary.installmentAmount,
        date: await nextInstalmentDate.toString(),
        instalment: secondInstalmentData,
        status: 'On Schedule',
        paymentType: 'DUETIME',
        remainder: '0.00',
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await UpcomingPayments.push(instalment2);
      instalmentnumber = 2;
    }
    for (let i = 0; (await i) < instalments; i++) {
      if (
        expectedConfig.planSummary.operationType != 'updatePlan' ||
        (expectedConfig.planSummary.operationType == 'updatePlan' && i != 0)
      ) {
        //loop through total instalments-2, to create pattern
        let nextDate = await nextInstalmentDate.split('/');
        const month = nextDate[1];
        if (installmentType == 'Monthly') {
          if (
            InstalmentDay == 31 ||
            (month.toString() == '01' &&
              (InstalmentDay == 29 || InstalmentDay == 30))
          ) {
            nextDate = await this.getLastDateOfMonth(nextDate[2], nextDate[1]); //year,month
          } else {
            nextDate = nextDate[2] + '/' + nextDate[1] + '/' + nextDate[0];
            nextDate = await new Date(nextDate);
            nextDate = await new Date(
              nextDate.getFullYear(),
              nextDate.getMonth() + 1,
              InstalmentDay
            );
          }
        } else {
          //for weekly and fortnightly
          nextDate = nextDate[1] + '/' + nextDate[0] + '/' + nextDate[2];
          nextDate = await new Date(nextDate);
          await nextDate.setDate(nextDate.getDate() + durationSpan); //adding up 7 or 14 days
        }
        nextInstalmentDate = await utility.getFormatatedDate(nextDate, 'BR');
      }

      instalmentnumber = (await instalmentnumber) + 1;
      let instalmentData = await instalmentnumber.toString();
      instalmentData = instalmentData + '/' + totalInstalments;
      const data = {
        //setting pattern for instalment
        amount: expectedConfig.planSummary.installmentAmount,
        date: await nextInstalmentDate.toString(),
        instalment: instalmentData,
        status: 'On Schedule',
        paymentType: 'DUETIME',
        remainder: '0.00',
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await UpcomingPayments.push(data); //adding up every instalment into array to make pattern
    }

    expectedConfig.UpcomingPayments = UpcomingPayments;
    console.log('Calculated Final Payment date ' + nextInstalmentDate);
    expectedConfig.planSummary.lastPaymentDate =
      await nextInstalmentDate.toString();
  }

  async getLastDateOfMonth(year: any, month: any) {
    year = await Number(year);
    month = await Number(month);

    const d = await new Date(year, month + 1, 0);
    return d;
  }

  async paidInstalmensts() {
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      for (let i = 0; i < expectedConfig.paidPayments.length; i++) {
        let instalment = expectedConfig.paidPayments[i].instalment;
        instalment = await instalment.split('/');
        expectedConfig.paidPayments[i].instalment =
          instalment[0] +
          '/' +
          expectedConfig.planSummary.totalNoOfInstallments;
      }
    } else {
      //creates pattern for paid instalments
      const instalmentData =
        '1' + '/' + expectedConfig.planSummary.totalNoOfInstallments;
      expectedConfig.paidPayments = [];
      console.log('depositPaid =>', expectedConfig.depositSettings.depositPaid);

      const deposit = await Number(expectedConfig.depositSettings.depositPaid);
      let depositString = await deposit.toFixed(2);
      depositString = await String(depositString);
      await utility.delay(3000);

      const chargeType = {
        amountcapturedAvailable: expectedConfig.planSummary.totalFunds,
        amountRefunded: '0.00',
      };

      expectedConfig.planSummary.effectiveDate =
        expectedConfig.planSummary.planDate;

      const data = {
        amount: depositString,
        date: expectedConfig.planSummary.planDate,
        actualPaidDate: expectedConfig.planSummary.planDate,
        instalment: instalmentData,
        paymentMethodUsed: expectedConfig.planSummary.paymentMethod,
        status: 'Paid',
        paymentType: 'DUETIME',
        remainder: expectedConfig.planSummary.Remainder,
        type: {
          Charge: chargeType,
        },
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await expectedConfig.paidPayments.push(data);
    }
  }

  async calculateRemainingAndPaidAmount() {
    let deposit = 0;
    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      deposit = Number(calculations.actualDepositwithRemainder);
    } else {
      deposit = Number(expectedConfig.depositSettings.depositPaid);
    }
    const totalAmount = expectedConfig.planSummary.totalCost;
    const OtherPayments = 0;

    let remainingAmount = await ((await Number(totalAmount)) -
      (await Number(deposit)));
    remainingAmount =
      (await Math.round((remainingAmount + Number.EPSILON) * 100)) / 100;
    const remainingAmountString = await remainingAmount.toFixed(2);
    expectedConfig.planSummary.remainingAmount = await String(
      remainingAmountString
    );

    let paidSoFar = await ((await Number(deposit)) + OtherPayments);
    paidSoFar = await utility.upto2Decimal(paidSoFar);
    expectedConfig.planSummary.totalFunds = await String(paidSoFar);
    console.log('Calculated Remaining Amount is ' + remainingAmount);
    console.log('Calculated Paid so far is ' + deposit);
  }

  async calculateEvenInstalmentAmount() {
    const totalAmount = await Number(expectedConfig.planSummary.totalCost);
    const totalNoOfInstallments = await Number(
      expectedConfig.planSummary.totalNoOfInstallments
    );

    console.log('totalAmount ', totalAmount);
    console.log('totalNoOfInstallments ', totalNoOfInstallments);

    const noOfInstallments = await Number(
      expectedConfig.planSummary.numberOfInstalment
    );

    let evenInstalmentAmount = await (totalAmount / totalNoOfInstallments);
    console.log('evenInstalmentAmount ', evenInstalmentAmount);

    expectedConfig.planSummary.numberOfInstalment = String(noOfInstallments);
    expectedConfig.planSummary.totalNoOfInstallments = String(
      totalNoOfInstallments
    );
    evenInstalmentAmount = await utility.upto2Decimal(evenInstalmentAmount);
    expectedConfig.depositSettings.evenInstalmentAmount =
      await evenInstalmentAmount.toString();

    console.log(
      'Calculated Even Instalments Amount' + String(evenInstalmentAmount)
    );
    return evenInstalmentAmount;
  }

  async calculateDefaultDeposit() {
    let deposit = '';
    let depositRule = '';
    calculations.merchantCurrency;
    console.log(
      'minimumPaymentAmount',
      calculations.merchantCurrency.minimumPaymentAmount
    );
    //calculates default deposit based on condition that it should be greater than or equal to even instalments
    const evenInstalmentAmount = await parseFloat(
      expectedConfig.depositSettings.evenInstalmentAmount
    ).toFixed(2);
    let defaultMinDeposit = await Number(
      expectedConfig.depositSettings.requiredMinimumDeposit_roundup
    );

    defaultMinDeposit = await utility.upto2Decimal(defaultMinDeposit);

    let maxValue;
    maxValue = await Math.max(
      defaultMinDeposit,
      calculations.merchantCurrency.minimumPaymentAmount
    );

    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      console.log('defaultMinDeposit ', defaultMinDeposit);
      console.log(
        'calculations.merchantCurrency.minimumPaymentAmount ',
        calculations.merchantCurrency.minimumPaymentAmount
      );
      console.log('evenInstalmentAmount ', evenInstalmentAmount);

      maxValue = await Math.max(
        defaultMinDeposit,
        calculations.merchantCurrency.minimumPaymentAmount,
        Number(evenInstalmentAmount)
      );
    }
    if (
      maxValue == Number(evenInstalmentAmount) ||
      Number(evenInstalmentAmount) == Number(defaultMinDeposit)
    ) {
      deposit = await String(evenInstalmentAmount);
      depositRule = 'evenInstalmentAmount';
    } else if (maxValue == defaultMinDeposit) {
      depositRule = 'defaultMinDeposit';
      deposit = await String(defaultMinDeposit);
    } else {
      deposit = await utility.upto2Decimal(
        calculations.merchantCurrency.minimumPaymentAmount
      );
      depositRule = 'minimumPaymentAmount';
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // if (
    //   expectedConfig.LocalEnv.installmentType ==
    //     expectedConfig.planSummary.installmentPeriod ||
    //   expectedConfig.LocalEnv.applicationName != 'assisted-checkout'
    // ) {
    expectedConfig.depositSettings.depositPaid = deposit;
    expectedConfig.depositSettings.depositRuleApplied = depositRule;
    expectedConfig.depositSettings.depositExcludingRemainder =
      expectedConfig.depositSettings.depositPaid;
    // }

    console.log(
      'Calculated Deposit based on Rules & Settings will be ====> ' +
        expectedConfig.depositSettings.depositPaid
    );
    return [
      expectedConfig.depositSettings.depositPaid,
      expectedConfig.depositSettings.depositRuleApplied,
    ];
  }

  async calculateRemainder() {
    //remainder calculation
    const totalCost = await Number(expectedConfig.planSummary.totalCost);
    let deposit = await Number(
      expectedConfig.depositSettings.depositExcludingRemainder
    );
    console.log(
      'expectedConfig.LocalEnv.operationType',
      expectedConfig.LocalEnv.operationType
    );
    if (
      expectedConfig.planSummary.operationType == 'updatePlan' ||
      expectedConfig.LocalEnv.operationType == 'skip-instalment'
    ) {
      deposit = await Number(expectedConfig.planSummary.totalFunds);
    }
    const installmentAmount = await Number(
      expectedConfig.planSummary.installmentAmount
    );
    const noOfInstallments = await Number(
      expectedConfig.planSummary.numberOfInstalment
    );
    console.log('installmentAmount', installmentAmount);
    console.log('noOfInstallments', noOfInstallments);
    console.log('deposit', deposit);

    let Remainder = await (installmentAmount * noOfInstallments);
    Remainder = await (deposit + Remainder);
    Remainder = await parseFloat(await (totalCost - Remainder).toFixed(4));

    Remainder = await utility.upto2Decimal(Remainder);
    if (Number(Remainder) >= 0) {
      console.log('Calculated Remainder ==>' + Remainder);

      let updatedDeposit = 0;
      let field = '';
      if (
        expectedConfig.planSummary.operationType == 'updatePlan' ||
        expectedConfig.LocalEnv.operationType == 'skip-instalment'
      ) {
        field = ' last Upcoming ';
        updatedDeposit =
          (await Math.round(
            (Number(
              expectedConfig.UpcomingPayments[
                expectedConfig.UpcomingPayments.length - 1
              ].amount
            ) +
              Number(Remainder)) *
              1e12
          )) / 1e12;
        updatedDeposit = await utility.upto2Decimal(updatedDeposit);
        if (
          (await utility.canBeEquallyDivided(
            Number(Remainder),
            expectedConfig.UpcomingPayments.length
          )) == true
        ) {
          await this.distributeRemainder(
            Number(Remainder),
            expectedConfig.UpcomingPayments
          );
        } else {
          expectedConfig.UpcomingPayments[
            expectedConfig.UpcomingPayments.length - 1
          ].remainder = Remainder;
        }
        expectedConfig.UpcomingPayments[
          expectedConfig.UpcomingPayments.length - 1
        ].amount = updatedDeposit;
      } else {
        field = ' Deposit ';
        updatedDeposit =
          (await Math.round((Number(deposit) + Number(Remainder)) * 1e12)) /
          1e12;
        updatedDeposit = await utility.upto2Decimal(updatedDeposit);
        calculations.actualDepositwithRemainder = await String(updatedDeposit);
        expectedConfig.depositSettings.depositPaid = await String(
          updatedDeposit
        );
        expectedConfig.planSummary.totalFunds = await String(updatedDeposit);
      }
      console.log(
        'Calculated' +
          field +
          'Amount, Updated with Remainder  ==> ' +
          updatedDeposit
      );
    }
    expectedConfig.planSummary.Remainder = await String(Remainder);
    console.log('Calculated Remainder ===>' + Remainder);
  }

  async calculateInstalments(
    installmentType: any,
    nextInstalmentDate: any,
    InstallmentDay: any,
    screen: any
  ) {
    console.log('instalment type is ', installmentType);
    console.log('InstallmentDay is ', InstallmentDay);
    expectedConfig.planSummary.installmentPeriod = installmentType;
    let completionDate = expectedConfig.planSummary.completionDate;
    // let completionDate = (expectedConfig.planSummary.completionDate =
    //   '08/08/2023');
    //change date formats
    const completionDateArray = await utility.convertDateStringtoArray(
      completionDate
    );
    completionDate =
      completionDateArray[2] +
      '/' +
      completionDateArray[1] +
      '/' +
      completionDateArray[0];
    const CompletiondateHour = await new Date(completionDate);
    let hour = await CompletiondateHour.getUTCHours();
    hour = 24 - hour;
    console.log('Completion date hour ' + hour);
    const NextdateHour = await new Date();
    const Nextdate_Hour = await NextdateHour.getHours();
    console.log('Next date hour ' + Nextdate_Hour);

    let instalments = 0;
    // let last_date;
    //loop until instalment date is lessthan completion date
    while (new Date(nextInstalmentDate) <= new Date(completionDate)) {
      // last_date = nextInstalmentDate;
      console.log('next inst date is ' + (await nextInstalmentDate));
      instalments = instalments + 1;
      if (installmentType == 'Monthly') {
        nextInstalmentDate = await nextInstalmentDate.toLocaleString('en-GB');
      }
      nextInstalmentDate = await nextInstalmentDate.split(',');
      nextInstalmentDate = nextInstalmentDate[0];
      nextInstalmentDate = await new Date(nextInstalmentDate);
      if (installmentType == 'Monthly') {
        //monthly case
        const mon = await nextInstalmentDate.getMonth();
        if (
          InstallmentDay == 31 ||
          (mon.toString() == '0' &&
            (InstallmentDay == 29 || InstallmentDay == 30))
        ) {
          //special case for feb & last date of every month
          nextInstalmentDate = await this.getLastDateOfMonth(
            await nextInstalmentDate.getFullYear(),
            (await nextInstalmentDate.getMonth()) + 1
          ); //get last day of month
        } else {
          nextInstalmentDate = await new Date(
            nextInstalmentDate.getFullYear(),
            nextInstalmentDate.getMonth() + 1,
            InstallmentDay
          ); //added 1 month
        }
      } else {
        //for fortnightly and weekly
        await nextInstalmentDate.setDate(
          nextInstalmentDate.getDate() + InstallmentDay
        );
        //adding up duration span
      }
      nextInstalmentDate = await nextInstalmentDate.toLocaleString('en-US');
    }
    // last_date = await new Date(last_date);
    // const diff = await utility.differenceInDate(
    //   completionDate,
    //   last_date,
    //   true,
    //   false
    // );
    /* to uncomment 
    const completion_date_format= await new Date(completionDate).toLocaleString('en-US');
    const completion_date_split = await completion_date_format.split(',');
    const last_date_format = await new Date(last_date).toLocaleString('en-US');
    const last_date_split = last_date_format.split(',');
    if ((completion_date_split[0] == last_date_split[0]) && Nextdate_Hour > hour) {
      console.log('\x1b[33m last payment date is on completion date \x1b[37m')
      instalments = instalments - 1;
    } --to uncomment */
    if (
      screen == 'specialRule' &&
      expectedConfig.planSummary.operationType != 'updatePlan'
    ) {
      instalments = instalments + 1; //adding 1 for deposit
    }
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      expectedConfig.planSummary.totalNoOfInstallments = String(
        await (instalments + expectedConfig.paidPayments.length)
      );

      expectedConfig.planSummary.numberOfInstalment = String(instalments);
      console.log('Calculated number of instalments  ' + instalments);
    } else {
      expectedConfig.planSummary.totalNoOfInstallments = String(instalments); //saving total instalments into config
      console.log('Calculated total number of instalments  ' + instalments);
      instalments = await (instalments - 1);
      expectedConfig.planSummary.numberOfInstalment = String(instalments); //saving no of instalments into config
      console.log('Calculated number of instalments  ' + instalments);
    }

    let status = 'Available';
    if (instalments < 1) {
      status = 'Not available';
    }

    let option = '';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (expectedConfig.LocalEnv.installmentType == installmentType) {
      calculations.selectTypeInstallment =
        expectedConfig.planSummary.numberOfInstalment;
      calculations.selectTypenumberofInstallment =
        expectedConfig.planSummary.totalNoOfInstallments;
      option = 'selected';
    } else {
      option = 'deselected';
    }

    const obj = {
      [installmentType]: {
        totalNoOfInstallments: expectedConfig.planSummary.totalNoOfInstallments,
        numberOfInstalment: String(instalments),
        instalmentDate: InstallmentDay,
        option: option,
        status: status,
      },
    };
    await Object.assign(expectedConfig.planSummary, obj);

    if (
      screen == 'specialRule' &&
      expectedConfig.planSummary.checkoutType !== 'assisted-checkout'
    ) {
      const instalmentTypes = ['Weekly', 'Fortnightly', 'Monthly'];
      for (let i = 0; i < instalmentTypes.length; i++) {
        if (instalmentTypes[i] != installmentType) {
          expectedConfig.planSummary[instalmentTypes[i]].option = 'deselected';
        }
      }
    }
  }

  async inserting_first_Installment_amount(depositSetting: any) {
    if (expectedConfig.LocalEnv.screen == 'CheckoutSummary') {
      due_today_locator =
        "//p[@data-planpay-test-id='first_instalment_amount']";
    } else {
      due_today_locator = "[data-planpay-test-id='first_instalment_amount']";
    }
    const max = await Number(
      expectedConfig.depositSettings.MaxDepositAmount_rounddown
    );
    const min = await Number(
      expectedConfig.depositSettings.requiredMinimumDeposit_roundup
    );
    expectedConfig.depositSettings.depositRuleApplied = depositSetting;
    // generating a random number
    let depositAmount;
    let range;
    switch (depositSetting) {
      case 'random':
        range = (max - min) / 50 + 1;
        depositAmount = (await Math.floor(Math.random() * range)) * 50;
        depositAmount = await (depositAmount + min);
        break;
      case 'min':
        depositAmount = min;
        break;
      case 'max':
        depositAmount = max;
        break;
      default:
        console.log('Couldnt get any deposit');
        break;
    }
    let defaultNumber;
    console.log(depositSetting, ' Deposit');
    depositAmount = await utility.upto2Decimal(depositAmount);
    expectedConfig.depositSettings.depositPaid = String(depositAmount);
    expectedConfig.depositSettings.depositExcludingRemainder =
      expectedConfig.depositSettings.depositPaid;
    console.log('Calculated Deposit Amount is ' + String(depositAmount));
    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      await page.waitForSelector(
        "//input[@data-testid='first-installment-amount-input']"
      );
      defaultNumber = await page
        .locator("//input[@data-testid='first-installment-amount-input']")
        .innerText();
      await page.locator('#deposit').fill(depositAmount);
      await page
        .locator('//span[text()="Following instalments frequency"]')
        .click();
    } else {
      await page.waitForSelector(due_today_locator);
      defaultNumber = await page.locator(due_today_locator).innerText();
      let UIdeposit = await utility.removeComma(defaultNumber);
      while (Number(UIdeposit) !== Number(depositAmount)) {
        if (Number(UIdeposit) < Number(depositAmount)) {
          await page.locator(this.incrementButton).click();
        } else {
          await page.locator(this.decrementButton).click();
        }
        await utility.delay(500);
        defaultNumber = await page.locator(due_today_locator).innerText();
        UIdeposit = await utility.removeComma(defaultNumber);
      }
    }
  }

  async calculationsFunc(type?: any) {
    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      await this.calculateEvenInstalmentAmount();
    }
    // await this.calculateEvenInstalmentAmount();
    await this.calculateMaxDepositAmount(); //calculates maximum deposit
    expectedConfig.depositSettings.depositSetting == 'default' //deposit settings-> default OR UserEntered
      ? await this.calculateDefaultDeposit()
      : await this.inserting_first_Installment_amount(
          expectedConfig.depositSettings.depositSetting
        );
    await this.calculateInstalmentAmount(type); //calculate instalment amount
    type == 'deselected' ? console.log('') : await this.calculateRemainder(), //calculates Remainder
      await this.calculateRemainingAndPaidAmount(),
      await this.calculatePercentageInstallmentPaid(); //percentage amount paid
  }

  async calculationsFunc_assistedCheckout() {
    await this.calculateEvenInstalmentAmount();
    expectedConfig.depositSettings.depositSetting == 'default' //deposit settings-> default OR UserEntered
      ? await this.calculateDefaultDeposit()
      : await this.inserting_first_Installment_amount(
          expectedConfig.depositSettings.depositSetting
        );
    await this.calculateInstalmentAmount(
      'calculation',
      expectedConfig.depositSettings.depositPaid,
      expectedConfig.depositSettings.depositRuleApplied
    ); //calculate instalment amount
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig.planSummary.installmentPeriod =
      expectedConfig.LocalEnv.installmentType;
  }

  async determineRule(item: string, policies: string) {
    //dynamic function to determine Rule on given item(s) and given policy/policies
    let itemPolicy: any = [];
    let items: any = [];
    if (policies.includes(',')) {
      itemPolicy = policies.split(',');
    } else {
      itemPolicy.push(policies);
    }
    if (item.includes('$')) {
      items = await item.split('$');
    } else {
      items.push(item);
    }
    for (
      let policy = 0;
      policy < itemPolicy.length;
      policy++ //outer loop for policy i.e. DepositRefundable , refundpolicies
    ) {
      const Settings = await this.commonFunction(itemPolicy[policy], item);
      const flagSetting = Settings[0];
      const policySetting = Settings[1];
      for (let i = 0; i < items.length; i++) {
        //iterating every item
        const product: any = expectedConfig.planDetails.items.find(
          (item: { description: string }) => item.description == items[i]
        );
        //getting the product object from expected config
        const productSetting = {
          [itemPolicy[policy]]: policySetting[i],
          [itemPolicy[policy] + 'Setting']: flagSetting[i],
        }; //adding policy property to product object
        //assigning a property to object
        Object.assign(product, productSetting);
      }
    }
  }

  async calculateTotalNonRefundableDeposit(producItem: any) {
    let item: any = [];
    let totalNonRefundableDeposit = 0;
    if (producItem.includes('$')) {
      item = producItem.split('$');
    } else {
      item.push(producItem);
    }
    for (let i = 0; i < (await item.length); i++) {
      const merchantProduct = expectedConfig.planDetails.items.find(
        (product: { description: string }) => product.description == item[i]
      );
      totalNonRefundableDeposit =
        totalNonRefundableDeposit + merchantProduct.nonRefundableDeposit;
    }
    expectedConfig.cancellationDetails.totalNonRefundableDeposit = String(
      totalNonRefundableDeposit
    );
  }
  async readMerchantFile() {
    calculations.merchantConfiguration = await utility.commonJsonReadFunc(
      'jsonFile'
    ); //reading merchant config file
    // const merchantCurrency =
    //   calculations.merchantConfiguration.merchant.MerchantPaymentPlatform[0]
    //     .MerchantPaymentPlatformCurrency[0].currencyCode;
    // console.log('merchantCurrency33', merchantCurrency);
    // expectedConfig.planSummary.checkoutCurrency = merchantCurrency;
    const path =
      'configurations/currency/' +
      expectedConfig.planSummary.checkoutCurrency +
      '.json';
    const currenyFile = await utility.readJsonFile(path);
    calculations.merchantCurrency = currenyFile[0];
  }

  /*common function to get property from Merchant json*/
  async commonFunction(property: string, item?: string) {
    const result = [];
    const flag = [];
    let itemArray: any = [];
    let length = 1;
    if (item) {
      if (item.includes('$')) {
        itemArray = await item.split('$');
      } else {
        itemArray.push(item);
      }
      length = itemArray.length;
    }
    for (let i = 0; i < length; i++) {
      // console.log('inside loop!..');
      let merchantProducts;
      if (item) {
        //getting selected item from merchant configuration
        merchantProducts =
          calculations.merchantConfiguration.products.items.find(
            (product: { productName: string }) =>
              product.productName == itemArray[i]
          );
      } else {
        merchantProducts = undefined;
      }
      if (merchantProducts != undefined) {
        if (merchantProducts[property] != null) {
          // console.log('testing');
          flag.push('productLevel');
          result.push(merchantProducts[property]);
          // return merchantProducts[property];
        }
      }
      if (merchantProducts == undefined || merchantProducts[property] == null) {
        if (property == 'depositRefundable') {
          flag.push('productLevel');
          result.push('true');
        } else {
          // flag.push('merchantLevel');
          switch (property) {
            case 'paymentDeadline':
              flag.push('merchantLevel');
              await result.push(
                calculations.merchantConfiguration.merchant[
                  'defaultPaymentDeadlineInDays'
                ]
              );
              // console.log('here in payment deadline ');
              // return calculations.merchantConfiguration.merchant['defaultPaymentDeadlineInDays'];
              break;
            case 'minimumDepositPerItem':
              flag.push('merchantLevel');
              await result.push(await this.MerhantLevelDepositSettings());
              break;
            case 'refundPolicies':
              if (
                calculations.merchantConfiguration.merchant[
                  'MerchantDefaultRefundPolicy'
                ].length != 0
              ) {
                flag.push('merchantLevel');
                await result.push(
                  calculations.merchantConfiguration.merchant[
                    'MerchantDefaultRefundPolicy'
                  ]
                );
              } else {
                await flag.push('productLevel');
                const obj = {
                  daysWithinRedemptionDate: 0,
                  refundablePercentage: '100',
                };
                const newArr = [];
                await newArr.push(obj);
                await result.push(newArr);
              }
              break;
          }
        }
      }
    }
    return [flag, result];
  }
  async MerhantLevelDepositSettings() {
    const depositRule =
      calculations.merchantConfiguration.merchant.defaultMinimumDepositType;
    const value = Number(
      calculations.merchantConfiguration.merchant.defaultMinimumDepositValue
    );

    const obj = {
      unit: depositRule,
      value: value,
    };
    // console.log('object ', obj);
    return obj;
  }

  async calculateMerchantTransactionFee() {
    // let totalMerchantTransactionFee = 0;
    // MerchantTransactionFee = (MerchantMarkupFeePercentage * paymentGatewayFee) + paymentGatewayFee
    let ServiceFeesExcGSTonPaid = 0;
    const expectedJson = await utility.commonJsonReadFunc('expectedFile');
    expectedConfig.planSummary = expectedJson.planSummary;
    expectedConfig.merchantDetails = expectedJson.merchantDetails;
    calculations.merchantConfiguration = await utility.commonJsonReadFunc(
      'jsonFile'
    );
    // expectedJson.fees.ServiceFeesExcGSTonPaid = String(
    //   await this.calculateServiceFee('exclusive', 'totalFunds')
    // );
    let totalMerchantTransactionFee = 0;
    let x = expectedJson.paidPayments.length;
    while (x != 0) {
      const paidInstalment =
        expectedJson.paidPayments[expectedJson.paidPayments.length - x];
      // console.log('paidInstalment==', paidInstalment);
      let paidInstalmentNumber = paidInstalment.instalment;
      paidInstalmentNumber = paidInstalmentNumber.split('/');
      paidInstalmentNumber = Number(paidInstalmentNumber[0]);
      let paymentGatewayFee = 0;
      if (expectedJson.planSummary.paymentPlatform_vendor == 'Stripe') {
        paymentGatewayFee = await this.getPlatformFee(
          paidInstalmentNumber,
          expectedJson.planSummary.checkoutCurrency
        );
      }

      const transactionFeeIncludedSalesTax = await Number(
        calculations.merchantConfiguration.merchant.MerchantPaymentPlatform[0]
          .MerchantPaymentPlatformCurrency[0].transactionFeeIncludedSalesTax
      );

      let paymentGatewayFeeExcludedSalesTax =
        (paymentGatewayFee / (transactionFeeIncludedSalesTax + 100)) * 100;
      paymentGatewayFeeExcludedSalesTax =
        (await Math.round(paymentGatewayFeeExcludedSalesTax * 1e12)) / 1e12;

      let MerchantMarkupFeePercentage = await Number(
        calculations.merchantConfiguration.merchant.MerchantPaymentPlatform[0]
          .MerchantPaymentPlatformCurrency[0].markupFeePercentage
      );

      MerchantMarkupFeePercentage =
        Math.round((MerchantMarkupFeePercentage + Number.EPSILON) * 100) / 100;

      let MerchantTransactionFee =
        (await ((MerchantMarkupFeePercentage / 100) *
          paymentGatewayFeeExcludedSalesTax)) +
        paymentGatewayFeeExcludedSalesTax;

      const calculateInitalValue = await ((MerchantMarkupFeePercentage / 100) *
        paymentGatewayFeeExcludedSalesTax);

      let calcuLengthlateInitalValue = 0;
      if (
        calculateInitalValue > 0 &&
        Number.isInteger(calculateInitalValue) == false
      ) {
        calcuLengthlateInitalValue = calculateInitalValue
          .toString()
          .split('.')[1].length;
      } else {
        calcuLengthlateInitalValue = 0;
      }

      const calculateSecondValue = paymentGatewayFeeExcludedSalesTax;

      let calculateLengthSecondValue = 0;
      if (
        calculateSecondValue > 0 &&
        Number.isInteger(calculateInitalValue) == false
      ) {
        calculateLengthSecondValue = calculateSecondValue
          .toString()
          .split('.')[1].length;
      } else {
        calculateLengthSecondValue = 0;
      }

      const roundLength = Math.max(
        calcuLengthlateInitalValue,
        calculateLengthSecondValue
      );
      MerchantTransactionFee = Number(
        MerchantTransactionFee.toFixed(roundLength)
      );
      MerchantTransactionFee = Number(
        (Math.round(MerchantTransactionFee * 100) / 100).toFixed(2)
      );

      totalMerchantTransactionFee =
        (await Math.round(
          (MerchantTransactionFee + totalMerchantTransactionFee) * 1e12
        )) / 1e12;

      //ServiceFee = amount * MerchantServiceFeePercentage
      let serviceFee = await (Number(paidInstalment.amount) *
        (Number(
          calculations.merchantConfiguration.merchant.serviceFeePercentage
        ) /
          100));
      serviceFee =
        (await Math.round((serviceFee + Number.EPSILON) * 100)) / 100;
      //serviceFee = await utility.upto2Decimal(serviceFee);

      ServiceFeesExcGSTonPaid =
        (await ServiceFeesExcGSTonPaid) + Number(serviceFee);

      ServiceFeesExcGSTonPaid =
        (await Math.round((ServiceFeesExcGSTonPaid + Number.EPSILON) * 100)) /
        100;

      const payments = {
        paymentGatewayFee: paymentGatewayFee,
        MerchantTransactionFee: MerchantTransactionFee,
        paymentGatewayFeeExcludedSalesTax: paymentGatewayFeeExcludedSalesTax,
        serviceFee: serviceFee,
      };
      await Object.assign(
        expectedJson.paidPayments[expectedJson.paidPayments.length - x],
        payments
      );
      x = x - 1;
    }
    expectedJson.fees.ServiceFeesExcGSTonPaid = String(ServiceFeesExcGSTonPaid);
    expectedJson.fees.totalMerchantTransactionFee = await utility.upto2Decimal(
      totalMerchantTransactionFee
    );
    let expected_Json = expectedJson;
    //if plan is completed, check for last paid object to see if TotalFeesExcGST is equal to FeesExcGSTonPaid
    if (expectedJson.planSummary.planStatus == 'Completed') {
      expectedJson.fees.TotalServiceFeesExcGST ==
      expectedJson.fees.ServiceFeesExcGSTonPaid
        ? console.log(
            'TotalServiceFeesExcGST is equal to ServiceFeesExcGSTonPaid'
          )
        : (expected_Json = this.Specialcaseservicefee(expectedJson));
    }
    return expected_Json;
  }

  async getPlatformFee(i: number, currency: string) {
    const eventsTransactionsJson = await utility.commonJsonReadFunc(
      'transactions'
    );
    // console.log('eventsTransactionsJson', eventsTransactionsJson, 'i=')
    const eventsTransactions = await eventsTransactionsJson.find(
      (item: { type: string; payload: any }) =>
        item.type === 'CustomerPaymentSucceeded' &&
        item.payload.instalmentNo == i
    );

    // const count = await eventsTransactions.length;
    // for (let x = 0; x < count; x++) {
    // console.log(x);
    // console.log(eventsTransactions.payload);
    const events_Transactions = eventsTransactions.payload;
    const paymentIntentId = events_Transactions.paymentIntentId;
    console.log('paymentIntentId ', paymentIntentId);

    if (currency === 'USD') {
      this.stripe = new Stripe(process.env.STRIPE_MN_USD_SECRET_KEY || '', {
        apiVersion: '2022-11-15',
      });
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ['latest_charge.balance_transaction'],
      }
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let fee = paymentIntent.latest_charge.balance_transaction.fee;
    fee = await String(fee);
    fee =
      fee.substring(0, fee.length - 2) + '.' + fee.substring(fee.length - 2); //manually adding decimal before last 2digits
    const platform_fee = Number(fee);
    // platformFee.push(platform_fee);
    // }
    console.log('platform fee ', platform_fee);
    return platform_fee;
  }

  async calculateMerchantPaymentPayable(expectedJson: any) {
    let merchantRevenue;
    /* paidsoFar - planpayFeeSoFar */
    console.log('total funds ', expectedJson.planSummary.totalFunds);
    console.log('planPayFeesSoFar ', expectedConfig.fees.planPayFeesSoFar);
    if (
      expectedConfig.planSummary.planStatus == 'Cancelled' &&
      expectedConfig.cancellationDetails.refundType == 'Full'
    ) {
      merchantRevenue =
        (await Number(expectedJson.planSummary.totalFunds)) -
        Number(expectedConfig.cancellationDetails.ActualRefundAmountUI) -
        Number(expectedConfig.fees.planPayFeesSoFar);
    } else {
      merchantRevenue =
        (await Number(expectedJson.planSummary.totalFunds)) -
        Number(expectedConfig.fees.planPayFeesSoFar);
      if (expectedConfig.planSummary.planStatus == 'Cancelled') {
        merchantRevenue =
          merchantRevenue -
          Number(expectedConfig.cancellationDetails.ActualRefundAmountUI);
      }
    }
    if (merchantRevenue < 0) {
      // if revenue is -ve , make it 0
      merchantRevenue = 0;
    }
    merchantRevenue =
      Math.round((merchantRevenue + Number.EPSILON) * 100) / 100;
    merchantRevenue = await utility.upto2Decimal(merchantRevenue);
    console.log(
      'calculated MerchantPaymentPayable or Revenue ',
      merchantRevenue
    );
    expectedConfig.fees.merchantRevenue = String(merchantRevenue);
    expectedJson.fees.merchantRevenue = String(merchantRevenue);

    return expectedJson;
  }

  async Specialcaseservicefee(expectedJson: any) {
    const paidPayments = expectedJson.paidPayments;
    let totalFee = 0;
    for (let i = 0; i < paidPayments.length; i++) {
      totalFee = (await Number(paidPayments[i].serviceFee)) + totalFee;
    }
    const difference =
      Number(expectedJson.fees.TotalServiceFeesExcGST) - totalFee;
    let serviceFee = Number(paidPayments[paidPayments.length - 1].serviceFee);
    serviceFee = await (serviceFee + difference);
    serviceFee = (await Math.round((serviceFee + Number.EPSILON) * 100)) / 100;
    serviceFee = await utility.upto2Decimal(serviceFee);
    expectedJson.paidPayments[paidPayments.length - 1].serviceFee =
      String(serviceFee);
    //recalculates ServiceFeesExcGSTonPaid
    let ServiceFeesExcGSTonPaid = 0;
    for (let i = 0; i < paidPayments.length; i++) {
      ServiceFeesExcGSTonPaid =
        (await Number(paidPayments[i].serviceFee)) + ServiceFeesExcGSTonPaid;
    }
    expectedJson.fees.ServiceFeesExcGSTonPaid = String(ServiceFeesExcGSTonPaid);
    return expectedJson;
  }
  // async calculateServiceFeeincGST(expectedJson: any) {
  //   // GSTPercentage * ServiceFee  + ServiceFee
  //   const serviceFee = Number(expectedJson.fees.serviceFee);
  //   return (await (config.LocalEnv.GSTPercentage * serviceFee)) + serviceFee;
  // }

  // async calculateServiceFee() {
  //   // const expectedJson = await utility.readExpectedValue()
  //   // ServiceFee = TotalPriceItems * MerchantServiceFeePercentage

  //   const serviceFee =
  //     (await Number(expectedConfig.planSummary.totalCost)) *
  //     (await (calculations.merchantConfiguration.merchant.serviceFeePercentage /
  //       100));
  //   expectedConfig.planSummary.serviceFee = String(serviceFee);
  // }
  async calculateServiceFee(tax: string, field: string | number) {
    if (field == 'planTotal') {
      field = Number(expectedConfig.planSummary.totalCost);
    } else {
      field = Number(expectedConfig.planSummary.totalFunds);
    }

    let serviceFee =
      field *
      (await (Number(
        calculations.merchantConfiguration.merchant.serviceFeePercentage
      ) / 100));

    if (tax == 'inclusive') {
      serviceFee =
        (await ((config.LocalEnv.GSTPercentage / 100) * serviceFee)) +
        serviceFee;
    }
    serviceFee = Math.round((serviceFee + Number.EPSILON) * 100) / 100;

    // serviceFee = await utility.upto2Decimal(serviceFee);
    return serviceFee;
  }

  async calculatePlanPayFeesSoFar(json_data: any) {
    /*totalPlanPayFees = ServiceFeesIncGSTonPaid + totalMerchantTransactionFee */
    let planPayFeesSoFar;

    if (
      expectedConfig.planSummary.planStatus == 'Cancelled' &&
      expectedConfig.cancellationDetails.refundType == 'Full'
    ) {
      if (json_data.planSummary.paymentPlatform_variant == 'Managed') {
        planPayFeesSoFar = Number(json_data.fees.totalMerchantTransactionFee);
      } else {
        planPayFeesSoFar = 0;
      }
    } else {
      //if planStatus is on schedule/completed
      if (json_data.planSummary.paymentPlatform_variant == 'Managed') {
        const ServiceFeesExcGSTonPaid =
          (await Math.round(
            (Number(json_data.fees.ServiceFeesExcGSTonPaid) + Number.EPSILON) *
              100
          )) / 100;
        planPayFeesSoFar =
          (await ServiceFeesExcGSTonPaid) +
          Number(json_data.fees.totalMerchantTransactionFee);
        planPayFeesSoFar =
          (await Math.round((planPayFeesSoFar + Number.EPSILON) * 100)) / 100;
      } else {
        //enterprise case
        planPayFeesSoFar = Number(json_data.fees.ServiceFeesExcGSTonPaid);
      }
    }
    if (planPayFeesSoFar < 0) {
      planPayFeesSoFar = 0;
    }

    planPayFeesSoFar = await utility.upto2Decimal(planPayFeesSoFar);
    console.log('calculated planpay fee ', planPayFeesSoFar);
    json_data.fees.planPayFeesSoFar = String(planPayFeesSoFar);
    expectedConfig.fees.planPayFeesSoFar = String(planPayFeesSoFar);
    return json_data;
  }

  async priceWidgetCalculation() {
    console.log('**widget calculation******');
    const todayDate = await new Date();
    const today = await todayDate.toLocaleString('en-US'); //change date format to mm/dd/yy
    await this.calculateInstalments('Weekly', today, 7, 'price_preview_widget');
    if (expectedConfig.planSummary['Weekly'].status == 'Not available') {
      expectedConfig.flags.blockedCheckout = 'true';
    }
    if (expectedConfig.flags.blockedCheckout != 'true') {
      await this.calculateEvenInstalmentAmount();
      await this.calculateMaxDepositAmount(); //calculates maximum deposit
      await this.calculateDefaultDeposit();
      expectedConfig.planSummary.priceWidget =
        await this.calculateInstalmentAmount('price_preview_widget'); //calculate instalment amount
      console.log(
        'preview price widget ',
        expectedConfig.planSummary.priceWidget
      );
    }
  }

  async pricePreviewWidgetMarkup() {

    console.log('price widget validation');

      await page.waitForLoadState();
      await page.waitForSelector('strong');
      const selected = await page.locator('strong').nth(1).innerText();
      console.log('Selected: ', selected)
      const weekly = await page.locator('strong').nth(2).innerText();
      console.log('Weekly: ', weekly)
      const fornightly = await page.locator('strong').nth(3).innerText();
      console.log('Fornightly: ', fornightly)
      const monthly = await page.locator('strong').nth(4).innerText();
      console.log('Monthly: ', monthly)

    //   const todayDate = await new Date();
    // const today = await todayDate.toLocaleString('en-US'); //change date format to mm/dd/yy
    // await this.calculateInstalments('Weekly', today, 7, 'price_preview_widget');

      // const weekly = await page.locator("//tr[@id='price_preview_fetch_Weekly']//td[1]").innerText();
      // console.log('weekly: ', weekly)
      // const fornightly = await page.locator("//tr[@id='price_preview_fetch_Fortnightly']/td[1]").innerText();
      // console.log('fornightly: ', fornightly)
      // const monthly = await page.locator("//tr[@id='price_preview_fetch_Monthly']//td[1]").innerText();
      // console.log('monthly: ', monthly)
    // console.log('**widget calculation******');
    // const todayDate = await new Date();
    // const today = await todayDate.toLocaleString('en-US'); //change date format to mm/dd/yy
    // await this.calculateInstalments('Weekly', today, 7, 'price_preview_widget');
    // if (expectedConfig.planSummary['Weekly'].status == 'Not available') {
    //   expectedConfig.flags.blockedCheckout = 'true';
    // }
    // if (expectedConfig.flags.blockedCheckout != 'true') {
    //   await this.calculateEvenInstalmentAmount();
    //   await this.calculateMaxDepositAmount(); //calculates maximum deposit
    //   await this.calculateDefaultDeposit();
    //   expectedConfig.planSummary.priceWidget =
    //     await this.calculateInstalmentAmount('price_preview_widget'); //calculate instalment amount
    //   console.log(
    //     'preview price widget ',
    //     expectedConfig.planSummary.priceWidget
    //   );
    // }
  }

  async skipInstalments(noOfSkippedInstalments: number) {
    const noOfInstallmentsToBePaid = Number(
      expectedConfig.planSummary.noOfInstallmentsToBePaid
    );
    const noOfInstalment = await (noOfInstallmentsToBePaid -
      noOfSkippedInstalments);
    let skippedAmount = 0;
    let count = noOfSkippedInstalments;
    while (count > 0) {
      skippedAmount =
        (await skippedAmount) +
        Number(expectedConfig.UpcomingPayments[0].amount);
      expectedConfig.planSummary.paymentsFrom =
        expectedConfig.UpcomingPayments[0].date;
      await expectedConfig.skippedInstallment.push(
        expectedConfig.UpcomingPayments[0]
      );
      // await expectedConfig.paidPayments.push(expectedConfig.UpcomingPayments[0]);
      await expectedConfig.UpcomingPayments.shift();

      count--;
    }
    console.log('Skipped amount is', skippedAmount);

    expectedConfig.planSummary.installmentAmount = String(
      await this.instalmentAmountCalculation(
        Number(expectedConfig.planSummary.remainingAmount),
        0,
        noOfInstalment
      )
    );
    //update expectedconf
    expectedConfig.planSummary.noOfInstallmentsToBePaid =
      String(noOfInstalment);
    expectedConfig.planSummary.totalNoOfInstallments = String(
      Number(expectedConfig.planSummary.noOfInstallmentsToBePaid) +
        Number(expectedConfig.planSummary.noOfInstallmentsPaid)
    );
    expectedConfig.planSummary.numberOfInstalment = await String(
      Number(expectedConfig.planSummary.totalNoOfInstallments) - 1
    );
    await this.updateUpcoming(noOfSkippedInstalments);
    await this.calculateRemainder();
    expectedConfig.planSummary.skippedAmount = skippedAmount;
    expectedConfig.planSummary.skippedInstalments = String(
      noOfSkippedInstalments
    );

    // console.log('expected json ', expectedConfig);
  }

  async updateUpcoming(noOfSkippedInstalments: number) {
    for (let i = 0; i < expectedConfig.UpcomingPayments.length; i++) {
      expectedConfig.UpcomingPayments[i].amount =
        expectedConfig.planSummary.installmentAmount;
      let upcoming_inst = expectedConfig.UpcomingPayments[i].instalment;
      upcoming_inst = await upcoming_inst.split('/');
      upcoming_inst =
        (await (Number(upcoming_inst[0]) - noOfSkippedInstalments)) +
        '/' +
        expectedConfig.planSummary.totalNoOfInstallments;
      expectedConfig.UpcomingPayments[i].instalment = upcoming_inst;
    }
  }

  async updatePlanCalculationsFunc() {
    await this.calculateInstalmentAmount();
  }

  async newCheckoutDeposit() {
    if (expectedConfig.planSummary.checkoutType == 'assisted-checkout') {
      await this.calculateEvenInstalmentAmount();
    }
    await this.calculateMaxDepositAmount(); //calculates maximum deposit
    expectedConfig.depositSettings.depositSetting == 'default' //deposit settings-> default OR UserEntered
      ? await this.calculateDefaultDeposit()
      : await this.inserting_first_Installment_amount(
          expectedConfig.depositSettings.depositSetting
        );
  }

  async newCheckoutCalc(type?: any) {
    await this.calculateInstalmentAmount(type); //calculate instalment amount
    type == 'deselected' ? console.log('') : await this.calculateRemainder(), //calculates Remainder
      await this.calculateRemainingAndPaidAmount(),
      await this.calculatePercentageInstallmentPaid(); //percentage amount paid
  }

  async distributeRemainder(Remainder: number, UpcomingPayments: any) {
    const value = (await Remainder) / UpcomingPayments.length;
    for (let i = 0; i < (await UpcomingPayments.length); i++) {
      if (expectedConfig.planSummary.operationType == 'nTransactions') {
        expectedConfig.UpcomingPayments[i].remainder = '0.00';
      } else {
        expectedConfig.UpcomingPayments[i].remainder = String(value);
      }
      const amount =
        (await Number(expectedConfig.UpcomingPayments[i].amount)) + value;
      expectedConfig.UpcomingPayments[i].amount = String(
        await utility.upto2Decimal(amount)
      );
    }
  }
  async handleRemainder() {
    console.log('handle remainder function ***********');
    const upcomingLength = expectedConfig.UpcomingPayments.length;
    for (let i = 0; i < upcomingLength; i++) {
      if (Number(expectedConfig.UpcomingPayments[i].remainder) > 0) {
        console.log(
          'expectedConfig.UpcomingPayments[i] ',
          expectedConfig.UpcomingPayments[i]
        );
        if (
          (await utility.canBeEquallyDivided(
            Number(expectedConfig.UpcomingPayments[i].remainder),
            expectedConfig.UpcomingPayments.length
          )) == true
        ) {
          expectedConfig.UpcomingPayments[i].amount = await String(
            Number(expectedConfig.UpcomingPayments[i].amount) -
              Number(expectedConfig.UpcomingPayments[i].remainder)
          );
          console.log('distribute remainder ');
          await this.distributeRemainder(
            Number(expectedConfig.UpcomingPayments[i].remainder),
            expectedConfig.UpcomingPayments
          );
        }
      }
    }
    return expectedConfig.UpcomingPayments;
  }
}
