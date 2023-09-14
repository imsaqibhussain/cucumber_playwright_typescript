import { Utilities } from '../utilities';
import { config, SignupPage, expectedConfig } from '../../header';
import { page } from '../../features/support/hooks';
import { SignUpCode } from '../notification-service/signUpCode-ts';
import { mailinatorLogin } from '../notification-service/login';
import { databaseConnectDisconnect } from '../backend-configuration/database-connect-disconnect';
const dbconnection = new databaseConnectDisconnect();
const utility = new Utilities();
const signUp = new SignupPage();
const signupcode = new SignUpCode();
const ml_login = new mailinatorLogin();
export class profile {
  profileL = '[data-planpay-test-id="myprofile"]';
  editProfileL = '[data-planpay-test-id="editprofile"]';
  confirmButtonL = '[data-planpay-test-id="confirm"]';
  firstNameL = '[data-planpay-test-id="firstname"]';
  lastNameL = '[data-planpay-test-id="lastname"]';
  phoneNumL = '[data-planpay-test-id="phonenumber"]';
  email = '[data-planpay-test-id="email"]';
  welcomeEmailL = 'Welcome to PlanPay, please verify your email address';
  pinDigit0 = '[data-planpay-test-id="pindigit-0"]';
  pinDigit1 = '[data-planpay-test-id="pindigit-1"]';
  pinDigit2 = '[data-planpay-test-id="pindigit-2"]';
  pinDigit3 = '[data-planpay-test-id="pindigit-3"]';
  pinDigit4 = '[data-planpay-test-id="pindigit-4"]';
  pinDigit5 = '[data-planpay-test-id="pindigit-5"]';
  saveButton = '[data-planpay-test-id="save"]';
  editPasswordL = '[data-planpay-test-id="editpassword"]';
  currentPasswordL = '[data-planpay-test-id="currentpassword"]';
  newPasswordL = '[data-planpay-test-id="newpassword"]';
  actualEmailL = "(//div[@class='MuiBox-root css-ayshjd']//span)[2]";
  actualPhoneL = "(//div[@class='MuiBox-root css-1elmwgc'])[3]";
  actualNameL = "(//div[@class='MuiBox-root css-1elmwgc']//div)[2]";
  emailFirstName = "//div[@class='plan-pay-section-inner-div']//p[1]";
  usernameinEmail = "//div[@class='plan-pay-section-inner-div']//p[1]";
  myPlan = "//a[@data-planpay-test-id='myplans']";
  firstOrder = '#order-1';
  marketPlace = "//a[@data-planpay-test-id='marketplace']";

