import { page } from '../../features/support/hooks';
import { OrderPage } from '../merchant-portal/order-details-page';
import { expectedConfig } from '../../header';
import { Utilities } from '../utilities';
const utilities = new Utilities();
const orderpage = new OrderPage();

export class AdminOrderValidation {
  dropDownL = "//div[@id='portal-switcher']";
  async validateOrder() {
    // await page.goto(`${process.env.PLANPAY_NEXT_URL}`);
    // await page.waitForSelector(this.dropDownL);
    // await page.locator(this.dropDownL).click();
    // await page.waitForSelector('#portal-switcher-admin');
    // await page.locator('#portal-switcher-admin').click();
    const planID = String(expectedConfig.planSummary.planID);
    console.log('Set planID = ' + planID);
    console.log('testing');
    await utilities.delay(3000);
    await page.goto(
      `${process.env.PLANPAY_NEXT_URL}/portal/admin/plans/${planID}`
    );
    await utilities.delay(1000);
    await orderpage.printDetailsNew();
  }
}
