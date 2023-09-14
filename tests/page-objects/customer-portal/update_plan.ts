import { Utilities } from '../utilities';
import { expect } from '@playwright/test';
import { page } from '../../features/support/hooks';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { calculations } from '../merchant-checkout/calculations';
import { PayWithPlanPay } from '../merchant-checkout/pay-with-planpay-page';
import { ScreensValidation } from '../merchant-checkout/screens_validation';
import { config } from '../../setup/configurations/test-data-ts.conf';
const screenvalidation = new ScreensValidation();
const utility = new Utilities();
const calculation = new calculations();
const pay = new PayWithPlanPay();
export class UpdatePlan {
  editButton = '[data-planpay-test-id="update-instalments"]';
  nextButton = '[data-planpay-test-id="Next"]';
  Monthly_locator = '#monthly';
  Fortnightly_locator = '#fortnightly';
  Weekly_locator = '#weekly';
  cadence_day_locator = '[data-planpay-test-id="cadence_day"]';
  // '//div[@data-planpay-test-id="cadence_day"]/input';
  plan_recap = '#plan_recap';
  plan_restarts = '#plan_restarts';
  plan_restart_date = '#plan_restart_date';
  instalment_amount = '#instalment_amount';
  instalment_value = '#instalment_value';
  instalments_left = '#instalments_left';
  no_of_instalments_left = '#no_of_instalments_left';
  payments_ends = '#payments_ends';
  payment_end_date = '#payment_end_date';
  confirmButton = '[data-planpay-test-id="Confirm"]';
  doneButton = '[data-planpay-test-id="Done"]';
  planRecapAmount = "//p[@id='plan_recap']//strong[1]";
  planRecapDay = "//p[@id='plan_recap']//strong[2]";
  nextInstDate = '#next_inst_date';
  nextInstAmount = '#amount';
  nextInst = '#next_inst';
  jsonPath = '';
  recapTxt = '#plan_recap';

  async updatePlan(
    cadenceOption: string,
    InstalmentDay: string,
    screens: string
  ) {
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    const expectedJsonpath =
      'expected/' + expectedConfig.planSummary.checkoutType + '/' + merchant;
    this.jsonPath = expectedJsonpath;

    await page
      .locator("//div[@id='" + expectedConfig.planSummary.planID + "']")
      .click();
    //click on updateplan button
    await page.locator(this.editButton).click();
    await utility.delay(2000);
    if (screens.includes('update-plan-overview')) {
      await this.validateScreens(
        'update-plan-overview',
        expectedConfig.planSummary.cadenceRecap,
        expectedConfig.planSummary.InstallmentDayRecap
      );
    }
    await this.PlanRecalculate(cadenceOption, InstalmentDay);
    if (expectedConfig.flags.updateCadenceblocked == 'true') {
      const expectedJson = await utility.commonJsonReadFunc('expectedFile');
      expectedJson.flags.updateCadenceblocked = 'true';
      await utility.writeIntoJsonFile(
        'expected-values',
        expectedJson,
        this.jsonPath
      );
    } else {
      if (screens.includes('update-plan-recap')) {
        await utility.delay(3000);
        await this.validateScreens(
          'update-plan-recap',
          cadenceOption,
          InstalmentDay
        );
      }
      await page.locator(this.confirmButton).click();
      await utility.delay(2000);
      if (screens.includes('plan_updated')) {
        await this.validateScreens(
          'plan_updated',
          cadenceOption,
          InstalmentDay
        );
      }
      await page.locator(this.doneButton).click();
      await utility.writeIntoJsonFile(
        'expected-values',
        expectedConfig,
        this.jsonPath
      );
    }
  }

