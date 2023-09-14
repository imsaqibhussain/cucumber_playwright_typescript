const pinCodeXpathL = '#otp-token';
//'strong';
import { context } from '../../features/support/hooks';
import { Utilities } from '../utilities';
const utility = new Utilities();
export class SignUpCode {
  frameL = '#html_msg_body';
  // 'iframe';
  async openEmail(email: string, subjectLine: any) {
    const page1 = await context.newPage();
    if (email.includes('@mailinator.com')) {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on Mailinator public portal!...'
      );
      const link =
        'https://www.mailinator.com/v4/public/inboxes.jsp?to=' + email;
      await page1.goto(link);
    } else {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on planpay.testinator.com private portal!...'
      );
      const link = `${process.env.MAILINATOR_PRIVATE_URL}` + email;
      await page1.goto(link);
    }
    await page1.waitForLoadState();
    await utility.delay(2000);
    if (
      (await page1
        .locator("//td[text()[normalize-space()='" + subjectLine + "']]")
        .first()
        .isVisible()) === true
    ) {
      await page1
        .locator("//td[text()[normalize-space()='" + subjectLine + "']]")
        .first()
        .click();
      const emailIframe = await page1.waitForSelector(this.frameL);
      const emailFrame = await emailIframe.contentFrame();
      const codeXPath = await pinCodeXpathL;
      const code = await emailFrame?.textContent(codeXPath);
      await page1.close();
      return code;
    } else {
      console.log('PinVerification Email is not found');
      await page1.close();
      return 'resend';
    }
  }
}
