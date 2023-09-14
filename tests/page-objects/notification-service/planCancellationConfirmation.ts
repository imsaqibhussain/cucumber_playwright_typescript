import { Utilities } from '../utilities';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { context, page } from '../../features/support/hooks';
// import { LogoutPage } from '../portal-login-logout/logout-page';
// const logout = new LogoutPage();

const utility = new Utilities();
export class planCancellationConfirmation {
  username = '#name';
  order_status = '#plan-status';
  plan_status = "//span[text()='Plan Status']/following-sibling::div";
  //"//div[@class='MuiBox-root css-1qnxlqp']//span[1]";

  async verifyOrderStatusFromMerchantPortal() {
    await utility.delay(2000);
    const actual: any = [await page.locator(this.order_status).innerText()];
    const expected: any = [expectedConfig.planSummary.planStatus];
    const fieldName: any = ['Plan Status'];
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        fieldName,
        'PLan Details',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printValues(
        fieldName,
        actual,
        'Plan Status on Merchant Portal'
      );
    }
  }

  async verifyOrderStatusFromCustomerPortal() {
    await utility.delay(4000);
    await page.waitForLoadState();
    await page.waitForSelector(this.plan_status);
    const actual: any = [await page.locator(this.plan_status).innerText()];
    const expected: any = [expectedConfig.planSummary.planStatus];
    const fieldName: any = ['Plan Status'];
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        fieldName,
        'Plan Details',
        expectedConfig.LocalEnv.applicationName
      );
    } else {
      await utility.printValues(
        'Plan Status: ',
        actual,
        'Status Matching on customer portal'
      );
    }
  }

  async verifyCancellationEmail(email: any, subjectLine: any) {
    const page1 = await context.newPage();
    const link = `${process.env.MAILINATOR_PRIVATE_URL}` + email;
    await page1.goto(link);
    await utility.delay(4000);
    await console.log("let's wait for Cancellation email....");
    await page1.waitForSelector('text=' + subjectLine);
    if (
      (await page1
        .locator('text=' + subjectLine)
        .first()
        .isVisible()) === true
    ) {
      console.log('Cancellation email received successfully!....');
      await page1
        .locator('text=' + subjectLine)
        .first()
        .click();
      //   const emailIframe = await page1.waitForSelector('iframe');
      //   const emailFrame = await emailIframe.contentFrame();
      //   const actual = await emailFrame?.textContent(this.username);
      //   const expected = expectedConfig.customer.firstName
      //   await utility.printValues('username', actual, 'Welcome Email')
      //   if (config.LocalEnv.verifyFlag == 'true' && expectedConfig.LocalEnv.applicationName == 'merchant-testing'){
      //     await utility.matchValues(actual,expected,'Username','WelcomeEmail',expectedConfig.LocalEnv.applicationName)
      //   }
    } else {
      console.log('Cancellation email is not received!....');
    }
    await page1.close();
    await context.close();
  }
}
