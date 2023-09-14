import { expect, Browser } from '@playwright/test';
import { Utilities } from '../utilities';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { SignUpCode } from '../notification-service/signUpCode-ts';
import { page } from '../../features/support/hooks';
import { WelcomeEmail } from '../notification-service/welcomeEmail';
import { mailinatorLogin } from '../notification-service/login';
import { databaseConnectDisconnect } from '../backend-configuration/database-connect-disconnect';
const dbconnection = new databaseConnectDisconnect();
const signupcode = new SignUpCode();
const utility = new Utilities();
const welcome = new WelcomeEmail();
const ml_login = new mailinatorLogin();

export class SignupPage {
  // readonly page: Page; //readonly prevents assignments outside the constructor
  readonly browser: Browser;
  // signupButtonL = '#signup';
  signupButtonL = '[data-planpay-test-id="createaccount"]';
  firstNameL = '//input[@data-planpay-test-id="first_name"]';
  lastNameL = '//input[@data-planpay-test-id="last_name"]';
  emailL = '//input[@data-planpay-test-id="email"]';
  phoneNumberL = '//input[@data-planpay-test-id="phone_number"]';
  setPasswordL = "//input[@name='password']"; //id not unique
  conPasswordL = '//input[@data-planpay-test-id="confirm_password"]';
  nextButtonL = '//button[@data-planpay-test-id="createaccountsubmit"]';
  myemailAddress = '';
  welcomeEmailL = 'Welcome to PlanPay, please verify your email address';
  box1L = '#pin_0';
  box2L = '#pin_1';
  box3L = '#pin_2';
  box4L = '#pin_3';
  box5L = '#pin_4';
  box6L = '#pin_5';
  isAgreePolicy = "//input[@name='isAgreePolicy']";
  isAgreeUpdate = "//input[@name='isAgreeUpdate']";
  nextButtonOnVerification =
    '//button[@data-planpay-test-id="validateaccount"]';
  nameCardL = "//input[@name='cardHolderName']";
  cardNumberL = "//input[@placeholder='Card number']";
  monthL = "//input[@placeholder='MM / YY']";
  cvcL = "//input[@placeholder='CVC']";
  billingAddressL = '#billing_address';
  suburbL = '#suburb';
  stateL = '#state';
  postCodeL = '#postcode';
  gotoDashboard = 'text="LET’S GET STARTED"';
  updateL = '//span[normalize-space()="UPDATE"]';
  nextButton2L = '//button[@id="continue_payment"]';
  subjectLine = 'Your PlanPay account is ready to go';
  existingEmail = "//div[@class='MuiStack-root css-1xhj18k']";
  //"//label[text()='Email']/following-sibling::p";
  resendEmail = "//span[@data-planpay-test-id='resendverificationcode']";
  formL = "//div[@class='MuiBox-root css-10wvky3']";
  addNewMethodButton = "//button[@data-planpay-test-id='addpaymentmethod']";

  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async signupOperation(
    password: any,
    validationScreens: any,
    isSubscribed: any
  ) {
    const commonDetails = await utility.readCustomerDetails();
    await this.clickOnSignup(); //visit signup page
    const myEmail = await this.enterUserDetails(password); //enter basic user details with dynamic data.
    console.log("Your's email address is: ", this.myemailAddress);
    console.log('\u001b[1;33mProcessing for user PIN Veritication!...');
    await ml_login.mailinatorlogin();
    let myCode = await signupcode.openEmail(myEmail, this.welcomeEmailL);
    let i = 0;
    do {
      if (myCode === 'resend') {
        await page.locator(this.resendEmail).click();
        myCode = await signupcode.openEmail(myEmail, this.welcomeEmailL);
      }
      i++;
    } while (i < 2);

    console.log('\u001b[1;33mPin Verification Code is: ', myCode);
    await expect(myCode).not.toEqual('resend');
    await this.pinVerification(myCode, isSubscribed);
    expectedConfig.customer.userStatus = 'Active';
    const d = await new Date();
    let todayDate: any = await d.toLocaleString('en-GB');
    todayDate = await todayDate.split(',');
    expectedConfig.customer.accountCreated = todayDate[0];
    await this.delay(8000);

    if (Array.isArray(validationScreens)) {
      for (let i = 0; i < validationScreens.length; i++) {
        if (
          validationScreens[i] == 'AccountSetupSendWelcomeNotification' &&
          commonDetails.eventProcessorError == 'false'
        ) {
          await console.log("\u001b[1;33mLet's Verify Welcome email!...");
          await welcome.verifyWelcomeEmail(myEmail, this.subjectLine);
        }
      }
    } else {
      if (
        validationScreens == 'AccountSetupSendWelcomeNotification' &&
        commonDetails.eventProcessorError == 'false'
      ) {
        await console.log("\u001b[1;33mLet's Verify Welcome email!...");
        await welcome.verifyWelcomeEmail(myEmail, this.subjectLine);
      }
    }

    if ((await page.locator(this.gotoDashboard).isVisible()) === true) {
      await page.waitForSelector(this.gotoDashboard);
      await page.click(this.gotoDashboard);
    }
    expectedConfig.customer.Email = myEmail;
    commonDetails.customer.firstName = expectedConfig.customer.firstName;
    commonDetails.customer.lastName = expectedConfig.customer.lastName;
    commonDetails.isResetFlag = 'false';
    commonDetails.planCreated = 'false';
    commonDetails.eventProcessorError = 'false';
    commonDetails.customer = expectedConfig.customer;
    await utility.writeIntoJsonFile(
      'common-details',
      commonDetails,
      'expected'
    );
    return myEmail;
  }

