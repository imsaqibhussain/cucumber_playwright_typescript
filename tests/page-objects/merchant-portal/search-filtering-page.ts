import { expect } from '@playwright/test';
import { Utilities } from '../utilities';
import { OrderPage } from './order-details-page';
import { Page } from 'playwright-core';
import { page } from '../../features/support/hooks';

const orderPage = new OrderPage();
const utility = new Utilities();
export class SearchPage {
  website = `${process.env.PLANPAY_NEXT_URL}/?search=`;
  searchField = '#quick-filter-search';
  searchFilter = '#filter';
  filterBox =
    "//div[@class='MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation8 MuiPopover-paper css-1dmzujt']";

  async verifySearchOperation(filtering: any, fieldValue: any, rows: any) {
    console.log('Total rows are');
    const rowsCount = await rows.count();
    console.log(rowsCount);
    await expect(rowsCount).toBeGreaterThan(0); // Verify search results

    colloop: for (let i = 0; i < rowsCount; i++) {
      const singlerow = await rows.nth(i).locator('td');
      const colCount = await singlerow.count();
      console.log(colCount);
      let statusValue;
      switch (filtering) {
        case 'PlanPay ID':
          await expect(await singlerow.nth(0).innerText()).toMatch(fieldValue);
          console.log(fieldValue + ' Matched at ' + filtering);
          break colloop;
        case 'Merchant order ID':
          await expect(await singlerow.nth(1).innerText()).toMatch(fieldValue);
          console.log(fieldValue + ' Matched at ' + filtering);
          break colloop;
        case 'Customer name':
          await expect(await singlerow.nth(3).innerText()).toMatch(fieldValue);
          console.log(fieldValue + ' Matched at ' + filtering);
          break colloop;
        case 'Status':
          statusValue = await singlerow.nth(6).innerText();
          await expect(fieldValue.toUpperCase()).toMatch(
            statusValue.toUpperCase()
          );
          console.log(fieldValue + ' Matched at ' + filtering);
          break colloop;
      }
    }
  }

  async navigateToSearchScreen(
    operationName: any,
    fieldValue: any,
    verifyOperation: any
  ) {
    if (operationName == 'Search') {
      console.log(verifyOperation);
      await page.fill(this.searchField, fieldValue);
      await page.keyboard.press('Enter');
      await utility.delay(2000);
      console.log('in search function');
      const maindive = '//div[@aria-rowindex]';
      const searchResultCount = await page.locator(maindive).count();
      const totalSearchResult = searchResultCount - 1;
      console.log('Number Of Search Result => ', totalSearchResult);

      if (totalSearchResult == 0) {
        console.log('No Result found for ' + fieldValue);
      } else {
        for (let i = 0; i < totalSearchResult; i++) {
          const rowNumber = '//div[@data-rowindex=' + i + ']';
          const rowData = await page.locator(rowNumber).innerText();
          const detailsScreen = '';
          console.log('\u001b[1;33m Row ' + Number(i + 1), 'Data\u001b[1;37m.');
          const formatRowData = rowData.split(/\r?\n/);
          await orderPage.printEachPlanDetails(
            rowNumber,
            formatRowData,
            detailsScreen
          );
        }
      }
    }
  }

  async submitOperation(
    operationName: any,
    filtering: any,
    fieldValue: any,
    verifyOperation: any
  ) {
    OrderPage.callSource = 'Merchant Portal';
    //Search Filter
    if (filtering == 'Status') {
      const value = 'text=' + fieldValue;
      await page.click(this.searchFilter);
      const elements = await page.locator(this.filterBox);
      await elements.locator(value).click();
      console.log('field value = ' + fieldValue);
    } else if (operationName == 'Search') {
      console.log('Search this' + fieldValue);
      // await page.fill(this.searchField, fieldValue);
      await page.keyboard.press('Enter');
      await utility.delay(2000);
    }

    console.log('in search function');
    //fetching table data
    const ordersTable = page.locator('tbody');
    const rows = page.locator('tbody tr');
    const noResult = "//h5[@id='no-results']";
    if ((await page.$(noResult)) !== null) {
      console.log('No Result found for ' + fieldValue);
    } else {
      // await expect(ordersTable).toBeVisible();
      await ordersTable.waitFor();
      //VerifyOperation
      if (verifyOperation == 'true') {
        console.log('verify operation');
        await this.verifySearchOperation(filtering, fieldValue, rows);
      }
      return rows;
    }
  }
  async navigate_To_Search_Page(fieldValue: any, page: Page) {
    // await page.fill(this.searchField, fieldValue);
    await page.keyboard.press('Enter');
    await page.locator('tbody tr').click();
  }
}
