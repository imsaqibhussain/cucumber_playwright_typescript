import { page } from '../../features/support/hooks';
import { Utilities } from '../utilities';

const utility = new Utilities();
export class DownloadReports {
  reportsL = '#reports';
  plansL = "//div[@id='__next']/div[1]/div[2]/div[2]/div[2]/div[1]/div[1]";
  transactionL =
    "(//div[contains(@class,'MuiPaper-root MuiPaper-elevation')]//div)[2]";
  // "//div[normalize-space()='Transactions']";
  firstCalenderL =
    "//div[@class='MuiGrid-root MuiGrid-container css-ugtew7']//div[1]//div[1]//div[1]//div[1]//button[1]//*[name()='svg']";
  secondCalenderL =
    "(//div[contains(@class,'MuiInputAdornment-root MuiInputAdornment-positionEnd')]//button)[2]";
  yearL =
    "(//button[contains(@class,'MuiButtonBase-root MuiIconButton-root')])[3]";
  exportButtonL = "//button[normalize-space()='EXPORT .CSV']";
  async downloadPlan(reportName: any, startDate: any, endDate: any) {
    const firstDate = await utility.convertDateStringtoArray(startDate);
    const secondDate = await utility.convertDateStringtoArray(endDate);
    await page.waitForSelector(this.reportsL);
    await page.locator(this.reportsL).click();
    await utility.delay(2000);
    if (reportName === 'plansReport') {
      await page.waitForSelector(this.plansL);
      await page.locator(this.plansL).click();
    }
    if (reportName === 'transactionsReport') {
      await page.waitForSelector(this.transactionL);
      await page.locator(this.transactionL).click();
    }
    await page.waitForSelector(this.firstCalenderL);
    await page.locator(this.firstCalenderL).click();
    await utility.dynamicDateSelectionforAdminPlanDownload(
      firstDate[0],
      firstDate[1],
      firstDate[2]
    );
    await utility.delay(1500);
    await page.waitForSelector(this.secondCalenderL);
    await page.locator(this.secondCalenderL).click();
    await utility.dynamicDateSelectionforAdminPlanDownload(
      secondDate[0],
      secondDate[1],
      secondDate[2]
    );
    await utility.delay(1500);
    const [download] = await Promise.all([
      // Start waiting for the download
      page.waitForEvent('download'),
      await utility.delay(5000),
      // Perform the action that initiates download
      page.locator(this.exportButtonL).click(),
    ]);
    const sDate = startDate.replaceAll('/', '-');
    const eDate = endDate.replaceAll('/', '-');
    await download.saveAs(
      'tests/setup/actual/downloaded-reports/' +
        reportName +
        '--' +
        sDate +
        '-' +
        eDate +
        '.csv'
    );
    await utility.delay(1000);
  }
}
