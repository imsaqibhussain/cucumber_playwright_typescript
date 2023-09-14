import { Utilities } from '../utilities';
import { expect } from '@playwright/test';
import { page } from '../../features/support/hooks';

const utility = new Utilities();

export class resetPassword {
  emailFieldLocator = '[data-testid="email-input"]';
  // emailFieldLocator = lp.usernameField;
  resetEmailField = '#input_field';
  resetPasswordButton = '#reset_button';
  resetTextLink =
    "//h4[contains(@class,'MuiTypography-root MuiTypography-h4')]";
  forgotPasswordButton_locator =
    "//span[@data-planpay-test-id='forgot-password-link']";
  resetDescText =
    "//p[contains(@class,'MuiTypography-root MuiTypography-body1')]";
  goBackLink =
    "//span[contains(@class,'MuiTypography-root MuiTypography-overline')]//span[1]";
  resetEmailInputField = "//input[@data-testid='email-input']";
  resetPasswordInputField = '#confirm_password';
  logoutTextButton = "//div[@class='sidebar-menu']//div[1]";
  loginButtonLocator = '#:rc:';

  async forgotPassword(email: any) {
    await page.waitForSelector(this.forgotPasswordButton_locator);
    await page.locator(this.forgotPasswordButton_locator).click();
    await page.waitForLoadState(); //Navigating to another page
    await page.waitForSelector(this.resetEmailField);

    //Assertion
    await page.fill(this.resetEmailField, email);
    // await expect(resetEmailText).toEqual(email);
    await page.waitForSelector(this.resetPasswordButton);
    await page.locator(this.resetPasswordButton).click();
    await page.waitForLoadState(); //Navigating to Another Page
    await page.waitForSelector(this.resetTextLink);
    const resetText = await page.locator(this.resetTextLink).innerText();

    //Assertion
    await expect(resetText).toBe('Password link has been sent');
    await page.waitForSelector(this.resetDescText);
    const resetTextDesc = await page.locator(this.resetDescText).innerText();
    //Assertion

    await expect(resetTextDesc).toBe(
      'You should receive an email with instructions soon on how to reset your password if there is a registered account.'
    );
    await page.waitForSelector(this.goBackLink);
    await page.locator(this.goBackLink).click();
  }

  async successfulLoginAssertion() {
    await page.waitForLoadState();
    await utility.delay(5000);
    const actualURL = await page.url();
    const expectedUrl = process.env.PLANPAY_NEXT_URL + '/portal/customer';
    await expect(actualURL).toBe(expectedUrl);
    await console.log(
      '\u001b[1;32mForget Password Test Case is Passed Successfully'
    );
  }
}
