import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { PlanCancellationCalculation } from '../merchant-checkout/plan-cancellation-calculation';
// import { verify } from 'crypto';

const utility = new Utilities();
const plan_cancellation_calculation = new PlanCancellationCalculation();
export class PlanCancellation {
  cancel_plan = '#cancel_plan';
  plan_total = '#plan_total';
  total_received = '#total_received';
  refund_amount = '#refund_amount';
  custom_amount_input = '#custom_amount_input';
  confirm_button = '#confirm_button';
  //CancellationSummary Locators
  customer = '#customer';
  cancellation_date = '#cancellation_date';
  reason = '#reason';
  // planpay_fees = '#planpay_fees';
  customer_receive = '#customer_receive';
  merchant_keep = '#merchant_keep';
  password_input = '#password_input';
  submit_button = '#submit_button';
  non_refundable_label = "//span[text()='Refund amount']";
  non_refundable_value = '#custom_amount_input';
  order_status = '#order-status';
  //how is calculated locators.
  how_calculated_icon = '#how_calculated_icon';
  active_refund_title = '#active-refund_title';
  active_refund_amount = '#active-refund_amount';
  close = '#close';
  product_title = '#product-title-';
  product_price = '#product-price-';
  full_name = '#full_name';
  cancellation_date_label = '#cancellation_date_label';
  cancellation_date_value = '#cancellation_date_value';
  reason_label = '#reason_label';
  reason_value = '#reason_value';

  async locatorsPlanSummary(i: number) {
    if (i == 0) {
      return [this.plan_total, this.plan_total];
    } else if (i == 1) {
      return [this.total_received, this.total_received];
    } else if (i == 2) {
      return [
        '#suggested_non_refundable_label',
        "//span[@id='suggested_non_refundable_value']/div[1]/div[1]",
        // "//div[@class='MuiBox-root css-79elbk']//div[1]",
      ];
    }
  }

  async locatorsCacellationSummary(i: number) {
    if (i == 0) {
      return [this.customer, this.full_name];
    } else if (i == 1) {
      return [this.cancellation_date_label, this.cancellation_date_value];
    } else if (i == 2) {
      return [this.plan_total, this.plan_total];
    } else if (i == 3) {
      return [this.total_received, this.total_received];
    } else if (i == 4) {
      return [this.reason_label, this.reason_value];
    }
    // else if (i == 5) {
    //   return [this.planpay_fees, this.planpay_fees];
    // }
    else if (i == 5) {
      return [this.customer_receive, this.customer_receive];
    } else if (i == 6) {
      return [this.merchant_keep, this.merchant_keep];
    } else if (i == 7) {
      return [
        '#suggested_non_refundable_label',
        // "//div[@class='MuiBox-root css-79elbk']//div[1]",
        "//span[@id='suggested_non_refundable_value']/div[1]/div[1]",
      ];
    } else if (i == 8) {
      return ['#non_refundable_label', '#non_refundable_value'];
    }
  }

