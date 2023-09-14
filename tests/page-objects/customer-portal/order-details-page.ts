import { Utilities } from '../utilities';
import { page } from '../../features/support/hooks';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { OrderUpcomingPaid } from './order-upcoming-paid-page';
import { expect } from '@playwright/test';
const utility = new Utilities();
const orderUpcomingPaid = new OrderUpcomingPaid();
export class OrderDetails {
  detailVerificationValue: any;
  actual_upcoming_details: any;
  actual_paid_details: any;

  row1Details = "//div[@class='MuiGrid-root MuiGrid-container css-29itl9']";
  Amount = '#paid_so_far';
  RemainingAmount = '#remaining_amount';
  dividerAmount = '#installments';
  rowInformation = "//div[@class='MuiStack-root css-1whbhet']";
  startDate = '#order_start_date';
  endDate = '#order_end_date';
  //Array Variables
  expectedInstallmentDetails_Array: any[];
  UpcomingValuesArray: any[];
  PaidValuesArray: any[];
  expectedOrderSum: any = [];
  expectedOrderDet: any = [];
  expectedInstallmentDetails_Array_Paid: any[];
  summaryVerificationValue = [
    'Merchant Name',
    'Order Amount',
    'Total Instalments',
  ];
  detailVerificationField = [
    'Total instalments',
    'Start Date',
    'End Date',
    'Product List',
    'Total Cost',
    'Instalment Frequency',
    'Merchant Name',
    'totalFunds',
    'Remaining',
  ];