  async clickOnSignup() {
    await this.delay(3000);
    await page.waitForSelector(this.signupButtonL);
    await page.click(this.signupButtonL);
    // putting some artificial delay
  }

  async generateEmail() {
    const rNum = await utility.enterRandomNumber(4);
    return (await config.customer.Email) + rNum + config.LocalEnv.signUpDomain;
  }

  async enterUserDetails(password: any) {
    const fname =
      (await config.customer.firstName) + (await utility.enterRandomtext(4));
    const lname =
      (await config.customer.lastName) + (await utility.enterRandomtext(4));
    this.myemailAddress = await this.generateEmail();
    await dbconnection.verifyEmailExist(this.myemailAddress);
    await page.fill(this.firstNameL, fname);
    await page.fill(this.lastNameL, lname);
    await page.fill(this.emailL, this.myemailAddress);
    await page.fill(this.phoneNumberL, config.customer.phoneNumber);
    await page.fill(this.setPasswordL, password);
    await page.fill(this.conPasswordL, password);
    await page.click(this.nextButtonL);

    while (expectedConfig.flags.userExists == 'true') {
      this.myemailAddress = await this.generateEmail();
      await page.fill(this.emailL, this.myemailAddress);
      await page.click(this.nextButtonL);
      await utility.delay(3000);
      await dbconnection.verifyEmailExist(this.myemailAddress);
    }

    const testCaseErrCheck = await utility.checkForError();
    console.log('Error checking!... ');
    if (testCaseErrCheck == 'fail') {
      await expect(testCaseErrCheck).toEqual('pass');
    }
    expectedConfig.customer.firstName = fname;
    expectedConfig.customer.lastName = lname;
    expectedConfig.customer.Email = this.myemailAddress;
    expectedConfig.customer.phoneNumber = config.customer.phoneNumber;
    // putting some artificial delay
    await this.delay(3000);
    return this.myemailAddress;
  }

