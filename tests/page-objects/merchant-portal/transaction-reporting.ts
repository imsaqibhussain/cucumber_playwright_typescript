import { Utilities } from '../utilities';
import { config } from '../.././setup/configurations/test-data-ts.conf';
import { page } from '../../features/support/hooks';
import { calculations } from '../merchant-checkout/calculations';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import { readFileSync } from 'fs';

const utility = new Utilities();
const calculation = new calculations();

export class ReportPage {
  runReportLinkL = "//p[@id='run_report']";
  selectDropdownL = "//div[@id='select_report']";
  selectMonthL = 'text=';
  downloadCSVL = "//button[@id='download']";

  async printValues(title: any, value: any) {
    for (let x = 0; x < value.length; x++) {
      console.log('column ' + x + ': ' + title[x] + ' => ' + value[x]);
    }
  }

  async downloadfileAndSave(transactionMonth: any) {
    const [download] = await Promise.all([
      // Start waiting for the download
      page.waitForEvent('download'),
      // Perform the action that initiates download
      page.locator(this.downloadCSVL).click(),
    ]);
    const testCaseErrCheck = await utility.checkForError();
    if (testCaseErrCheck == 'fail') {
      await expect(testCaseErrCheck).toEqual('pass');
    }
    // Wait for the download process to complete & Save downloaded file somewhere
    await download.saveAs(
      'tests/setup/actual/downloaded-reports/' +
        expectedConfig.LocalEnv.merchantName +
        '_' +
        transactionMonth +
        '.xls'
    );
    return await readFileSync(
      'tests/setup/actual/downloaded-reports/' +
        expectedConfig.LocalEnv.merchantName +
        '_' +
        transactionMonth +
        '.xls',
      'utf8'
    );
  }

  async writeFile(expectedData: any) {
    await fs.writeFile(
      'tests/setup/expected/customer-checkout/expected-values.json',
      JSON.stringify(expectedData),
      (err: any) => {
        if (err) console.log('Error writing file:', err);
      }
    );
  }

  async downloadReport(transactionMonth: any, reportFormat: any) {
    console.log(reportFormat);
    await page.waitForSelector(this.runReportLinkL);
    await page.click(this.runReportLinkL);
    await page.waitForSelector(this.selectDropdownL);
    await page.click(this.selectDropdownL);
    const month = this.selectMonthL + transactionMonth;
    await page.click(month);
    //download & save
    const extractedData: any = await this.downloadfileAndSave(transactionMonth);
    const excelDataArray: any = extractedData.split('\n');
    const excelTitleArray = excelDataArray[4].split(',');
    let actualArray: any = [];
    let PlanDate: any = [];
    const expectedData = await utility.callExpectedJson();
    const totalrecords = excelDataArray.length - 5;
    console.log('Total no. of records in file are: ', totalrecords);

    if (totalrecords > 0) {
      for (let i = 5; i <= excelDataArray.length; i++) {
        const myFlag = await excelDataArray[i]?.includes(
          // '6371aabcfacb24caee2d11c7'
          expectedData.planSummary.planID
        ); //giving plan ID
        if (myFlag) {
          actualArray = excelDataArray[i].split(',');
          //printing the values.
          await this.printValues(excelTitleArray, actualArray);
          console.log(
            'application name' + expectedConfig.LocalEnv.applicationName
          );
          //matching values from expected JSON
          const title = [
            'Plan Date',
            'Plan ID',
            'Plan Total',
            'Paid so Far',
            'Total number of Instalments',
            'Number of instalment Paid',
            'Last 4 Digits',
            'Merchant Fee Exclusive Tax',
            'Merchant Fee Tax',
            'Merchant Fee inclusive Tax',
          ];

          const settlementAmount = actualArray[7].replace(/[^0-9.]/g, '');
          //MerchantFeeExclTax Calculations
          await calculation.calculateMerchantFeeExclTax(
            Number(settlementAmount)
          );
          await calculation.calculateMerchantFeeTax();
          await calculation.calculateMerchantFeeinclTax();
          console.log(
            'Testing Values: ',
            expectedConfig.planSummary.MerchantFeeExclTax +
              ' ' +
              expectedConfig.planSummary.MerchantFeeTax +
              ' ' +
              expectedConfig.planSummary.MerchantFeeinclTax
          );
          //converting into string.
          expectedData.planDetails.MerchantFeeExclTax =
            expectedConfig.planSummary.MerchantFeeExclTax.toString();
          expectedData.planDetails.MerchantFeeTax =
            expectedConfig.planSummary.MerchantFeeTax.toString();
          expectedData.planDetails.MerchantFeeinclTax =
            expectedConfig.planSummary.MerchantFeeinclTax.toString();
          await this.writeFile(expectedData);
          PlanDate = actualArray[1].split(' ');
          const actual = [
            PlanDate[0].replace(/[^0-9/]/g, ''),
            actualArray[4].replace(/[^0-9a-zA-z]/g, ''),
            actualArray[6].replace(/[^0-9.]/g, ''),
            actualArray[8].replace(/[^0-9.]/g, ''),
            actualArray[21].replace(/[^0-9]/g, ''),
            actualArray[22].replace(/[^0-9]/g, ''),
            actualArray[24].replace(/[^0-9]/g, ''),
            actualArray[9].replace(/[^0-9.]/g, ''),
            actualArray[10].replace(/[^0-9.]/g, ''),
            actualArray[11].replace(/[^0-9.]/g, ''),
          ];
          const expected = [
            expectedData.planSummary.planDate,
            expectedData.planSummary.planID,
            expectedData.planSummary.totalCost,
            expectedData.planSummary.totalFunds,
            expectedData.planSummary.totalNoOfInstallments,
            expectedData.planSummary.noOfInstallmentsPaid,
            expectedData.customer.cardNumber.slice(12, 16),
            expectedData.planDetails.MerchantFeeExclTax,
            expectedData.planDetails.MerchantFeeTax,
            expectedData.planDetails.MerchantFeeinclTax,
          ];

          if (config.LocalEnv.verifyFlag === 'true') {
            await utility.matchValues(
              actual,
              expected,
              title,
              'download excel file',
              expectedConfig.LocalEnv.applicationName
            );
          }
        }
      }
    } else {
      console.log('No Records found in the downloaded file.');
    }
  }
}
