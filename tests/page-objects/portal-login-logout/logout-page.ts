import { page } from '../../features/support/hooks';
import { expectedConfig } from '../../header';
import { Utilities } from '../utilities';
const utility = new Utilities();

export class LogoutPage {
  customerPortalLogOut = '[data-planpay-test-id="signout"]';
  // merchantPortalLogOut = "//p[@class='logout-button']";
  merchantPortalLogOut = "//a[@id='log-out']";
  sideMenuBtn = '#react-burger-menu-btn'; // not used
  async logout() {
    if (expectedConfig.LocalEnv.applicationName == 'customer-portal')
      await page.click(this.customerPortalLogOut);
    if (expectedConfig.LocalEnv.applicationName == 'merchant-portal')
      await page.click(this.merchantPortalLogOut);
    const commonDetails = await utility.readCustomerDetails();
    commonDetails.customer = expectedConfig.customer;
    commonDetails.customerLog = expectedConfig.customerLog;
    await utility.writeIntoJsonFile(
      'common-details',
      commonDetails,
      'expected'
    );
  }
}