  async howIsCalculated(screens: any) {
    let dates: any[] = [];
    const amount: any[] = [];
    let milestoneDates: any[] = [];
    let refundableAmounts: any[] = [];
    let actualTotalNonRefundableAmount: any = '';
    const itemPriceExpected: any[] = [];
    const itemNonRefundableExpected: any[] = [];

    console.log('%%%%How Is Calculated Screen%%%%');
    await page.locator(this.how_calculated_icon).click();

    // dates[0] = await utility.getFormTitle(
    //   await page.locator(this.active_refund_title).innerText()
    // );
    actualTotalNonRefundableAmount = await utility.getFormValue(
      await page.locator(this.active_refund_amount).first().innerText()
    );
    // console.log(expectedConfig.planDetails.items.length, ' items found!...');
    const totalProducts = expectedConfig.planDetails.items.length;
    let singleProduct = 1;
    //get actual values
    for (let i = 0; i < totalProducts; i++) {
      dates = [];

      dates[0] = await page
        .locator(
          "(//span[@id='product-title-" + singleProduct + "'" + '])[2]'
          //this.product_title + singleProduct
        )
        .innerText();
      amount[0] = await utility.getFormValue(
        await page
          .locator(
            "(//span[@id='product-price-" + singleProduct + "'" + ']//div)[2]'
            // this.product_price + singleProduct
          )
          .innerText()
      );
      dates[1] = await page
        .locator(
          "(//span[@id='product_" + singleProduct + "_milestone_date_1'])[2]"
          //'#product_' + singleProduct + '_milestone_date_1'
        )
        .innerText();
      amount[1] = await utility.getFormValue(
        await page
          .locator(
            "(//span[@id='product_" +
              singleProduct +
              "_milestone_value_1']//div)[2]"
            //'#product_' + singleProduct + '_milestone_value_1'
          )
          .innerText()
      );
      // console.log('#product_' + singleProduct + '_milestone_date_2');
      if (
        (await page
          .locator(
            "(//span[@id='product_" + singleProduct + "_milestone_date_2'])[2]"
            //'#product_' + singleProduct + '_milestone_date_2'
          )
          .isVisible()) == true
      ) {
        dates[2] = await utility.formatDate(
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_date_2'])[2]"
              //'#product_' + singleProduct + '_milestone_date_2'
            )
            .innerText()
        );
        amount[2] = (
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_value_2']//div)[2]"
              //'#product_' + singleProduct + '_milestone_value_2'
            )
            .innerText()
        ).replace(/[^0-9.]/g, '');
        dates[3] = await utility.formatDate(
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_date_3'])[2]"
              //'#product_' + singleProduct + '_milestone_date_3'
            )
            .innerText()
        );
        amount[3] = (
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_value_3']//div)[2]"
              //'#product_' + singleProduct + '_milestone_value_3'
            )
            .innerText()
        ).replace(/[^0-9.]/g, '');
        dates[4] = await utility.formatDate(
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_date_4'])[2]"
              // '#product_' + singleProduct + '_milestone_date_4'
            )
            .innerText()
        );
        amount[4] = (
          await page
            .locator(
              "(//span[@id='product_" +
                singleProduct +
                "_milestone_value_4']//div)[2]"
              //'#product_' + singleProduct + '_milestone_value_4'
            )
            .innerText()
        ).replace(/[^0-9.]/g, '');
      }

      // console.log('dates[0]:', dates[0]);
      // console.log('title array:', dates);
      const expectedItemCount: number | undefined =
        await plan_cancellation_calculation.getExpectedItemIndex(dates[0]);
      if (expectedItemCount == undefined) {
        console.log('getting no count from expectedCount function!..');
      }
      // console.log('expectedItemCount', expectedItemCount);
      // console.log('expectedConfig.planDetails: ', expectedConfig.planDetails);
      itemPriceExpected[expectedItemCount] = (
        expectedConfig.planDetails.productsAmount[expectedItemCount] *
        expectedConfig.planDetails.productsQuantity[expectedItemCount]
      ).toFixed(2);
      itemNonRefundableExpected[expectedItemCount] =
        expectedConfig.planDetails.items[
          expectedItemCount
        ].nonRefundableDeposit;
      // .effectiveFinalNonRefundableAmountItem;

      const expectedItems =
        expectedConfig.planDetails.items[expectedItemCount].howThisIsCalculated;
      refundableAmounts = expectedItems.map((item) => {
        const key = Object.keys(item).find((key) =>
          key.startsWith('nonRefundableAmount')
        );
        return item[key];
      });
      milestoneDates = expectedItems.map((item) => {
        const key = Object.keys(item).find((key) =>
          key.startsWith('milestoneDate')
        );
        return item[key];
      });

      // console.log('milestoneDates: ', milestoneDates);
      for (let j = 0; j < milestoneDates.length; j++) {
        milestoneDates[j] = await utility.formatDate(milestoneDates[j]);
      }

      if (config.LocalEnv.verifyFlag == 'false') {
        await utility.printValues(dates, amount, 'How Is Calculated');
        await utility.printExpectedValues(
          milestoneDates,
          refundableAmounts,
          'How Is Calculated'
        );
      }

      console.log('milestoneDates: ', milestoneDates);
      console.log('dates: ', dates);
      // Match the refunable dates
      const actualDates = [dates[2], dates[3], dates[4]];
      const expectedDates = [
        milestoneDates[0],
        milestoneDates[1],
        milestoneDates[2],
      ];
      const titleDates = ['Policy1', 'Policy2', 'Policy3'];

      if (dates.length == 2) {
        console.log(
          '\u001b[1;33mNo policy against merchant level and item level so we will not match the dates.\u001b[1;37m'
        );
      } else {
        if (
          config.LocalEnv.verifyFlag == 'true' &&
          (await screens.includes('how_this_is_calculated_popup'))
        ) {
          await utility.matchValues(
            actualDates,
            expectedDates,
            titleDates,
            'Policy Dates',
            'Merchant Portal'
          );
        }
      }

      // console.log('itemNonRefundableExpected: ', itemNonRefundableExpected);
      const actual: any = amount; //actual values
      const expected: any = [
        itemPriceExpected[expectedItemCount],
        itemNonRefundableExpected[expectedItemCount],
        ...refundableAmounts,
      ];

      const title: any = dates;

      // console.log('expected: ', expected);
      if (
        config.LocalEnv.verifyFlag == 'true' &&
        (await screens.includes('how_this_is_calculated_popup'))
      ) {
        console.log(
          '\u001b[1;33mHow is Calculated calling for match value function.\u001b[1;37m.'
        );
        await utility.matchValues(
          actual,
          expected,
          title,
          'How is Calculated',
          'merchant-portal'
        );
      }
      singleProduct++;
    }
    //caculating the total non refundable amount.
    expectedConfig.cancellationDetails.totalNonRefundableDeposit = String(
      await plan_cancellation_calculation.totalNonRefundableAmount()
    );
    expectedConfig.cancellationDetails.totalRefundableAmount = String(
      await plan_cancellation_calculation.totalRefundableAmount()
    );

    //matching final non-refundable deposit

    if (
      config.LocalEnv.verifyFlag == 'true' &&
      (await screens.includes('how_this_is_calculated_popup'))
    ) {
      console.log(
        '\u001b[1;33mTotal NonRefundable Amount verifying on How is Calculated screen.\u001b[1;37m.'
      );
      await utility.matchValues(
        actualTotalNonRefundableAmount,
        expectedConfig.cancellationDetails.totalNonRefundableDeposit,
        'total Non Refundable Amount',
        'How is Calculated',
        'merchant-portal'
      );
    }
    await page.locator(this.close).click();
  }

  async RefundMileStoneforMerchantPortal() {
    let dates: any[] = [];
    const amount: any[] = [];
    let milestoneDates: any[] = [];
    let refundableAmounts: any[] = [];
    let actualTotalNonRefundableAmount: any = '';
    const itemPriceExpected: any[] = [];
    const itemNonRefundableExpected: any[] = [];

    console.log('%%%%How Is Calculated Screen%%%%');

    //    // await page.locator(this.how_calculated_icon).click();

    // dates[0] = await utility.getFormTitle(
    //   await page.locator(this.active_refund_title).innerText()
    // );
    actualTotalNonRefundableAmount = await utility.getFormValue(
      await page.locator(this.active_refund_amount).innerText()
    );
    // console.log(expectedConfig.planDetails.items.length, ' items found!...');
    const totalProducts = expectedConfig.planDetails.items.length;
    let singleProduct = 1;
    //get actual values
    for (let i = 0; i < totalProducts; i++) {
      dates = [];
      dates[0] = await page
        .locator(this.product_title + singleProduct)
        .innerText();
      amount[0] = await utility.getFormValue(
        await page
          .locator(this.product_price + singleProduct)
          .last()
          .innerText()
      );
      dates[1] = await page
        .locator('#product_' + singleProduct + '_milestone_date_1')
        .innerText();
      amount[1] = await utility.getFormValue(
        await page
          .locator('#product_' + singleProduct + '_milestone_value_1')
          .innerText()
      );
      // console.log('#product_' + singleProduct + '_milestone_date_2');
      if (
        (await page
          .locator('#product_' + singleProduct + '_milestone_date_2')
          .isVisible()) == true
      ) {
        dates[2] = await utility.formatDate(
          await page
            .locator('#product_' + singleProduct + '_milestone_date_2')
            .innerText()
        );
        amount[2] = (
          await page
            .locator('#product_' + singleProduct + '_milestone_value_2')
            .innerText()
        ).replace(/[^0-9.]/g, '');
        dates[3] = await utility.formatDate(
          await page
            .locator('#product_' + singleProduct + '_milestone_date_3')
            .innerText()
        );
        amount[3] = (
          await page
            .locator('#product_' + singleProduct + '_milestone_value_3')
            .innerText()
        ).replace(/[^0-9.]/g, '');
        dates[4] = await utility.formatDate(
          await page
            .locator('#product_' + singleProduct + '_milestone_date_4')
            .innerText()
        );
        amount[4] = (
          await page
            .locator('#product_' + singleProduct + '_milestone_value_4')
            .innerText()
        ).replace(/[^0-9.]/g, '');
      }

      // console.log('dates[0]:', dates[0]);
      // console.log('title array:', dates);
      const expectedItemCount: number | undefined =
        await plan_cancellation_calculation.getExpectedItemIndex(dates[0]);
      if (expectedItemCount == undefined) {
        console.log('getting no count from expectedCount function!..');
      }
      // console.log('expectedItemCount', expectedItemCount);
      // console.log('expectedConfig.planDetails: ', expectedConfig.planDetails);
      itemPriceExpected[expectedItemCount] = (
        expectedConfig.planDetails.productsAmount[expectedItemCount] *
        expectedConfig.planDetails.productsQuantity[expectedItemCount]
      ).toFixed(2);
      itemNonRefundableExpected[expectedItemCount] =
        expectedConfig.planDetails.items[
          expectedItemCount
        ].nonRefundableDeposit;
      // .effectiveFinalNonRefundableAmountItem;

      const expectedItems =
        expectedConfig.planDetails.items[expectedItemCount].howThisIsCalculated;
      refundableAmounts = expectedItems.map((item) => {
        const key = Object.keys(item).find((key) =>
          key.startsWith('nonRefundableAmount')
        );
        return item[key];
      });
      milestoneDates = expectedItems.map((item) => {
        const key = Object.keys(item).find((key) =>
          key.startsWith('milestoneDate')
        );
        return item[key];
      });

      // console.log('milestoneDates: ', milestoneDates);
      for (let j = 0; j < milestoneDates.length; j++) {
        milestoneDates[j] = await utility.formatDate(milestoneDates[j]);
      }

      if (config.LocalEnv.verifyFlag == 'false') {
        await utility.printValues(dates, amount, 'How Is Calculated');
        await utility.printExpectedValues(
          milestoneDates,
          refundableAmounts,
          'How Is Calculated'
        );
      }

      //Match the refunable dates
      const actualDates = [dates[2], dates[3], dates[4]];
      const expectedDates = [
        milestoneDates[0],
        milestoneDates[1],
        milestoneDates[2],
      ];
      const titleDates = ['Policy1', 'Policy2', 'Policy3'];

      if (dates.length == 2) {
        console.log(
          '\u001b[1;33mNo policy against merchant level and item level so we will not match the dates.\u001b[1;37m'
        );
      } else {
        if (config.LocalEnv.verifyFlag == 'true') {
          await utility.matchValues(
            actualDates,
            expectedDates,
            titleDates,
            'Policy Dates',
            'Merchant Portal'
          );
        }
      }

      // console.log('itemNonRefundableExpected: ', itemNonRefundableExpected);
      const actual: any = amount; //actual values
      const expected: any = [
        itemPriceExpected[expectedItemCount],
        itemNonRefundableExpected[expectedItemCount],
        ...refundableAmounts,
      ];
      const title: any = dates;

      // console.log('expected: ', expected);
      if (config.LocalEnv.verifyFlag == 'true') {
        console.log(
          '\u001b[1;33mRefundable policies match function.\u001b[1;37m.'
        );
        await utility.matchValues(
          actual,
          expected,
          title,
          'How is Calculated',
          'merchant-portal'
        );
      }
      singleProduct++;
    }
    //caculating the total non refundable amount.
    expectedConfig.cancellationDetails.totalNonRefundableDeposit = String(
      await plan_cancellation_calculation.totalNonRefundableAmount()
    );
    expectedConfig.cancellationDetails.totalRefundableAmount = String(
      await plan_cancellation_calculation.totalRefundableAmount()
    );

    //matching final non-refundable deposit

    if (config.LocalEnv.verifyFlag == 'true') {
      console.log(
        '\u001b[1;33mTotal NonRefundable Amount verifying on How is Calculated screen.\u001b[1;37m.'
      );
      await utility.matchValues(
        actualTotalNonRefundableAmount,
        expectedConfig.cancellationDetails.totalNonRefundableDeposit,
        'total Non Refundable Amount',
        'How is Calculated',
        'merchant-portal'
      );
    }
    // await page.locator(this.close).click();
  }

  async cacellationSummary(screen: any) {
    const title: any[] = [];
    const value: any[] = [];
    for (let i = 0; i <= 8; i++) {
      const arr: any = await this.locatorsCacellationSummary(i);
      if (i == 0 || i == 1 || i == 4) {
        title[i] = await page.locator(arr[0]).innerText();
        value[i] = await page.locator(arr[1]).innerText();
      } else {
        title[i] = await utility.getFormTitle(
          await page.locator(arr[0]).innerText()
        );
        if (i == 6) {
          const keep = await page.locator(arr[1]).innerText();
          value[i] = await keep.replace(/[^0-9.-]/g, '');
        } else {
          value[i] = await utility.getFormValue(
            await page.locator(arr[1]).innerText()
          );
        }
      }
    }
    await this.howIsCalculated(screen);

    expectedConfig.cancellationDetails.actualNonRefundableAmount = (
      Number(expectedConfig.planSummary.totalFunds) -
      Number(expectedConfig.cancellationDetails.ActualRefundAmountUI)
    ).toFixed(2);
    // console.log(
    //   'expectedConfig.cancellationDetails.actualNonRefundableAmount: ',
    //   expectedConfig.cancellationDetails.actualNonRefundableAmount
    // );

    //calcellation Summary
    value[1] = await utility.formatDate(value[1]);
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }

    //print the cancellation summary
    if (config.LocalEnv.verifyFlag == 'false') {
      await utility.printValues(title, value, 'Cancellation Summary');
    }
    await page.fill(this.password_input, `${process.env.USER_PASSWORD_ALICE}`);
    await page.locator(this.submit_button).click();
    await utility.delay(4000);
    expectedConfig.planSummary.planStatus = 'Cancelled';

    console.log(
      'expectedConfig.UpcomingPayments.status.count()',
      expectedConfig.UpcomingPayments.length
    );
    //updating installment status to cancelled
    for (let i = 0; i < expectedConfig.UpcomingPayments.length; i++) {
      expectedConfig.UpcomingPayments[i].status = 'Cancelled';
    }

    expectedConfig.flags.cancelPlanFlag = 'true';
    await utility.writeIntoJsonFile(
      'expected-values',
      expectedConfig,
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant
    );
    await utility.delay(7000);

    console.log(
      "\u001b[1;33mLet's wait for event & Transaction function calling inprogress..\u001b[1;37m."
    );
    const path =
      '../../page-objects/events-transactions/' +
      expectedConfig.planSummary.paymentPlatform_variant +
      '/events-transactions-planCancelled/events-transactions-planCancelled.ts';
    const { eventsTransactionsRequest } = await import(path);
    const eventsTransactions_request = await new eventsTransactionsRequest();
    await eventsTransactions_request.eventsTransaction();

    let youWillKeep: any;
    let planPayFee: any;
    if (Number(expectedConfig.fees.merchantRevenue) < 0) {
      youWillKeep = 0.0;
      youWillKeep = youWillKeep.toFixed(2);
    } else {
      expectedConfig.fees.MerchantRevenueExcludingFees =
        await utility.upto2Decimal(
          Number(expectedConfig.planSummary.totalFunds) -
            Number(
              await utility.upto2Decimal(
                expectedConfig.cancellationDetails.ActualRefundAmountUI
              )
            )
        );
      youWillKeep = expectedConfig.fees.MerchantRevenueExcludingFees;
      //xpectedConfig.fees.merchantRevenue;
    }

    if (Number(expectedConfig.fees.planPayFeesSoFar) < 0) {
      planPayFee = 0.0;
      planPayFee = planPayFee.toFixed(2);
    } else {
      planPayFee = expectedConfig.fees.planPayFeesSoFar;
    }

    console.log('planPayFee: ', planPayFee);
    const expected: any = [
      expectedConfig.customer.firstName +
        ' ' +
        expectedConfig.customer.lastName, //customer fullName
      expectedConfig.cancellationDetails.planCancellationDate, // cancellation date
      await utility.upto2Decimal(expectedConfig.planSummary.totalCost), //plan total
      expectedConfig.planSummary.totalFunds, //total received
      expectedConfig.cancellationDetails.reason, // cancellation reason
      // planPayFee, //PlanPay fees
      await utility.upto2Decimal(
        expectedConfig.cancellationDetails.ActualRefundAmountUI
      ), //Customer will receive
      youWillKeep, //You will keep
      expectedConfig.cancellationDetails.totalNonRefundableDeposit, //Suggested Nonrefundable amount as of June
      expectedConfig.cancellationDetails.actualNonRefundableAmount, //Nonrefundable amount
    ];

    if (config.LocalEnv.verifyFlag == 'false') {
      await utility.printExpectedandAcctualValues(
        title,
        value,
        expected,
        'Cancellation Summary'
      );
    }

    if (
      config.LocalEnv.verifyFlag == 'true' &&
      (await screen.includes('cancellation_summary_popup'))
    ) {
      console.log(
        '\u001b[1;33mCancellation Summary Screen calling for match value function.\u001b[1;37m.'
      );
      await utility.matchValues(
        value,
        expected,
        title,
        'Cancellation Summary Screen',
        'Merchant-Portal'
      );
    }
  }

  async customerPlanSummary(screens: any) {
    const title: any[] = [];
    const amount: any[] = [];
    let expected: any[] = [];

    for (let i = 0; i < 3; i++) {
      const arr: any = await this.locatorsPlanSummary(i);
      title[i] = await utility.getFormTitle(
        await page.locator(arr[0]).innerText()
      );
      amount[i] = await utility.getFormValue(
        await page.locator(arr[1]).innerText()
      );
    }
    //print the customer plan summary
    if (config.LocalEnv.verifyFlag == 'false') {
      await utility.printValues(title, amount, 'Customer Plan Summary');
    }
    //get refund amount and fill in the form.
    expectedConfig.cancellationDetails.ActualRefundAmountUI = await String(
      await utility.upto2Decimal(await this.calculateRefundAmount(0, amount[1])) //Min amount , Max Amount
    );

    console.log(
      'Refund Amount: ',
      expectedConfig.cancellationDetails.ActualRefundAmountUI
    );

    if (
      expectedConfig.cancellationDetails.ActualRefundAmountUI ==
      expectedConfig.planSummary.totalFunds
    ) {
      expectedConfig.cancellationDetails.refundType == 'Full';
    }

    await page.fill(
      this.custom_amount_input,
      expectedConfig.cancellationDetails.ActualRefundAmountUI
    );
    await this.howIsCalculated(screens);
    //clicking on confirm button after filling the refund amount.

    expected = [
      expectedConfig.planSummary.totalCost,
      expectedConfig.planSummary.totalFunds,
      expectedConfig.cancellationDetails.totalNonRefundableDeposit,
    ];

    if (config.LocalEnv.verifyFlag == 'true') {
      console.log(
        '\u001b[1;33mCustomer Plan Screen calling for match value function.\u001b[1;37m.'
      );
      await utility.matchValues(
        amount,
        expected,
        title,
        'Customer Plan Summary',
        'merchant-portal'
      );
    }

    await page.locator(this.confirm_button).click();
  }

  async calculateRefundAmount(minAmount: any, maxAmount: any) {
    //refund amount and total amount send into the random number generation function.
    return await utility.randomInteger(Number(minAmount), Number(maxAmount));
  }

  async cancelPlan(
    cancellationReason: any,
    finalCancellation: any,
    screens: any
  ) {
    const data = await utility.callExpectedJson();
    // await page.locator(this.cancel_plan).click();
    if (expectedConfig.flags.blockedCheckout == 'false') {
      await page.locator('#plan-actions-button').click();
      await page.locator('text="Cancel plan"').click();
      // saving order cancellation date into json file.
      const currentDate = await utility.getCurrentDate();
      const [day, month, year] = currentDate.split('/');
      const formattedDate = `${day.padStart(2, '0')}/${month}/${year}`;
      expectedConfig.cancellationDetails.planCancellationDate = formattedDate;
      await page.locator('text=' + cancellationReason).click();
      await page.locator('text=' + finalCancellation).click();
      console.log(
        '\u001b[1;33m' + Number(expectedConfig.planDetails.items.length),
        'products found in customer plan!..\u001b[1;37m.'
      );
      let productItems = data.planDetails.producItem;
      productItems = productItems.split('$');
      if (Array.isArray(productItems)) {
        for (let i = 0; i < expectedConfig.planDetails.items.length; i++) {
          await plan_cancellation_calculation.calculateNonRefundableAmount_refundPolicy(
            'refundPolicies',
            productItems[i],
            i
          );
        }
      } else {
        await plan_cancellation_calculation.calculateNonRefundableAmount_refundPolicy(
          'refundPolicies',
          productItems,
          1
        );
      }
      if (finalCancellation === 'Cancel and refund a custom amount') {
        expectedConfig.cancellationDetails.refundType = 'Partial';
        //calling Customer Plan Summary
        await this.customerPlanSummary(screens);
        await this.cacellationSummary(screens);
      } else {
        expectedConfig.cancellationDetails.refundType = 'Full';
        expectedConfig.cancellationDetails.ActualRefundAmountUI =
          expectedConfig.planSummary.totalFunds;
        await this.cacellationSummary(screens);
      }
    } else {
      console.log(
        'Sorry Plan Cancellation is not possible because checkout is Blocked!...'
      );
    }
  }
}