  async PlanRecalculate(cadenceOption: string, InstalmentDay: string) {
    expectedConfig.LocalEnv.installmentType = cadenceOption;
    expectedConfig.planSummary.operationType = 'updatePlan';
    if (
      expectedConfig.planSummary.InstallmentDayRecap == InstalmentDay &&
      expectedConfig.planSummary.cadenceRecap == cadenceOption
    ) {
      const Buttonlocator = await page.locator(this.nextButton);
      await expect(Buttonlocator).toBeDisabled();
      expectedConfig.flags.updateCadenceblocked = 'true';
      console.log(
        '\x1b[33m Next Button is Disabled as Options are Same as already Selected Options \x1b[37m'
      );
    } else {
      await pay.selectionInstallationType(
        cadenceOption,
        'selected',
        'updatePlan'
      );
      await pay.selectInstallmentDay(cadenceOption, InstalmentDay);
      await calculation.calculateInstalmentAmount();
      await calculation.checkSpecialRule(cadenceOption, InstalmentDay); //check if special rule applies(if user has selected some other instalment day)
      if (expectedConfig.flags.blockedCheckout == 'false') {
        await calculation.calculateRemainder();
        await calculation.calculatenoOfInstallmentsToBePaid();
      }
      await screenvalidation.checkCadence('updateCadence');

      if (expectedConfig.flags.updateCadenceblocked == 'true') {
        console.log(
          '\x1b[33m Unfortunately, ' +
            cadenceOption +
            ' frequency is not available with your current plan.. \x1b[37m'
        );
      } else {
        await page.locator(this.nextButton).click();
        await utility.delay(3000);
      }
    }
  }
  async validateScreens(
    validationScreen: string,
    cadenceOption: string,
    InstalmentDay: string
  ) {
    let expectedRestartdate: any = expectedConfig.UpcomingPayments[0].date; //await utility.changeDateFormat(
    // );
    if (validationScreen == 'update-plan-overview') {
      let cadenceDay = await page.locator(this.cadence_day_locator).innerText();
      cadenceDay = await cadenceDay.replace('Process payment on', '');
      cadenceDay = await cadenceDay.replace(/[\r\n]/gm, '');
      let cadence_day = InstalmentDay;
      if (cadenceOption == 'Monthly') {
        console.log('cadenceDay ', cadenceDay);
        cadenceDay = await cadenceDay.replace(/\D/g, '');
      } else {
        cadence_day = (await InstalmentDay) + 's';
      }
      if (config.LocalEnv.verifyFlag == 'true') {
        switch (cadenceOption) {
          case 'Monthly':
            await expect(page.locator(this.Monthly_locator)).toBeChecked();
            break;
          case 'Fortnightly':
            await expect(page.locator(this.Fortnightly_locator)).toBeChecked();
            break;
          case 'Weekly':
            await expect(page.locator(this.Weekly_locator)).toBeChecked();
            break;
        }

        await expect(cadenceDay).toEqual(cadence_day);
      }
    }
    if (validationScreen == 'update-plan-recap') {
      console.log('update-plan-recap screen ');
      const recapText = await page.locator(this.recapTxt).innerText();
      let InstallmentDayRecap = expectedConfig.planSummary.InstallmentDayRecap;
      //actual values
      const planRecapAmount = await page
        .locator(this.planRecapAmount)
        .innerText();
      let planRecapDay = await page.locator(this.planRecapDay).innerText();
      const paymentRestartDate = await page
        .locator(this.plan_restart_date)
        .innerText();
      if (expectedConfig.planSummary.cadenceRecap == 'Monthly') {
        planRecapDay = await planRecapDay.replace(/\D/g, '');
      } else {
        if ((await recapText.includes('every')) == false) {
          InstallmentDayRecap = InstallmentDayRecap + 's';
        }
      }
      let instalmentAmount = await page
        .locator(this.instalment_value)
        .innerText();
      instalmentAmount = await instalmentAmount.replace(/\s/g, ''); //space removed
      const instalmentsLeft = await page
        .locator(this.no_of_instalments_left)
        .innerText();
      const paymentEndDate = await page
        .locator(this.payment_end_date)
        .innerText();

      //expectedvalues
      expectedRestartdate = expectedConfig.UpcomingPayments[0].date; //await utility.changeDateFormat(
      // );

      let expectedInstalmentsLeft = String(
        expectedConfig.UpcomingPayments.length
      );
      expectedInstalmentsLeft = expectedInstalmentsLeft + ' x ' + cadenceOption;
      //payment end date
      const expectedEndDate = //await utility.formatDate(
        expectedConfig.UpcomingPayments[
          expectedConfig.UpcomingPayments.length - 1
        ].date;
      // );

      const expected = [
        expectedConfig.planSummary.currencySymbol +
          (await expectedConfig.planSummary.installmentAmountRecap.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ','
          )),
        // +
        // ' ' +
        // expectedConfig.planSummary.checkoutCurrency
        InstallmentDayRecap,
        expectedRestartdate,
        expectedConfig.planSummary.currencySymbol +
          (await expectedConfig.planSummary.installmentAmount.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ','
          )), //+
        // expectedConfig.planSummary.checkoutCurrency
        expectedInstalmentsLeft,
        expectedEndDate,
      ];
      const actual = [
        planRecapAmount.replace(/[A-Za-z]/g, ''),
        planRecapDay,
        await utility.formatDate(paymentRestartDate),
        instalmentAmount.replace(/[A-Za-z]/g, ''),
        instalmentsLeft,
        await utility.formatDate(paymentEndDate),
      ];
      const Title = [
        'planRecap Amount',
        'planRecap Day',
        'Payment Restart Date',
        'Instalment Amount',
        'Instalments Left',
        'Payment Ends ',
      ];
      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actual,
          expected,
          Title,
          'Update Plan',
          'Recap Screens'
        );
      }
    }
    if (validationScreen == 'plan_updated') {
      const expected = [
        expectedRestartdate,
        expectedRestartdate,
        expectedConfig.planSummary.currencySymbol +
          (await expectedConfig.planSummary.installmentAmount.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ','
          )), //+
        // expectedConfig.planSummary.checkoutCurrency
      ];
      const nextInstDate = await page.locator(this.nextInstDate).innerText();
      const nextInst = await page.locator(this.nextInst).innerText();
      let nextInstAmount = await page.locator(this.nextInstAmount).innerText();
      nextInstAmount = await nextInstAmount.replace(/\s/g, '');
      const actual = [
        await utility.formatDate(nextInstDate),
        await utility.formatDate(nextInst),
        await nextInstAmount.replace(/[A-Za-z]/g, ''),
      ];
      const Title = [
        'Next Instalment Date',
        'Next Instalment',
        'Next Instalment Amount',
      ];
      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actual,
          expected,
          Title,
          'Update Plan',
          'Plan Updated'
        );
      }
    }
  }
}
