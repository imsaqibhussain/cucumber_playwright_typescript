import { expect } from '@playwright/test';
import { context } from '../../features/support/hooks';
import { Utilities } from '../utilities';
import { mailinatorLogin } from './login';
import { config } from '../../header';
const ml_login = new mailinatorLogin();

const utility = new Utilities();
export class ResetPasswordLink {
  frameL = 'iframe';
  resetPasswordButton = '#reset-password-button';
  set_Password = '#reset_password';
  confirm_password = '#confirm_password';
  reset_button = '#reset_button';
  resetEmail = "(//tr[@class='ng-scope']//td)[2]";
  resetPasswordIFrame = 'html[1]/body[1]/div[1]';
  resetPasswordLink = 'td#bodyCell>a';
  passwordChangedTextL = 'text=Password Reset Successfully!';
  //'//span[text()="Password Reset Successfully!"]';
  passwordText = "//p[text()='Reset your password']";
  customerPortalLogOut = '[data-planpay-test-id="signout"]';

  async resetPassword(email: any) {
    const r_page = await context.newPage();
    if (config.LocalEnv.signUpDomain == '@planpay.testinator.com') {
      const link = `${process.env.MAILINATOR_PRIVATE_URL}` + email;
      await ml_login.mailinatorlogin();
      await r_page.goto(link);
    } else {
      const link = `${process.env.MAILINATOR_PUBLIC_URL}` + email;
      await r_page.goto(link);
    }
    await r_page.waitForLoadState(); //Navigating to Another Page
    await r_page.waitForSelector(this.resetEmail);
    await r_page.locator(this.resetEmail).click();
    const emailIframe = await r_page.waitForSelector(this.frameL);
    const emailFrame = await emailIframe.contentFrame();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      emailFrame?.locator(this.resetPasswordButton).click(),
    ]);
    await r_page.close();
    await newPage.waitForLoadState(); //Navigating to Another Page
    await newPage.waitForSelector(this.set_Password);
    await newPage.fill(
      this.set_Password,
      `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`
    );
    await newPage.waitForSelector(this.confirm_password);
    await newPage.fill(
      this.confirm_password,
      `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`
    );

    await newPage.waitForSelector(this.reset_button);
    await newPage.locator(this.reset_button).click();
    await newPage.waitForLoadState(); //Navigating to Another Page
    if (await newPage.locator(this.passwordChangedTextL).isVisible()) {
      const passwordChangedText: any = await newPage
        .locator(this.passwordChangedTextL)
        .innerText();
      await expect(passwordChangedText).toBe('Password Reset Successfully!');
    }
    await newPage.locator(this.customerPortalLogOut).click();
    const data = await utility.readJsonFile('expected/common-details.json');

    data.isResetFlag = 'true';
    await utility.writeIntoJsonFile('common-details', data, 'expected');

    await newPage.close();
  }
}
