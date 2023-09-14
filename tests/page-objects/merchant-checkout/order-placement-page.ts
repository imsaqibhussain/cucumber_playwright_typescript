import { ProductList } from '../merchant-checkout/product-list-page';
import { calculations } from '../merchant-checkout/calculations';
import { PayWithPlanPay } from '../merchant-checkout/pay-with-planpay-page';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { ScreensValidation } from '../merchant-checkout/screens_validation';
import { databaseConnectDisconnect } from '../backend-configuration/database-connect-disconnect';
const Screen_validation = new ScreensValidation();
const datbase_connect_disconnect = new databaseConnectDisconnect();
const product_list = new ProductList();
const calculation = new calculations();
const pay = new PayWithPlanPay();
export class Orderplacement {
  verifyInstallmentslocator = '#installment_number';

  verifyInstallmentAmountlocator = '#Installment_Amount';
  remainderDescText =
    '(//span[contains(@class,"planpay-MuiTypography-root planpay-MuiTypography-overline")])[2]';
  async placeOrder(
    producItem: any,
    Quantity: any,
    redemptionDate: any,
    merchantName: any,
    installmentType: any,
    validationApplications: any,
    depositSetting: any,
    checkoutCurrency: any
  ) {
    await calculation.readMerchantFile(); //to save Merchant.json in static variable
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let data: string[] = {};
    // let instalmentAmount;
    const quantity = await product_list.adding_product(
      producItem,
      Quantity,
      redemptionDate,
      checkoutCurrency
    );
    expectedConfig.LocalEnv.screen = 'CheckoutWidget';
    console.log('Products Price & their Quantity ==> ' + quantity);
    const productsAmount = quantity[0];
    const productsQuantity = quantity[1];
    expectedConfig.planDetails.producItem = producItem;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig.planDetails.productsAmount = productsAmount;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig.planDetails.productsQuantity = productsQuantity;
    expectedConfig.depositSettings.depositSetting = depositSetting;
    expectedConfig.planSummary.planStatus = 'On Schedule';

    expectedConfig.planSummary.selectedInstalmentType = installmentType;
    await calculation.products_total_cost_calcuation(
      productsAmount,
      productsQuantity
    );
    const finalCompletionDates = await calculation.calculateFinalCompletionDate(
      redemptionDate,
      producItem
    ); //calculates final payment date for evey product

    await calculation.getEarlierCompletionDate(finalCompletionDates); // return the earlier date among shipment date(s) of product(s)
    await calculation.determineDepositRule(producItem); //determine which deposit rule will apply (Product level or global deposit)
    // await calculation.determineRule(
    // producItem,
    // 'depositRefundable,refundPolicies'
    // ); //determine which deposit rule will apply (Product level or global deposit)

    await calculation.calculateDefaultMinDepositAmount(
      expectedConfig.planDetails.productsAmount,
      expectedConfig.planDetails.productsQuantity,
      expectedConfig.planDetails.producItem
    ); //calculate default min deposit

    const screenName = await validationApplications.split(',');
    expectedConfig.flags.blockedCheckout = 'false';
    if (
      Number(expectedConfig.planSummary.totalCost) <
      (await (50 + calculations.merchantCurrency.minimumPaymentAmount))
    ) {
      expectedConfig.flags.blockedCheckout = 'true';
    } else {
      await Promise.all([
        await product_list.view_cart(),
        await datbase_connect_disconnect.identify_gateway(),

        (await expectedConfig.flags.blockedCheckout) == 'true'
          ? console.log('\x1b[31m Checkout Blocked \x1b[37m')
          : ((await screenName.includes('price_preview_widget'))
              ? (await calculation.priceWidgetCalculation(),
                await calculation.pricePreviewWidgetMarkup(),
                await Screen_validation.checkForPlanPayOption(),
                await Screen_validation.priceWidgetValidation())
              : console.log('No verification for price_preview_widget'),
            (await screenName.includes('price_preview_widget_2'))
              ? await Screen_validation.priceWidget2Validation()
              : console.log('No Validation for price preview widget 2'),
            ((await expectedConfig.flags.blockedCheckout) == 'true'
              ? console.log('\x1b[33m Checkout is blocked \x1b[37m')
              : await pay.calculate_allCadenceOptions(),
            (await screenName.includes('checkout_widget'))
              ? await Screen_validation.widgetAndSummaryValidation('Widget')
              : console.log('No verification for checkout widget'),
            await pay.click_planPay_installment())),
      ]);
      data = {
        //saving plan details in data object
        ...data,
        ...expectedConfig,
      };
    }
    if (expectedConfig.flags.blockedCheckout == 'true') {
      console.log('\x1b[33m Checkout is blocked \x1b[37m');
    } else {
      return data;
    }
  }
}
