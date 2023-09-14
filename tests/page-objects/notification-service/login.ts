import { context } from '../../features/support/hooks';
import { Utilities } from '../utilities';

const utility = new Utilities();
export class mailinatorLogin {
  login_button = "//span[text()='LOGIN']";
  mailinator_email = '#many_login_email';
  mailinator_password = '#many_login_password';
  user_login = "//a[@aria-label='Login link']";

  async mailinatorlogin() {
    const page1 = await context.newPage();
    const website = `${process.env.MAILINATOR_URL}`;
    await page1.goto(website);
    await page1.waitForLoadState('domcontentloaded');
    await page1.once('load', () =>
      console.log(
        '\u001b[1;33mmailinator Page loading completed!..\u001b[1;37m.'
      )
    );
    await page1.click(this.login_button);
    await utility.delay(3000);
    if (await page1.locator(this.mailinator_email).isVisible()) {
      await page1
        .locator(this.mailinator_email)
        .fill(`${process.env.MAILINATOR_EMAIL}`);
      await page1
        .locator(this.mailinator_password)
        .fill(`${process.env.MAILINATOR_PASSWORD}`);
      await page1.click(this.user_login);
    }

    await utility.delay(10000);

    await page1.close();
    // return page1
  }
}
