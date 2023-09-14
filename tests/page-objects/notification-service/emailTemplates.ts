import { Utilities } from '../utilities';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { config } from '../../setup/configurations/test-data-ts.conf';
import { mailinatorLogin } from './login';

const utility = new Utilities();
const mail_login = new mailinatorLogin();
export class EmailTemplates {
  firstName = '#name';
  description = '#description';
  merchantName = '#merchant_name';
  planId = '#planId';
  paidAmount = '#paid_amount';
  totalAmount = '#total_amount';
  planCreatedDate = '#plan_created_date';
  finalPaymentDate = '#final_payment_date';
  cancellationDate = '#cancellation_date';
  nonRefundedAmount = '#non-refunded_amount';
  refundedAmount = '#refunded_amount';
  cancellationReason = '#cancellation_reason';
  nextPaymentDate = '#next_payment_date';
  nextPaymentAmount = '#next_payment_amount';
  payAdvanceTotal =
    'body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > p:nth-child(1)';

  instalmentsLeft = '#number_of_instalments_left';
  instalmentAmount = '#next_payment_amount';
  cadence = '#cadence';
  nextInstalmentDate = '#next_payment_date';

  // lastInstalment = '#last_instalment';

  async verifyEmailTemplates(
    email: any,
    emailSubject: any,
    template: any,
    flag: any
  ) {
    console.log('%%%%%%%%%% Email Template => ' + template + '  %%%%%%%%%');

    console.log('%%%%%%%%%% Email Subject => ' + emailSubject + ' %%%%%%%%%');

    await utility.delay(1000);

    if (
      template == 'PlanCreatedSendMerchantNotification' ||
      template == 'PlanCompletedSendMerchantNotification'
    ) {
      await mail_login.mailinatorlogin();
    }

    await utility.delay(30000);
    const Arrflag: boolean = Array.isArray(emailSubject);
    // console.log('WABA DUBA DADA', Arrflag);

    //const finalMail = emailSubject.pop();
    let subject;
    console.log('FLAG IS', flag);
    if (Arrflag === true) {
      subject = emailSubject.pop();
    } else {
      subject = emailSubject;
    }

    // console.log('WABA DUBA DADA', subject);

    const page1 = await utility.openEmail(email, subject);
    const emailIframe = await page1.waitForSelector('#html_msg_body');
    const emailFrame = await emailIframe.contentFrame();
    //------- Get Order ID  -------------
    const data = await utility.commonJsonReadFunc('expectedFile');

    // const data = await utility.readExpectedValue();

    if (template == 'PlanCancelledSendCustomerNotification') {
      const cancellationDateText = await emailFrame?.textContent(
        this.cancellationDate
      );
      const nonRefundedAmountText = await emailFrame?.textContent(
        this.nonRefundedAmount
      );
      const refundedAmountText = await emailFrame?.textContent(
        this.refundedAmount
      );
      const cancellationReasonText = await emailFrame?.textContent(
        this.cancellationReason
      );

      const titleCancel: any = [
        'Cancellation date',
        'Non-refundable amount',
        'You will receive',
        'cancellation Reason',
      ];

      const actualCancel: any = [
        await utility.formatDate(cancellationDateText),
        await utility.upto2Decimal(
          await utility.convertPricewithFraction(nonRefundedAmountText)
        ),
        await utility.upto2Decimal(
          await utility.convertPricewithFraction(refundedAmountText)
        ),
        cancellationReasonText,
      ];

      const expectedCancel = [
        data.cancellationDetails.planCancellationDate,
        await utility.upto2Decimal(
          data.cancellationDetails.actualNonRefundableAmount
        ),
        await utility.upto2Decimal(
          data.cancellationDetails.ActualRefundAmountUI
        ),
        data.cancellationDetails.reason,
      ];

      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actualCancel,
          expectedCancel,
          titleCancel,
          template,
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        await utility.printExpectedandAcctualValues(
          titleCancel,
          actualCancel,
          expectedCancel,
          template
        );
      }
      await page1.close();
    } else {
      let nextPaymentDateText;
      let nextPaymentAmountText;
      let nextPayAdvanceTotal;

      let instalmentsLeftText;
      let instalmentAmountText;
      let nextInstalmentDateText;
      let finalPaymentDateText;

      const firstNameText = await emailFrame?.textContent(this.firstName);
      const descriptionText = await emailFrame?.textContent(this.description);
      const merchantNameText = await emailFrame?.textContent(this.merchantName);
      const paidAmountText = await emailFrame?.textContent(this.paidAmount);
      const totalAmountText = await emailFrame?.textContent(this.totalAmount);
      const planIdText: string = await emailFrame?.textContent(this.planId);

      if (
        template == 'CustomerAdvancePaymentSucceededSendCustomerNotification'
      ) {
        nextPaymentDateText = await emailFrame?.textContent(
          this.nextPaymentDate
        );
        nextPaymentAmountText = await emailFrame?.textContent(
          this.nextPaymentAmount
        );
        nextPayAdvanceTotal = await emailFrame?.textContent(
          this.payAdvanceTotal
        );
      }

      if (template == 'CustomerPlanChangedSendCustomerNotification') {
        const instalmentsLeftText = await emailFrame?.textContent(
          this.instalmentsLeft
        );
        console.log('instalmentsLeftText', instalmentsLeftText);

        instalmentAmountText = await emailFrame?.textContent(
          this.instalmentAmount
        );

        nextInstalmentDateText = await emailFrame?.textContent(
          this.nextInstalmentDate
        );

        finalPaymentDateText = await emailFrame?.textContent(
          this.finalPaymentDate
        );
      }

      console.log('First Name  => ', firstNameText);
      console.log('Description => ', descriptionText);
      console.log('Merchant name => ', merchantNameText);
      console.log('PlanID => ', planIdText);
      console.log('Paid so far=>', paidAmountText);
      console.log('Total of your plan=>', totalAmountText);

      const paidAmountTextBreak = paidAmountText.split(' ');
      const totalAmount = await utility.convertPricewithFraction(
        totalAmountText
      );

      if (template == 'PlanCancelledSendCustomerNotification') {
        if (await page1.locator('#html_msg_body').isVisible()) {
          console.log('Cancellation email received successfully');
        } else {
          console.log('Cancellation email is not received');
        }
      }
      console.log(' \u001b[1;33m Plan ID is ==> \x1b[37m ', planIdText);
      expectedConfig.planSummary.planID = planIdText;

      const title: any = [
        'PlanID',
        'Currency',
        'Merchant name',
        'Paid so far',
        'Total of your plan',
      ];
      const actual: any = [
        planIdText,
        paidAmountTextBreak[1],
        merchantNameText,
        await utility.upto2Decimal(
          await utility.convertPricewithFraction(paidAmountTextBreak[0])
        ),
        totalAmount,
      ];
      const expected = [
        data.planSummary.planID,
        data.planSummary.checkoutCurrency,
        data.LocalEnv.merchantName,
        await utility.upto2Decimal(data.planSummary.totalFunds),
        await utility.upto2Decimal(data.planSummary.totalCost),
      ];

      if (
        template == 'PlanCreatedSendCustomerNotification' ||
        template == 'PlanCompletedSendCustomerNotification' ||
        template == 'CustomerPaymentSucceededSendCustomerNotification' ||
        template == 'CustomerPaymentFailedSendCustomerNotification'
      ) {
        title.push('Customer Name');
        actual.push(firstNameText);
        expected.push(data.customer.firstName);
      }

      if (
        template == 'PlanCreatedSendCustomerNotification' ||
        template == 'PlanCompletedSendCustomerNotification' ||
        template == 'PlanCreatedSendMerchantNotification' ||
        template == 'PlanCompletedSendMerchantNotification'
      ) {
        const planCreatedDateText = await emailFrame?.textContent(
          this.planCreatedDate
        );

        console.log('Plan created at=>', planCreatedDateText);

        title.push('Plan Created at');
        actual.push(await utility.formatDate(planCreatedDateText));
        expected.push(data.planSummary.planDate);
      }

      if (
        template == 'CustomerAdvancePaymentSucceededSendCustomerNotification'
      ) {
        title.push('Next payment date');
        actual.push(await utility.formatDate(nextPaymentDateText));
        expected.push(data.UpcomingPayments[0].date);

        title.push('Next payment amount');
        actual.push(
          await utility.convertPricewithFraction(nextPaymentAmountText)
        );
        expected.push(data.UpcomingPayments[0].amount);

        const lastInstallmentPaidAmount =
          data.paidPayments[data.paidPayments.length - 1].amount;
        const lastInstallmentPaidAmountUi =
          await utility.convertPricewithFraction(nextPayAdvanceTotal);
        title.push('Total Paid amount in this installment');
        actual.push(lastInstallmentPaidAmountUi.slice(0, -1));
        expected.push(lastInstallmentPaidAmount);
      }

      if (template == 'CustomerPlanChangedSendCustomerNotification') {
        title.push('Instalments Left');
        actual.push(instalmentsLeftText);
        expected.push(data.planSummary.noOfInstallmentsToBePaid);

        title.push('Next Payment Amount');
        actual.push(
          await utility.upto2Decimal(
            await utility.convertPricewithFraction(instalmentAmountText)
          )
        );
        expected.push(
          await utility.upto2Decimal(data.UpcomingPayments[0].amount)
        );

        title.push('Next Payment Date');
        actual.push(await utility.formatDate(nextInstalmentDateText));
        expected.push(data.UpcomingPayments[0].date);

        title.push('Final Payment Date');
        actual.push(await utility.formatDate(finalPaymentDateText));
        expected.push(
          data.UpcomingPayments[data.UpcomingPayments.length - 1].date
        );
      }

      if (config.LocalEnv.verifyFlag == 'true') {
        await utility.matchValues(
          actual,
          expected,
          title,
          template,
          expectedConfig.LocalEnv.applicationName
        );
      } else {
        await utility.printExpectedandAcctualValues(
          title,
          actual,
          expected,
          template
        );
      }
      await page1.close();
      return planIdText;
    }
  }
}