  async enterBillingDetails(
    cardStatus: any,
    cardType: any,
    dashboardFlag: any,
    signUpMessage: any
  ) {
    console.log(
      '---------------- Adding Billing Details ---------------------' + '\n'
    );
    console.log('cardStatus', cardStatus);
    console.log('cardType', cardType);

    console.log(
      'expectedConfig.planSummary.paymentPlatform_vendor',
      expectedConfig.planSummary.paymentPlatform_vendor
    );
    let status = 'pass';
    const cardNumber: any =
      config.testCards[expectedConfig.planSummary.paymentPlatform_vendor][
        cardStatus
      ][cardType].cardnumber;

    const month = await config.testCards[
      expectedConfig.planSummary.paymentPlatform_vendor
    ][cardStatus][cardType].Expiry.toString();

    const cvc: any =
      config.testCards[expectedConfig.planSummary.paymentPlatform_vendor][
        cardStatus
      ][cardType].CVC;

    const nameOnCard: any = expectedConfig.customer.lastName;
    await utility.delay(3000);

    if (expectedConfig.planSummary.paymentPlatform_vendor == 'Braintree') {
      if (
        (await page
          .frameLocator(
            'iframe[title="Secure Credit Card Frame - Credit Card Number"]'
          )
          .locator('#credit-card-number')
          .isVisible()) == true
      ) {
        status = 'pass';
        await page
          .frameLocator(
            'iframe[title="Secure Credit Card Frame - Credit Card Number"]'
          )
          .locator('#credit-card-number')
          .fill(cardNumber);
        await page
          .frameLocator(
            'iframe[title="Secure Credit Card Frame - Expiration Date"]'
          )
          .locator('#expiration')
          .fill(month);
        await page
          .frameLocator('iframe[title="Secure Credit Card Frame - CVV"]')
          .locator('#cvv')
          .fill(cvc);
      }
      // else {
      //   console.log('Payment Form not loaded');
      //   if ((await utility.checkForError()) == 'fail') {
      //     await page.locator("//button[@title='Close']").click();
      //   }
      //   await this.reloadForm(
      //     cardStatus,
      //     cardType,
      //     dashboardFlag,
      //     signUpMessage
      //   );
      // }
    } else if (expectedConfig.planSummary.paymentPlatform_vendor == 'Stripe') {
      if (
        (await page
          .frameLocator('iframe[title="Secure payment input frame"]')
          .locator('#Field-numberInput')
          .isVisible()) == true
      ) {
        status = 'pass';
        await page
          .frameLocator('iframe[title="Secure payment input frame"]')
          .locator('#Field-numberInput')
          .fill(cardNumber);
        await page
          .frameLocator('iframe[title="Secure payment input frame"]')
          .locator('#Field-expiryInput')
          .fill(month);
        await page
          .frameLocator('iframe[title="Secure payment input frame"]')
          .locator('#Field-cvcInput')
          .fill(cvc);
      }
      // else {
      //   // status = 'fail';
      //   console.log('Payment Form not loaded');
      //   if ((await utility.checkForError()) == 'fail') {
      //     await page.locator("//button[@title='Close']").click();
      //   }
      //   await this.reloadForm(
      //     cardStatus,
      //     cardType,
      //     dashboardFlag,
      //     signUpMessage
      //   );
      // }
    } else if (expectedConfig.planSummary.paymentPlatform_vendor == 'Adyen') {
      if (
        (await page
          .frameLocator('iframe[title="Iframe for card number"]')
          .locator('//input[@data-fieldtype="encryptedCardNumber"]')
          .isVisible()) == true
      ) {
        status = 'pass';
        await page
          .locator('.adyen-checkout__card__holderName__input')
          .fill(nameOnCard);
        await page
          .frameLocator('iframe[title="Iframe for card number"]')
          .locator('//input[@data-fieldtype="encryptedCardNumber"]')
          .fill(cardNumber);
        await page
          .frameLocator('iframe[title="Iframe for expiry date"]')
          .locator('//input[@data-fieldtype="encryptedExpiryDate"]')
          .fill(month);
        await page
          .frameLocator('iframe[title="Iframe for security code"]')
          .locator('//input[@data-fieldtype="encryptedSecurityCode"]')
          .fill(cvc);
      }
    } else {
      await page
        .locator('//input[@data-planpay-test-id="name-input"]')
        .fill(nameOnCard);

      await page
        .locator('//input[@data-planpay-test-id="number-input"]')
        .fill(cardNumber);

      await page
        .locator('//input[@data-planpay-test-id="expiry-input"]')
        .fill(month);
      await page
        .locator('//input[@data-planpay-test-id="cvc-input"]')
        .fill(cvc);
    }
    await expect(status).toEqual('pass');

    // }

    // const stripeIframe = await page.waitForSelector('iframe');
    // const stripeFrame: any = await stripeIframe.contentFrame();

    // const cardNumInput = await stripeFrame.waitForSelector(
    //   '#Field-numberInput'
    // );
    // const cardExpInput = await stripeFrame.waitForSelector(
    //   '#Field-expiryInput'
    // );
    // const cardCVCInput = await stripeFrame.waitForSelector('#Field-cvcInput');
    //filling the values.
    // await cardNumInput.fill(cardNumber);
    // await cardExpInput.fill(month);
    // await cardCVCInput.fill(cvc);
    const len = Number(cardNumber.length);
    if (len == 16) {
      expectedConfig.planSummary.paymentMethod = cardNumber.slice(12, 16);
    } else {
      expectedConfig.planSummary.paymentMethod = cardNumber.slice(11, 15);
    }
    if (
      (await page.locator("//span[normalize-space()='UPDATE']").isVisible()) ===
      true
    ) {
      await page.click(this.updateL);
    } else {
      // await page.waitForSelector(this.nextButton2L);
      // await page.click(this.nextButton2L);
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
    if (dashboardFlag === 'true') {
      console.log('within the dashboardflag function');
      await page.click(this.gotoDashboard); //moving to dashboard
    }
  }

  async pinVerification(myCode: any, isSubscribed: any) {
    await page.fill(this.box1L, myCode[0]); //filling the verification pin
    await page.fill(this.box2L, myCode[1]);
    await page.fill(this.box3L, myCode[2]);
    await page.fill(this.box4L, myCode[3]);
    await page.fill(this.box5L, myCode[4]);
    await page.fill(this.box6L, myCode[5]);
    await page.click(this.isAgreePolicy);
    if (isSubscribed === 'true') {
      await page.click(this.isAgreeUpdate);
    }
    await page.click(this.nextButtonOnVerification); //click on next button
    await console.log(
      '\u001b[1;32mUser registered Successfully!..\u001b[1;37m.'
    );
    if (
      (await page
        .locator(
          "//div[@class='MuiSnackbar-root MuiSnackbar-anchorOriginTopCenter css-16yg1ak']"
        )
        .isVisible()) === true
    ) {
      const msg = page
        .locator(
          "//div[@class='MuiSnackbar-root MuiSnackbar-anchorOriginTopCenter css-16yg1ak']"
        )
        .innerText();
      console.log('error msg on pin verification: ' + msg);
      await expect(msg).not.toEqual(
        'Not authorized to access requested resource'
      );
    }
  }

  async reloadForm(
    cardStatus: any,
    cardType: any,
    dashboardFlag: any,
    signUpMessage: any
  ) {
    // const backButton =
    //   "//svg[@class='MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-152bv5t']";
    // await page.locator(backButton).click();
    // await page
    //   .locator(
    //     "//html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/*[name()='svg'][1]/*[name()='rect'][1]"
    //   )
    //   .click({ force: true });
    await page
      .locator(
        "/html[1]/body[1]/div[1]/div[1]/div[2]/div[2]/div[1]/*[name()='svg'][1]/*[name()='g'][1]/*[name()='path'][1]"
      )
      .click({ force: true });
    await utility.delay(2000);
    await page.locator(this.addNewMethodButton).click();
    await utility.delay(2000);
    await this.enterBillingDetails(
      cardStatus,
      cardType,
      dashboardFlag,
      signUpMessage
    );
  }
}