  async orderDetails(viewOrderLocator: any) {
    console.log(
      '===================== On Order Details page ====================='
    );
    viewOrderLocator.click();
    this.detailVerificationValue = await this.printorderDetails();

    // if (config.LocalEnv.verifyFlag == 'true') {
    await this.verifyOrderDetails(this.detailVerificationValue);
    await this.getOrderIdFromUrl();
    // }
  }
  async printorderDetails() {
    // const productTitleArray = ['Product Name'];
    const row1Data = await page.locator(this.row1Details);
    //Verifying payment Details
    const detailVerificationValue = [];
    // const amountFeilds = await page.locator(this.Amount);
    await utility.delay(3000); // added delay because we are getting 0 in paidsofar.
    const paidSoFar = await page.locator(this.Amount).innerText();
    const remaining = await page.locator(this.RemainingAmount).innerText();
    //No. of installments split start
    const dividerData = await row1Data.locator(this.dividerAmount).innerText();
    const separatedAmount = await utility.splitData(dividerData);
    //no. of installments split end
    //Verifying Dates
    const startDateValue = await page.locator(this.startDate);
    const endDateValue = await page.locator(this.endDate);
    let firstDate: any = await startDateValue.innerText();
    let endDate: any = await endDateValue.innerText();
    firstDate = firstDate.replace('Starts', '');
    endDate = endDate.replace('Ends', '');
    //end dates
    console.log(
      'Total Funds = ' + (await utility.convertPricewithFraction(paidSoFar))
    );
    console.log(
      'Remianing Amount = ' +
        (await utility.convertPricewithFraction(remaining))
    );
    console.log('Installment paid = ' + separatedAmount[0]);
    console.log('Remaining installment = ' + separatedAmount[1]);
    console.log('Start Date = ' + (await utility.formatDate(firstDate)));
    console.log('Ends Date = ' + (await utility.formatDate(endDate)));

    //remaining amount assinging to array
    detailVerificationValue[0] = separatedAmount[1];
    const startSplit = await utility.splitData(
      await startDateValue.innerText()
    );
    detailVerificationValue[1] = startSplit[1];
    const endSplit = await utility.splitData(await endDateValue.innerText());
    detailVerificationValue[2] = endSplit[1];
    //Verifying order Information
    const rowInfo = await page.locator(this.rowInformation);
    console.log('rowInfo count=' + (await rowInfo.count()));
    for (let i = 0; i < (await rowInfo.count()); i++) {
      const rowData = await rowInfo.nth(i).innerText();
      const separatedDetails = await utility.splitData(rowData);
      console.log(separatedDetails[0] + ' = ' + separatedDetails[1]);
      if (i == 0) {
        detailVerificationValue[3] = separatedDetails[0];
        console.log('i = 0 && product list => ' + detailVerificationValue[3]);
      } else {
        detailVerificationValue[3 + i] = separatedDetails[1];
      }
    }

    // console.log('separatedDetails', detailVerificationValue)

    if (expectedConfig.planSummary.checkoutType !== 'assisted-checkout') {
      const productList = detailVerificationValue[3].split(',');
      const productCount = productList.length;
      console.log(
        '==============On Product Summary Printing======================='
      );
      console.log('Product Count =>', productCount);
      console.log('allProductsList', productList);

      for (let m = 0; m < productList.length; m++) {
        console.log(
          '////////////////////////         Product ',
          m + 1,
          '         //////////////////////////////'
        );
        console.log('Product Name ', productList[m]);
        // const Productactual = [productList[m].trim()];

        const expectedValues = await utility.callExpectedJson();
        const producItem = expectedValues.planDetails.producItem.split('$');
        console.log('producItem', producItem);
        const singleProduct = producItem.indexOf(productList[m].trim());
        console.log('singleProduct', singleProduct);
        const singleProductName = producItem[singleProduct];
        console.log('singleProductName', singleProductName);
        const Productexpected = [singleProductName];
        console.log('Productexpected', Productexpected);
        if (config.LocalEnv.verifyFlag === 'true') {
          // await utility.matchValues(
          //   Productactual,
          //   Productexpected,
          //   productTitleArray,
          //   'Product Summary',
          //   expectedConfig.LocalEnv.applicationName
          // );
        }
      }

      let finalString;
      if (Array.isArray(productList)) {
        for (let i = 0; i < productList.length; i++) {
          productList[i] = productList[i].trimStart();
          if (i != 0) {
            finalString = finalString + ',' + productList[i];
          } else {
            finalString = productList[i];
          }
        }
      } else {
        finalString = productList;
      }
      detailVerificationValue[3] = finalString;
    }

    detailVerificationValue[4] = await utility.convertPricewithFraction(
      detailVerificationValue[4]
    );
    detailVerificationValue[1] = await utility.formatDate(
      detailVerificationValue[1]
    );
    detailVerificationValue[2] = await utility.formatDate(
      detailVerificationValue[2]
    );

    // console.log('this.detailVerificationValue[6]: ', this.detailVerificationValue[6])
    // detailVerificationValue[6] = this.detailVerificationValue[6]

    detailVerificationValue[6] = await page
      .locator("//span[text()='Store']/following-sibling::span")
      .innerText();

    // utility.convertPricewithFraction(
    //   paidSoFar
    // );

    detailVerificationValue[7] = await utility.convertPricewithFraction(
      paidSoFar
    );
    detailVerificationValue[8] = await utility.convertPricewithFraction(
      remaining
    );

    detailVerificationValue[8] = await utility.convertPricewithFraction(
      detailVerificationValue[8]
    );

    //Calling the Printing Function
    if (expectedConfig.planSummary.planStatus == 'Completed') {
      console.log('Plan Status is:', expectedConfig.planSummary.planStatus);

      if (
        await page
          .locator(
            "//h5[contains(@class,'MuiTypography-root MuiTypography-h5')]"
          )
          .isVisible()
      ) {
        console.log('############Payment History############');
      }
    } else if (expectedConfig.planSummary.planStatus == 'Cancelled') {
      console.log('Plan Status is:', expectedConfig.planSummary.planStatus);
      if (
        await page
          .locator(
            "//h5[contains(@class,'MuiTypography-root MuiTypography-h5')]"
          )
          .isVisible()
      ) {
        console.log('############Payment History############');
      }
    } else {
      this.actual_upcoming_details =
        await orderUpcomingPaid.VerifyUpcomimngValues();
    }
    this.actual_paid_details = await orderUpcomingPaid.VerifyPaidDetails();
    return detailVerificationValue;
  }
  async verifyOrderDetails(detailVerificationValue: any) {
    const extractedData = await utility.callExpectedJson();

    console.log(
      '========= Verifying Order Details With Newly Placed Order Data ==========='
    );
    const selectedProducts = await extractedData.planDetails.producItem;
    const merchantName = await expectedConfig.LocalEnv.merchantName;
    let uiProducts = '';
    if (merchantName !== null) {
      console.log('Merchant name after converting ' + merchantName);
      if (expectedConfig.planSummary.checkoutType !== 'assisted-checkout') {
        uiProducts = await (
          await utility.getProductDesc(merchantName, selectedProducts)
        ).toString();
      } else {
        uiProducts = 'No products in assisted checkout';
      }

      console.log('Product description => ' + uiProducts);
    }
    /** ASSIGNING EXTRACTED VALUES  */
    this.expectedOrderDet[0] = extractedData.planSummary.totalNoOfInstallments;
    this.expectedOrderDet[1] = extractedData.planSummary.planDate;
    this.expectedOrderDet[2] = extractedData.planSummary.lastPaymentDate;
    this.expectedOrderDet[3] = uiProducts;
    this.expectedOrderDet[4] = await utility.upto2Decimal(
      extractedData.planSummary.totalCost
    );
    // console.log(
    //   'expected.LocalEnv.merchantName ' + expectedConfig.LocalEnv.merchantName
    // );

    if (extractedData.planSummary.installmentPeriod == 'Monthly') {
      this.expectedOrderDet[5] =
        extractedData.planSummary.installmentPeriod +
        ' on ' +
        (await utility.ordinal_suffix_of(
          Number(extractedData.planSummary.InstallmentDay)
        ));
    } else {
      this.expectedOrderDet[5] =
        extractedData.planSummary.installmentPeriod +
        ' on ' +
        extractedData.planSummary.InstallmentDay +
        's';
    }
    if (expectedConfig.merchantDetails.checkoutCategory == 'merchant') {
      this.expectedOrderDet[6] = extractedData.merchantDetails.merchantName;
    } else {
      this.expectedOrderDet[6] = extractedData.merchantDetails.sub_merchantName;
    }

    this.expectedOrderDet[7] = extractedData.planSummary.totalFunds;
    if (extractedData.flags.cancelPlanFlag === 'true') {
      this.expectedOrderDet[8] = '0.00';
    }
    if (extractedData.flags.cancelPlanFlag === 'false') {
      this.expectedOrderDet[8] = extractedData.planSummary.remainingAmount;
    }

    // console.log('detailVerificationField', this.detailVerificationField)
    // console.log('detailVerificationValue', this.detailVerificationValue)

    /** VERIFYING EXTRACTED DETAILS WITH LATEST ORDER DETAILS */
    const title: any = [
      this.detailVerificationField[0],
      this.detailVerificationField[1],
      this.detailVerificationField[2],
      this.detailVerificationField[4],
      this.detailVerificationField[5],
      this.detailVerificationField[6],
      this.detailVerificationField[7],
      this.detailVerificationField[8],
    ];
    const actual: any = [
      detailVerificationValue[0],
      detailVerificationValue[1],
      detailVerificationValue[2],
      detailVerificationValue[4],
      detailVerificationValue[5],
      detailVerificationValue[6],
      detailVerificationValue[7],
      detailVerificationValue[8],
    ];
    const expected: any = [
      this.expectedOrderDet[0],
      this.expectedOrderDet[1],
      this.expectedOrderDet[2],
      this.expectedOrderDet[4],
      this.expectedOrderDet[5],
      this.expectedOrderDet[6],
      this.expectedOrderDet[7],
      this.expectedOrderDet[8],
    ];
    console.log('Date:', new Date(detailVerificationValue[2]));
    // completionDate
    let lastPaymentDate = detailVerificationValue[2];
    lastPaymentDate = lastPaymentDate.split('/');
    const lyear = lastPaymentDate[2];
    const lmonth = lastPaymentDate[1];
    const lday = lastPaymentDate[0];
    lastPaymentDate = await new Date(lyear + '-' + lmonth + '-' + lday);
    const completionDate = extractedData.planSummary.completionDate.split('/');
    const year = completionDate[2];
    const month = completionDate[1];
    const day = completionDate[0];
    const compDate = await new Date(year + '-' + month + '-' + day);
    console.log('CompletionDate:', new Date(compDate));
    await expect(lastPaymentDate <= compDate).toBeTruthy();
    console.log('\x1b[33m Final Payment date is <= Completion date \x1b[37m');

    // console.log('Testing!..')
    // console.log('Actual:  ', actual)
    // console.log('Expected:  ', expected)
    // console.log('Title:  ', title)

    if (config.LocalEnv.verifyFlag == 'true') {
      await utility.matchValues(
        actual,
        expected,
        title,
        'Order Details',
        expectedConfig.LocalEnv.applicationName
      );
    }

    if (expectedConfig.planSummary.planStatus != 'Cancelled') {
      await orderUpcomingPaid.VerifyUpcomimngValues();
    }
    await orderUpcomingPaid.VerifyPaidDetails();
  }

  async getOrderIdFromUrl() {
    const url = await page.url();
    const separatedUrl = await utility.splitUrl(url);
    // console.log("extracted URL ==>>" + url);
    const savedUrl = expectedConfig.planSummary.planID;
    const urlplanID = await separatedUrl[separatedUrl.length - 1];
    console.log('extracted Plan Id from UI==> ' + urlplanID);
    console.log('extracted Plan Id from config==> ' + savedUrl);
    // await expect(urlPlanId).toEqual(savedUrl);
  }
}
