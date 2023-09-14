import { Utilities } from '../utilities';
import { expectedConfig } from '../../setup/expected/expected-ts.conf';
const utility = new Utilities();
import { page } from '../../features/support/hooks';

export class ProductList {
  amount_text_locator =
    '//body/div[@id="root"]/main[1]/div[1]/div[1]/div[2]/p[3]';
  // incrementing_quantity = '#mui-1';
  incrementing_quantity =
    "//input[contains(@class,'MuiInputBase-input MuiOutlinedInput-input')]";
  // '//input[@id=":r0:"]';
  calendar_mm_text_locator =
    '.MuiCalendarPicker-root > .css-1dozdou > .css-l0iinn > .PrivatePickersFadeTransitionGroup-root:nth-child(1) > .css-1v994a0';
  viewCart_Button_locator = '//button[@id="view-cart"]';
  itemPrelocator = '.MuiGrid-root > .css-j7qwjs > .MuiBox-root:nth-child(';
  itemPostlocator = ') > .MuiCheckbox-root > .PrivateSwitchBase-input';
  planpayOption =
    "//div[@id='root']/div[1]/div[1]/div[1]/div[1]/div[3]/div[4]/div[1]/div[1]/div[1]";
  currency_locator =
    "//div[@class='MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-182didf']";
  //"//div[@class='MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input css-qiwgdb']";
  // currency_locator='[data-testid="ArrowDropDownIcon"]';

  async adding_product(
    producItem: any,
    Quantity: any,
    redemptionDate: any,
    checkoutCurrency: any
  ) {
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\x1b[35m Products Selection \x1b[37m%%%%%%%%%%%%%%%%%%%%%%%%%%%%%' +
        '\n'
    );
    let prod_items = [];
    let product_quantities = [];
    let productredemptionDates = [];
    let date, day, month, year, cost;
    const each_product_quantity = [];
    const each_product_amount = [];

    if (await producItem.includes('$')) {
      //check if we have multiple products
      prod_items = await producItem.split('$');
    } else {
      await prod_items.push(producItem);
    }

    if (await Quantity.includes(',')) {
      product_quantities = await Quantity.split(',');
    } else {
      await product_quantities.push(Quantity);
    }

    if (await redemptionDate.includes(',')) {
      productredemptionDates = await redemptionDate.split(',');
    } else {
      await productredemptionDates.push(redemptionDate);
    }
    await this.saveRedemptionDate(productredemptionDates); //saving Redemption Date in expected config

    const productList = expectedConfig.MerchantEnv.productList;
    let j = 0;
    console.log('Selected items ======> ' + prod_items);
    console.log(
      'expectedConfig.MerchantEnv.productList ======> ' +
        expectedConfig.MerchantEnv.productList
    );
    let x = 0;
    for (let i = 0; i < (await productList.length); i++) {
      if (await prod_items.includes(productList[i])) {
        //saving products in expected config(description and redemption date)
        const item = {
          description: productList[i],
          redemptionDate: productredemptionDates[x],
        };
        expectedConfig.planDetails.items.push(item);
        x++;
        //<---->
        console.log('Product item conatins===> ' + productList[i]);
        const itemLocator =
          this.itemPrelocator + (i + 1) + this.itemPostlocator;

        await page.waitForSelector(itemLocator);
        await page.click(itemLocator);
        await page.waitForSelector("//p[text()='Product Cost:']");
        cost = await page.locator("//p[text()='Product Cost:']").innerText();
        const array = await cost.split('$');
        await each_product_amount.push(array[1]);
        await page.fill(this.incrementing_quantity, product_quantities[j]);
        await each_product_quantity.push(product_quantities[j]);
        date = await this.getredemptionDate(productredemptionDates[j]); //Spliting & gettting date in array form
        console.log('Selected Date for the Product is ==> ' + date);
        day = date[0];
        month = date[1];
        year = date[2];
        await utility.dynamicDateSelectionforProduct(day, month, year);
        j++;
      }
    }
    await page.waitForSelector(this.currency_locator);
    await page.locator(this.currency_locator).click();
    console.log('checkoutCurrency', checkoutCurrency);
    // await page.waitForSelector('text=' + checkoutCurrency);
    if ((await page.locator('text=' + checkoutCurrency).count()) > 2) {
      await page
        .locator('text=' + checkoutCurrency)
        .nth(2)
        .click();
    } else {
      await page.locator('text=' + checkoutCurrency).click();
    }
    return await [each_product_amount, each_product_quantity]; //amount and quantity of each product
  }

  async getredemptionDate(redemptionDate: any) {
    return await utility.convertDateStringtoArray(redemptionDate);
  }

  async saveRedemptionDate(productShipmentDates: any) {
    const dates = productShipmentDates;
    const productredemptionDates = [];
    for (let i = 0; i < dates.length; i++) {
      const formatedDated = await this.getredemptionDate(dates[i]);
      const formatedDated1 =
        formatedDated[2] + '/' + formatedDated[1] + '/' + formatedDated[0];
      await productredemptionDates.push(formatedDated1);
    }
    let earlierDate = await utility.getEarlierDate(productredemptionDates);
    earlierDate = await utility.getFormatatedDate(earlierDate, 'BR');
    expectedConfig.planSummary.redemptionDate = String(earlierDate);
    console.log('Calculated Redemption Date ' + earlierDate);
  }
  /*
  async dynamicDateSelectionforProduct(day, month, year) {
    await global.page
      .locator("//*[name()='path' and contains(@d,'M17 12h-5v')]")
      .click();
    // Click [aria-label="calendar view is open\, switch to year view"]
    await global.page
      .locator('[aria-label="calendar view is open, switch to year view"]')
      .click();
    // Click text=2024
    await global.page.locator('button:has-text("' + year + '")').click();
    let actualMonth = await utility.monthNumber(month);
    let selectedMonth = await global.page
      .locator(this.calendar_mm_text_locator)
      .innerText();
    let selectedMonthNumber = await utility.monthNumber(selectedMonth);
    await this.compareMonthsDifference(selectedMonthNumber, actualMonth);
    await global.page.locator('text=' + day).click();
  }

  async compareMonthsDifference(selected, actual) {
    if (actual > selected) {
      let count = (await actual) - selected;
      for (let i = 0; (await i) < count; i++)
        await global.page.locator('[aria-label="Next month"]').click();
      // eslint-disable-next-line no-empty
    } else if (actual === selected) {
    } else if (actual < selected) {
      let count = (await selected) - actual;
      for (let i = 0; (await i) < count; i++)
        await global.page.locator('[aria-label="Previous month"]').click();
      await global.page.locator('text=' + day).click();
    }
  }
*/
  async view_cart() {
    await page.waitForSelector(this.viewCart_Button_locator);
    await page.click(this.viewCart_Button_locator);
    //clicking on the planpay option from merchant checkout page.
    // await page.waitForSelector(this.planpayOption);
    // await page.click(this.planpayOption);
  }
}
