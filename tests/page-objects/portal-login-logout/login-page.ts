import { page } from '../../features/support/hooks';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { Utilities } from '../utilities';
import { Page, expect } from '@playwright/test';

const utility = new Utilities();
export class Login {
  usernameField = '[data-planpay-test-id="email-input"]';
  passwordField = '[data-planpay-test-id="password-input"]';
  keepMeSiginBtn = '[data-testid="stay-signin-checkbox"]';
  sideMenuBtn = "//div[@class='sidebar-menu']";
  gotoDashboard = "//button[@type='button']";
  // loginBtn = "//button[@type='submit']";
  loginBtn = "//button[@data-planpay-test-id='sign_in']";
  dropDownL = "//div[@id='portal-switcher']";

  async login(
    username: string,
    password: string,
    keepMeSignedIn: string,
    applicationName: string,
    env: string,
    url: string
  ) {
    console.log(env);

    await this.navigateToLoginScreen(url);
    await utility.delay(5000);
    if (await page.locator('[data-planpay-test-id="signout"]').isVisible()) {
      await page.locator('[data-planpay-test-id="signout"]').click();
    }
    await this.submitLoginWithParameters(
      username,
      password,
      keepMeSignedIn,
      applicationName,
      env
    );

    if (
      applicationName === 'merchant-portal' ||
      applicationName === 'assisted-checkout'
    ) {
      await page.waitForLoadState();
      await page.waitForSelector(this.dropDownL);
      await page.locator(this.dropDownL).click();
      await this.merchantSelection_merchantPortal(
        expectedConfig.LocalEnv.merchantName
      );
    }
    if (applicationName === 'admin-portal') {
      await page.waitForLoadState();
      await page.waitForSelector(this.dropDownL);
      await page.locator(this.dropDownL).click();
      await page.waitForSelector('#portal-switcher-admin');
      await page.locator('#portal-switcher-admin').click();
      // await page.waitForSelector(
      //   'text=' + expectedConfig.LocalEnv.merchantName
      // );
      // await page
      //   .locator('text=' + expectedConfig.LocalEnv.merchantName)
      //   .click();
    }
    // await utility.delay(10000);
  }

  async navigateToLoginScreen(url: string) {
    // const url = process.env.PLANPAY_NEXT_URL;
    console.log('\u001b[1;33mvisting the URL: ' + url + '.\u001b[1;37m.');
    //const website = `https://portal.uat.nonprod.planpay.com/auth/signin`;
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    // await page.once('load', () => console.log('Page loaded!'));
  }

  async submitLoginWithParameters(
    username: string,
    password: string,
    keepMeSignedIn: string,
    applicationName: string,
    env: string
  ) {
    // expectedConfig.LocalEnv.applicationName = applicationName;
    console.log('Environment is: ' + env);
    console.log('ApplicationName is: ' + applicationName);
    await utility.delay(6000);
    await page.waitForLoadState();
    if (await page.locator("//p[text()='Sign out']").isVisible()) {
      await page.locator("//p[text()='Sign out']").click();
    }
    if (await page.locator("//p[@class='logout-button']").isVisible()) {
      await page.locator("//p[@class='logout-button']").click();
    }
    // await utility.delay(2000);
    // await page.waitForLoadState();
    // await page.waitForSelector(this.usernameField);

    const maxAttempts = 3; // Maximum number of attempts
    const retryDelay = 2000; // Delay between retry attempts in milliseconds

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await utility.delay(retryDelay);
          await page.waitForLoadState();
          await page.waitForSelector(this.usernameField);
          break; // Exit the loop if the selector is found
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error.message);
          if (attempt < maxAttempts) {
            console.log('Retrying...');
            // Adjust the delay as needed between retry attempts
            await page.waitForTimeout(retryDelay);
          } else {
            throw new Error(
              'On Login Page Email locator not found after multiple attempts'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }

    await page.fill(this.usernameField, username);
    await page.fill(this.passwordField, password);
    if (keepMeSignedIn == 'true') {
      // await page.click(this.keepMeSiginBtn);
    }
    await page.waitForSelector(this.loginBtn);
    await page.click(this.loginBtn);
    const testCaseErrCheck = await utility.checkForError();
    if (testCaseErrCheck == 'fail') {
      await expect(testCaseErrCheck).toEqual('pass');
    }
    //disable title....
    // if (expectedConfig.LocalEnv.applicationName == 'merchant-testing') {
    //   await utility.delay(10000);
    //   await expect(page).toHaveTitle('Checkout - Planpay');
    // } else if (
    //   expectedConfig.LocalEnv.applicationName == 'customer-portal' ||
    //   expectedConfig.LocalEnv.applicationName == 'merchant-portal'
    // ) {
    //   await utility.delay(10000);
    //   await expect(page).toHaveTitle('Customer Portal - PlanPay');
    // }
    // expectedConfig.LocalEnv.applicationName = applicationName;
  }

  async merchant_selection(merchantName: any) {
    console.log('merchant passed name=' + merchantName);

    const localMerchant = await utility.commonJsonReadFunc('jsonFile'); //reading merchant config file
    // expectedConfig.merchantDetails.merchantId = localMerchant.merchant?.id;

    expectedConfig.MerchantEnv.productList = localMerchant.products?.itemArray; //logic to be implemented

    console.log(
      'extracted merchant ' + localMerchant.merchant?.id,
      localMerchant.merchant?.name
    );

    await utility.delay(1000);

    await page.waitForSelector('text=' + merchantName);
    await page
      .locator('text=' + merchantName)
      .first()
      .click();

    await utility.delay(1000);
  }

  async merchantSelection_merchantPortal(merchantName: string) {
    let merchant_name = await merchantName.toLocaleLowerCase();
    merchant_name = await merchant_name.replace(' ', '_');
    await page.click(
      "//li[@id='merchant-portal-switcher-" + merchant_name + "']"
    );
  }
}