  async editEmail() {
    await page.waitForLoadState();
    await page.waitForSelector(this.editProfileL);
    await page.click(this.editProfileL);
    let newEmail = await signUp.generateEmail();
    await dbconnection.verifyEmailExist(newEmail);
    expectedConfig.customer.Email = newEmail;

    await page.fill(this.email, expectedConfig.customer.Email); //fill new email

    await page.fill(this.email, expectedConfig.customer.Email); //fill new email

    const customerData = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let password: any;
    if (customerData.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await page.fill(this.currentPasswordL, password);
    await page.click(this.saveButton); // click on save button

    while (
      (await page.locator("text='Email already exists'").isVisible()) == true
    ) {
      console.log('\u001b[1;31mYour Email is already exist!..\u001b[1;37m.');
      console.log("\u001b[1;33mlet's try with new Email!..\u001b[1;37m.");
      newEmail = await signUp.generateEmail();
      await dbconnection.verifyEmailExist(newEmail);
      expectedConfig.customer.Email = newEmail;
      await page.fill(this.email, expectedConfig.customer.Email); //fill new email
      const customerData = await utility.readJsonFile(
        'expected/common-details.json'
      );
      let password: any;
      if (customerData.isResetFlag == 'true') {
        password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
      } else {
        password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
      }
      await page.fill(this.currentPasswordL, password);
      await page.click(this.saveButton); // click on save button
      await utility.delay(3000);
    }

    if (config.LocalEnv.signUpDomain == '@planpay.testinator.com') {
      await ml_login.mailinatorlogin();
    }
    await utility.delay(2000);
    const myCode: any = await signupcode.openEmail(
      expectedConfig.customer.Email,
      this.welcomeEmailL
    );
    const myDigits: any = Array.from(myCode);
    //fill the pin verification code.
    await page.fill(this.pinDigit0, myDigits[0]);
    await page.fill(this.pinDigit1, myDigits[1]);
    await page.fill(this.pinDigit2, myDigits[2]);
    await page.fill(this.pinDigit3, myDigits[3]);
    await page.fill(this.pinDigit4, myDigits[4]);
    await page.fill(this.pinDigit5, myDigits[5]);
    await page.click(this.confirmButtonL);
  }
  async editPhone() {
    await page.click(this.editProfileL);
    expectedConfig.customer.phoneNumber = config.customer.phoneNumber;
    await page.fill(this.phoneNumL, expectedConfig.customer.phoneNumber);
    const customerData = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let password: any;
    if (customerData.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await page.fill(this.currentPasswordL, password);
    await page.click(this.saveButton); // click on save button
  }
  async editPassword() {
    await page.click(this.editProfileL);
    const customerData = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let password: any;
    if (customerData.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await page.fill(this.currentPasswordL, password);
    await page.click(this.editPasswordL);
    await page.fill(
      this.newPasswordL,
      `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`
    );
    await page.fill(
      this.newPasswordL,
      `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`
    );
    await page.click(this.saveButton); // click on save button
  }
  async editfirstName() {
    await page.click(this.editProfileL);
    expectedConfig.customer.firstName =
      config.customer.firstName + (await utility.enterRandomtext(4));
    await page.fill(this.firstNameL, expectedConfig.customer.firstName);
    const customerData = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let password: any;
    if (customerData.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await page.fill(this.currentPasswordL, password);
    await page.click(this.saveButton); // click on save button
  }
  async editlastName() {
    await page.click(this.editProfileL);
    expectedConfig.customer.lastName =
      config.customer.lastName + (await utility.enterRandomtext(4));
    await page.fill(this.lastNameL, expectedConfig.customer.lastName);
    const customerData = await utility.readJsonFile(
      'expected/common-details.json'
    );
    let password: any;
    if (customerData.isResetFlag == 'true') {
      password = `${process.env.CUSTOMER_PORTAL_RESET_PASSWORD}`;
    } else {
      password = `${process.env.CUSTOMER_PORTAL_PASSWORD}`;
    }
    await page.fill(this.currentPasswordL, password);
    await page.click(this.saveButton); // click on save button
  }

  async myProfile(operationName: any, fieldName: any) {
    await page.click(this.profileL);
    if (operationName.includes('edit')) {
      if (fieldName.includes('customer_firstName')) {
        await this.editfirstName();
      }
      if (fieldName.includes('customer_lastName')) {
        await this.editlastName();
      }
      if (fieldName.includes('phone')) {
        await this.editPhone();
      }
      if (fieldName.includes('email')) {
        await this.editEmail();
      }
      if (fieldName.includes('password')) {
        await this.editPassword();
      }
    }
  }

  async validatePlans() {
    await page.locator(this.myPlan).click();
    if (!(await page.locator(this.firstOrder).isVisible())) {
      console.log(
        "\u001b[1;31mPlan's are not found against the Users!..\u001b[1;37m."
      );
    }
  }

  async verifyProfileDetails() {
    await utility.delay(5000);
    await page.waitForLoadState();
    await page.waitForSelector(this.profileL);
    await page.click(this.profileL);
    await utility.delay(3000);
    await page.waitForLoadState();
    await page.waitForSelector(this.actualEmailL);
    const actualEmail = await page.locator(this.actualEmailL).innerText();
    const fullName = await page.locator(this.actualNameL).innerText();
    const fullNameArray: any = fullName.split(' ');
    const actualFirstName = fullNameArray[0];
    const actualLastName = fullNameArray[1];
    const actualPhoneNumber = await page.locator(this.actualPhoneL).innerText();
    const actual = [
      actualEmail,
      actualFirstName,
      actualLastName,
      actualPhoneNumber,
    ];
    const expected = [
      expectedConfig.customer.Email,
      expectedConfig.customer.firstName,
      expectedConfig.customer.lastName,
      expectedConfig.customer.phoneNumber,
    ];
    const title = ['Email', 'FirstName', 'LastName', 'PhoneNumber'];
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        'profile',
        'customer-portal'
      );
    }
  }

  async verifyChangeEmail() {
    const subjectLine = 'Your email address has been updated';
    const email = expectedConfig.customer.Email;
    const functionName = 'Email change confirmation';
    await this.verifyEmail(subjectLine, email, functionName);
  }

  async verifyUpdatedEmail() {
    const subjectLine = 'Your email address has been updated';
    const email = expectedConfig.customer.Email;
    const functionName = 'Email updated confirmation';
    await this.verifyEmail(subjectLine, email, functionName);
  }

  async verifyPasswordResetEmail() {
    const subjectLine = 'Your password has been updated';
    const email = expectedConfig.customer.Email;
    const functionName = 'Password Reset Email';
    await this.verifyEmail(subjectLine, email, functionName);
  }

  async verifyEmail(subjectLine: any, email: any, functionName: any) {
    const page = await utility.openEmail(email, subjectLine);
    const emailIframe = await page.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    const value: any = await emailFrame?.textContent(this.usernameinEmail);
    const valueArray = value?.split(' ');
    const actual = await utility.removeComma(valueArray[1]);
    const expected = expectedConfig.customer.firstName;
    await utility.printValues('username', actual, functionName);
    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        'Username',
        functionName,
        expectedConfig.LocalEnv.applicationName
      );
    }
    await page.close();
  }

  async verifyMarketPlace() {
    await page.locator(this.marketPlace).click();

    const emailIframe = await page.waitForSelector('iframe');
    const emailFrame = await emailIframe.contentFrame();
    let heading: any = await emailFrame?.textContent(
      'text=For your next trip away, use PlanPay.'
    );
    heading = await heading.trim();
    let body: any = await emailFrame?.textContent(
      'text=Simply choose PlanPay when booking through one of our partners.'
    );
    body = await body.trim();

    const expected = [
      'For your next trip away, use PlanPay.',
      'Simply choose PlanPay when booking through one of our partners.',
    ];
    const actual = [heading, body];
    const title = ['title', 'body'];

    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        'Market Place',
        'Customer Portal'
      );
    } else {
      await utility.printValues(title, actual, 'Market Place');
    }
  }
}
