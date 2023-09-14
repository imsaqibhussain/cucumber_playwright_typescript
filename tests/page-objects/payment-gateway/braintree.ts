// eslint-disable-next-line @typescript-eslint/quotes
import { page } from '../../features/support/hooks';
import { config, expectedConfig } from '../../header';
import { Utilities } from '../utilities';
import { expect } from '@playwright/test';

const utility = new Utilities();

export class Braintree {
  gotoDashboard = 'text="LET’S GET STARTED"';
  updateL = '//span[normalize-space()="UPDATE"]';
  nextButton2L = '//button[normalize-space()="Submit"]';
  processPaymentButton = '//button[normalize-space()="Process payment plan"]';
  async addCard(cardStatus: any, cardType: any, signUpMessage: any) {
    console.log(
      '---------------- Adding Billing Details ---------------------' + '\n'
    ); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cardNumber: any =
      config.testCards[expectedConfig.planSummary.paymentPlatform_vendor][
        cardStatus
      ][cardType].cardnumber;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const month: any = await config.testCards[
      expectedConfig.planSummary.paymentPlatform_vendor
    ][cardStatus][cardType].Expiry.toString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cvc: any =
      config.testCards[expectedConfig.planSummary.paymentPlatform_vendor][
        cardStatus
      ][cardType].CVC;

    // await page.waitForSelector('iframe[title="Secure payment input frame"]');
    await page
      .frameLocator('iframe[id="braintree-hosted-field-number"]')
      .locator('#credit-card-number')
      .fill(cardNumber);
    await page
      .frameLocator('iframe[id="braintree-hosted-field-expirationDate"]')
      .locator('#expiration')
      .fill(month);
    await page
      .frameLocator('iframe[id="braintree-hosted-field-cvv"]')
      .locator('#cvv')
      .fill(cvc);
    const len = Number(cardNumber.length);
    if (len == 16) {
      expectedConfig.planSummary.paymentMethod = cardNumber.slice(12, 16);
      expectedConfig.paidPayments[0].paymentMethodUsed = cardNumber.slice(
        12,
        16
      );
    } else {
      expectedConfig.planSummary.paymentMethod = cardNumber.slice(11, 15);
      expectedConfig.paidPayments[0].paymentMethodUsed = cardNumber.slice(
        11,
        15
      );
    }
    if (
      (await page.locator("//span[normalize-space()='UPDATE']").isVisible()) ===
      true
    ) {
      await page.click(this.updateL);
    } else {
      if (expectedConfig.LocalEnv.applicationName == 'assisted-checkout') {
        await page.click(this.processPaymentButton);
      } else {
        await page.waitForSelector(this.nextButton2L);
        await page.click(this.nextButton2L);
      }
      await utility.delay(3000);
      if (
        (await page
          .locator(
            "//div[@class='MuiSnackbar-root MuiSnackbar-anchorOriginTopCenter css-16yg1ak']"
          )
          .isVisible()) === true
      ) {
        const msg = await page
          .locator(
            "//div[@class='MuiSnackbar-root MuiSnackbar-anchorOriginTopCenter css-16yg1ak']"
          )
          .innerText();
        console.log('my msg', msg);
        await expect(msg).not.toEqual(
          'An internal server error occured, please contact support'
        );
      }

      console.log(cardStatus);
      if (
        cardStatus === 'incorrect_cvc' ||
        cardStatus === 'processing_error' ||
        cardStatus === 'Insufficient_funds_decline' ||
        cardStatus === 'Stolen_card_decline' ||
        cardStatus === 'expired_card' ||
        cardStatus === 'invalid' ||
        cardStatus === 'card_decline' ||
        cardStatus === 'Lost_card_decline' ||
        cardStatus === 'unsupported'
      ) {
        console.log('here in message statement ');
        await page.waitForSelector("//span[@class='message']");
        const msg = await page.locator("//span[@class='message']").innerText();
        await console.log('Captured Message: ', msg);
        await expect(msg).toBe(signUpMessage);
        if (msg === signUpMessage) {
          return 1;
        }
      }
    }
  }
}
