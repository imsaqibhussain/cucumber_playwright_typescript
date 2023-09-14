// import { expect } from '@playwright/test';
import { Utilities } from '../utilities';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { context } from '../../features/support/hooks';

const utility = new Utilities();
export class WelcomeEmail {
  username = '#name';
  async verifyWelcomeEmail(email: any, subjectLine: any) {
    const page1 = await context.newPage();
    if (email.includes('@mailinator.com')) {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on Mailinator public portal.'
      );
      const link =
        'https://www.mailinator.com/v4/public/inboxes.jsp?to=' + email;
      await page1.goto(link);
    } else {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on planpay.testinator.com private portal.'
      );
      const link = `${process.env.MAILINATOR_PRIVATE_URL}` + email;
      await page1.goto(link);
    }
    await utility.delay(10000);
    await console.log('\u001b[1;33mWaiting for email!...');

    await page1.waitForSelector('text=' + subjectLine);

    const receivedTitle: any = await page1
      .locator("(//td[@class='ng-binding'])[2]")
      .innerText();
    console.log('Your email subject is: ', receivedTitle + '!..\u001b[1;37m.');
    if (receivedTitle.includes('SIZE_LIMIT_REACHED')) {
      console.log(
        '\u001b[1;31mSIZE_LIMIT_REACHED no further verification required..\u001b[1;37m.'
      );
    } else {
      console.log("let's go with the welcome email verification");
      if ((await page1.locator('text=' + subjectLine).isVisible()) === true) {
        console.log('\u001b[1;32mWelcome email received successfully!...');
        console.log('\u001b[1;37m...');
        await page1
          .locator('text=' + subjectLine)
          .first()
          .click();
        const emailIframe = await page1.waitForSelector('iframe');
        const emailFrame = await emailIframe.contentFrame();
        const actual = await emailFrame?.textContent(this.username);
        const expected = expectedConfig.customer.firstName;
        await utility.printValues('username', actual, 'Welcome Email');
        if (
          config.LocalEnv.verifyFlag == 'true' &&
          expectedConfig.LocalEnv.applicationName == 'merchant-testing'
        ) {
          await utility.matchValues(
            actual,
            expected,
            'Username',
            'WelcomeEmail',
            expectedConfig.LocalEnv.applicationName
          );
        }
      } else {
        console.log('\u001b[1;31mWelcome email is not received!....');
      }
    }

    await page1.close();
  }
}
