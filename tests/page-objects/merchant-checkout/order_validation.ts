import { OrderPage } from '../merchant-portal/order-details-page';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { page } from '../../features/support/hooks';
import { Utilities } from '../utilities';
const orderpage = new OrderPage();
const utilities = new Utilities();
export class OrderValidation {
  async validateOrder() {
    const data = await utilities.callExpectedJson();
    expectedConfig.planSummary = data.planSummary;
    expectedConfig.depositSettings = data.depositSettings;
    expectedConfig.fees = data.fees;
    expectedConfig.merchantDetails = data.merchantDetails;
    expectedConfig.cancellationDetails = data.cancellationDetails;
    expectedConfig.planDetails = data.planDetails;
    expectedConfig.flags = data.flags;
    expectedConfig.MerchantEnv = data.MerchantEnv;
    expectedConfig.customer = data.customer;
    expectedConfig.customerLog = data.customerLog;
    expectedConfig.UpcomingPayments = data.UpcomingPayments;
    expectedConfig.paidPayments = data.paidPayments;
    expectedConfig.latePayments = data.latePayments;
    expectedConfig.LocalEnv = data.LocalEnv;

    const planID = String(expectedConfig.planSummary.planID);
    const merchantID = String(expectedConfig.merchantDetails.merchantId);

    console.log('Set planID == ' + planID);
    console.log(
      'Generated link',
      `${process.env.PLANPAY_NEXT_URL}/portal/merchant/${merchantID}/plan-detail/${planID}`
    );

    await utilities.delay(3000);
    await page.goto(
      `${process.env.PLANPAY_NEXT_URL}/portal/merchant/${merchantID}/plan-detail/${planID}`
    );
    await utilities.delay(1000);

    // const detailsScreen =
    //   'ProductSummary,SettlementDetails,CustomerOrderDetails,LastPaymentHistory,FullPaymentHistory,OrderDetails';
    // //,basicDetails,CustomerInformation'
    // const searchResults = await searchPage.submitOperation(
    //   'Search',
    //   'Planpay ID',
    //   planID,
    //   'true'
    // );
    // await orderpage.orderDetails(detailsScreen, 1, searchResults);
    await orderpage.printDetailsNew();
  }
}
