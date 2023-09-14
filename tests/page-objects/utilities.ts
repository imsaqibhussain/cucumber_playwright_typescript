import { expect } from '@playwright/test';
const errorMessagePopup = '//div[@role="alert"]'; //.message
import { readFileSync } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import { page, context } from '../features/support/hooks';
const calendar_mm_text_locator =
  "//div[@class='MuiPickersCalendarHeader-label css-1v994a0']";
// "//div[@class='MuiPickersCalendarHeader-label css-1v994a0']";
// const yearL =
//   "(//button[contains(@class,'MuiButtonBase-root MuiIconButton-root')])[3]";
const yearL = "//div[@class='MuiPickersFadeTransitionGroup-root css-1bx5ylf']";
// const yearL = '#:rc:-grid-label';

import { config } from '../setup/configurations/test-data-ts.conf';
import { expectedConfig } from '../setup/expected/expected-ts.conf';
// import { readFile } from 'fs/promises';
import { merchantsConfig } from '../setup/expected/merchant-ts.conf';

export class Utilities {
  enterRandomtext(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async enterRandomNumber(length: number) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async convertDateStringtoArray(str: string) {
    return str.split('/');
  }

  async convertSpacesStringintoArray(str: string) {
    return str.split(' ');
  }

  async breakIntoArray(str: string) {
    const result = str.split(/\r?\n\n/);
    return result;
  }

  async amountConversionIntoArray(str: string) {
    const result = str.split(/\r?\n/);
    return result;
  }

  async convertStringtoArray(str: string) {
    return str.split(',');
  }

  async checkForError() {
    if (await page.locator(errorMessagePopup).isVisible()) {
      const errorMessage = await page.locator(errorMessagePopup).innerText();
      console.log('An error occurred');
      console.log('Error: ' + errorMessage);
      return 'fail';
    }
    return 'pass';
  }

  async openEmail(email: any, subjectLine: any) {
    const page1 = await context.newPage();
    if (email.includes('@mailinator.com')) {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on Mailinator public portal!...'
      );
      const link =
        'https://www.mailinator.com/v4/public/inboxes.jsp?to=' + email;
      await page1.goto(link);
    } else {
      console.log(
        'We are going to open your email address: ' +
          email +
          ' on planpay.testinator.com private portal!...'
      );
      const link = `${process.env.MAILINATOR_PRIVATE_URL}` + email;
      await page1.goto(link);
    }

    await this.delay(10000);
    //check if subjectLine is Array
    if (Array.isArray(subjectLine)) {
      for (let i = 0; i < subjectLine.length - 1; i++) {
        await expect(page1.locator('text=' + subjectLine[i])).toBeVisible();
      }
      subjectLine = subjectLine[subjectLine.length - 1];
    }
    console.log('subjectLine=>', subjectLine);
    await page1
      .locator('text=' + subjectLine)
      .first()
      .click();
    return page1;
  }

  async monthNumber(month: any) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    let monthcount = 1;
    //console.log(month)
    //console.log(months)
    for (let i = 0; (await i) < months.length; i++) {
      if (month == months[i]) {
        return monthcount;
      } else {
        monthcount++;
      }
    }
  }
  async getMonthName(monthNumber: number, length: string) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const shortmonthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    if (length == 'short') {
      return shortmonthNames[monthNumber - 1];
    } else {
      return monthNames[monthNumber - 1];
    }
  }
  //changes 10/02/2023 to 10 FEB, 2023
  async changeDateFormat(date: string) {
    const dateArr = await date.split('/');
    const monthNo = await this.getMonthName(Number(dateArr[1]), 'short');
    const result =
      (await dateArr[0]) +
      ' ' +
      (await monthNo.toUpperCase()) +
      ', ' +
      dateArr[2];
    console.log(result);
    return result;
  }
  //accept date in dd/mm/yy format
  async getDayName(date: string) {
    const newDate = await date.split('/');
    date = newDate[1] + '/' + newDate[0] + '/' + newDate[2];
    const d = await new Date(date);
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return await days[d.getDay()];
  }

  async getEarlierDate(productDates: any) {
    const arrDates = productDates.map((str: any) => new Date(str));
    const min = new Date(Math.min(...arrDates));
    return min;

    // // return earlier date among array of dates
    // let min = await new Date(productDates[0]);
    // for (let i = 0; i < (await productDates.length); i++) {
    //   if ((await new Date(productDates[i])) < min) {
    //     min = productDates[i];
    //   }
    // }
    // console.log("Earlier shipment date " + min);
    // return min;
  }

  async monthShortform(month: any) {
    return month.slice(0, 3);
  }

  async dynamicDateSelectionforProduct(day: any, month: any, year: any) {
    await page.click(
      "//button[contains(@class,'MuiButtonBase-root MuiIconButton-root')]"
    );
    // .locator("//*[name()='path' and contains(@d,'M17 12h-5v')]")
    // .click();
    await page
      .locator('[aria-label="calendar view is open, switch to year view"]')
      .click();
    await page.locator('button:has-text("' + year + '")').click();
    const actualMonth = await this.monthNumber(month);

    console.log('My Selected month is: ', actualMonth);

    const selectedMonth = await page
      .locator(calendar_mm_text_locator)
      .innerText();

    // console.log("My Selected month is: ",selectedMonth)

    const myMonthrefinedString = await selectedMonth.split(' ');

    // console.log("myMonthrefinedString", myMonthrefinedString[0])
    const selectedMonthNumber = await this.monthNumber(myMonthrefinedString[0]);

    // console.log("My Selected month number is: ",selectedMonthNumber)

    await this.compareMonthsDifference(selectedMonthNumber, actualMonth);
    await this.monthShortform(month);

    // const shortMonthForm = await this.monthShortform(month);
    // console.log("Month short form === :" + shortMonthForm);
    //let finalDate = shortMonthForm + " " + day + "\\," + " " + year;
    //await global.page.locator('button[role="gridcell"]:has-text("20")').click();

    await page
      .locator('button[role="gridcell"]:has-text("' + day + '")')
      .first()
      .click();

    //await global.page.locator('[aria-label="' + finalDate + '"]').click();
  }

  async dynamicDateSelectionforAdminPlanDownload(
    day: any,
    month: any,
    year: any
  ) {
    await page.waitForSelector(yearL);
    await page.locator(yearL).click();
    await page.locator('button:has-text("' + year + '")').click();
    const actualMonth = await this.monthNumber(month);
    const selectedMonth = await page
      .locator(calendar_mm_text_locator)
      .innerText();
    const myMonthrefinedString = await selectedMonth.split(' ');
    const selectedMonthNumber = await this.monthNumber(myMonthrefinedString[0]);
    await this.compareMonthsDifference(selectedMonthNumber, actualMonth);
    await this.monthShortform(month);
    await page
      .locator('button[role="gridcell"]:has-text("' + day + '")')
      .first()
      .click();
  }

  async compareMonthsDifference(selected: any, actual: any) {
    if (actual > selected) {
      const count = (await actual) - selected;
      for (let i = 0; (await i) < count; i++)
        await page.locator('[aria-label="Next month"]').click();
      // eslint-disable-next-line no-empty
    } else if (actual === selected) {
    } else if (actual < selected) {
      const count = (await selected) - actual;
      for (let i = 0; (await i) < count; i++)
        await page.locator('[aria-label="Previous month"]').click();
      //await global.page.locator("text=" + day).click();
    }
  }

  async checkElementPresent(fieldName: any) {
    await this.delay(5000);
    if (await page.locator(fieldName).isVisible()) {
      return 'pass';
    }
    return 'fail';
  }

  async splitData(str: string) {
    return str.split('\n');
  }

  async splitUrl(str: string) {
    return str.split('/');
  }

  async cleanMyString(dummyString: any) {
    return dummyString.replace(/[^0-9.]/g, '');
  }

  async getFormTitle(dummyString: any) {
    dummyString = dummyString.replace(/[^A-Z a-z]/g, '');
    dummyString = dummyString.replace('AUD', '');
    return dummyString.replace('  ', ' ');
  }
  async getFormValue(dummyString: any) {
    return dummyString.replace(/[^0-9.]/g, '');
  }

  async convertMyMonthshortformintoDigit(month: any) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let monthcount = 1;
    for (let i = 0; (await i) < months.length; i++) {
      if (month == months[i]) {
        if (monthcount < 10) return '0' + monthcount;
        else return monthcount;
      } else {
        monthcount++;
      }
    }
  }

  async converDateFormat(date: any) {
    //let str = date.replace(/[^,]/g, '')
    return date.split(' ');
  }

  async readCustomerDetails() {
    console.log('Inside expected file func');
    const extractedData = readFileSync(
      join('tests/setup/expected/common-details.json'),
      'utf-8'
    );
    const expectedData = await JSON.parse(extractedData);
    return expectedData;
  }
  async readEventProcessorValues() {
    console.log('Inside event Processor file func');
    const extractedData = readFileSync(
      join('tests/setup/expected', 'eventProcessor_errors.json'),
      'utf-8'
    );
    if (extractedData) {
      const expectedData = await JSON.parse(extractedData);
      return expectedData;
    }
    return extractedData;
  }
  //This function will return the number of last digits comes as lastDigits argument

  async matchValues(
    actual: any,
    expected: any,
    fieldName: any,
    screenName: any,
    applicationName: any
  ) {
    console.log(
      '\n' +
        '=============\u001b[1;35mMatching Function Call Start\u001b[1;37m===============' +
        '\n'
    );
    console.log(
      '\n' +
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Application Name => ' +
        applicationName +
        ' %%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
    );
    console.log(
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Matching Values for => ' +
        screenName +
        ' Screen %%%%%%%%%%%%%%%%%%%%%%%%%%%%% \n'
    );

    if (Array.isArray(fieldName)) {
      for (let i = 0; i < fieldName.length; i++) {
        console.log(
          '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Verifying Field => ' +
            fieldName[i] +
            '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%% \n'
        );
        console.log(fieldName[i] + ': Received values are => ' + actual[i]);
        console.log(
          fieldName[i] + ': Expected values from json => ' + expected[i]
        );
        console.log(
          'Actual Value ' +
            i +
            ' : ' +
            actual[i] +
            ' & Expected Value is =' +
            expected[i]
        );
        await expect(actual[i]).toEqual(expected[i]);
      }
    } else {
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Verifying Field => ' +
          fieldName +
          '  %%%%%%%%%%%%%%%%%%%%%%%%%%%%% \n'
      );
      console.log(fieldName + ': Received values are => ' + actual);
      console.log(fieldName + ': Expected values from json => ' + expected);
      console.log(
        'Actual Value ' + ' : ' + actual + ' & Expected Value is =' + expected
      );
      await expect(actual).toEqual(expected);
    }
    console.log(
      '\n' +
        '==============\u001b[1;35mMatching Function Call End\u001b[1;37m===============' +
        '\n'
    );
  }

  async addZeroes(num: any) {
    // Convert input string to a number and store as a letiable.
    const value = await String(num);
    // Split the input string into two arrays containing integers/decimals
    const res = await value.split('.');
    const valueNum = await Number(value);
    let valueString = '';
    // If there is no decimal point or only one decimal place found.
    if (res.length == 1 || res[1].length < 3) {
      // Set the number to two decimal places
      valueString = await valueNum.toFixed(2);
    }
    // Return updated or original number.
    return valueString;
  }
  //return price in fraction value
  async convertPricewithFraction(price: any) {
    return await price.replace(/[^0-9.]/g, '');
  }

  async convertPrice(price: any) {
    const singleInt = await price.replace(/[^0-9.]/g, '');
    const value = await parseInt(singleInt);
    // console.log("num =>"+ value);
    return value;
  }

  //not being used anywhere--test data cleanup operation
  // async getMerchantName(merchantName: any) {
  //   let configMerchant = '';
  //   switch (merchantName) {
  //     case 'Merchant 0':
  //       configMerchant = await config.merchant0.Name;
  //       break;
  //     case 'Merchant 1':
  //       configMerchant = await config.merchant1.Name;
  //       break;
  //     case 'Merchant 2':
  //       configMerchant = await config.merchant2.Name;
  //       break;
  //     case 'Merchant 3':
  //       configMerchant = await config.merchant3.Name;
  //       break;
  //   }

  //   return configMerchant;
  // }

  async convertSummaryPayment(str: string) {
    const singleInt = await str.replace(/[^0-9/]/g, '');
    // console.log("after removing alphabets => " + singleInt);
    return singleInt.split('/');
  }

  async formatDate(date: any) {
    const newDate = new Date(date);
    const dd = newDate.getDate();

    const mm = newDate.getMonth() + 1;
    const yyyy = newDate.getFullYear();
    let ddStr: any = dd;
    let mmStr: any = mm;
    if (dd < 10) {
      ddStr = '0' + dd;
    }

    if (mm < 10) {
      mmStr = '0' + mm;
    }
    const newDateStr = ddStr + '/' + mmStr + '/' + yyyy;
    // console.log("Convert date format => " + newDate);
    return newDateStr;
  }

  delay(time: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
  async getDateByDay(dayName: string, paymentdate?: any) {
    //return the date of given day of current week
    // Plan Date
    let date;
    if (expectedConfig.planSummary.operationType == 'updatePlan') {
      date = paymentdate;
    } else {
      date = await new Date();
    }
    const now = await date.getDay();

    // Days of the week
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    // The index for the day you want
    const day = await days.indexOf(dayName.toLowerCase());
    // Find the difference between the current day and the one you want
    // If it's the same day as today (or a negative number), jump to the next week
    let diff = (await day) - now;
    diff = (await diff) < 1 ? 7 + diff : diff;
    const nextDayTimestamp =
      (await date.getTime()) + 1000 * 60 * 60 * 24 * diff;
    // console.log("next date"+ nextDayTimestamp);
    return await new Date(nextDayTimestamp);
  }
  //first and second argument should be dates.
  //first argument (lastdate) should be in US date format (mm-dd-yyyy)
  async differenceInDate(
    lastDate: any,
    firstDate: any,
    includeFirstDate: boolean,
    includeLastDate: boolean
  ) {
    lastDate = await new Date(lastDate);
    const diffTime = await Math.abs(lastDate - firstDate);
    // console.log("diff time"+diffTime);
    const days = (diffTime: any) => {
      let TotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (includeLastDate == true) {
        TotalDays = TotalDays + 1;
      }
      if (includeFirstDate == false) {
        TotalDays = TotalDays - 1;
      }

      console.log(
        '\u001b[1;33mDate difference is ' + TotalDays + ' days.\u001b[1;37m.'
      );
      return TotalDays;
    };
    return await days(diffTime);
  }

  async mulElementsTextFetching(locator: any, slicing: any) {
    const array: any = [];
    // const data=await page.locator(locator).first().isVisible()
    // if(data){
    await page.waitForSelector(locator);
    const mulElementsFinding = await page.$$(locator);
    const mulElementTextList = await Promise.all(
      mulElementsFinding.map(async (repo: any) => {
        return await repo.innerText();
      })
    );
    // console.log("INSTALMENT AMOUNT LIST> " + inst_Amount_list);

    mulElementTextList.forEach(async (element) => {
      const am = element.slice(slicing);
      array.push(am);
    });
    // }
    return array;
  }
  async writeIntoJsonFile(filename: any, ResponseJson: any, path: any) {
    const data = JSON.stringify(ResponseJson, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    );
    fs.writeFileSync(`tests/setup/${path}/${filename}.json`, data);
    console.log(filename + ' data is saved in ' + filename + ' .json file');
    await this.delay(4000);
    /** TO BE UNCOMMENTED AND FOXED ACC TO TS STRUCTURE */
    // const merchantName = loginResponseJson.data.merchant.name;
    // const expectedMerchantName = config[myMerchant].Name;
    // expect(merchantName).toBe(expectedMerchantName);
    // //
    // const merchantId = loginResponseJson.data.merchant.id;
    // const expectedMerchantId = config[myMerchant].id;
    // expect(merchantId).toBe(expectedMerchantId);
  }

  async convertAlphaNumeric(str: string) {
    const singleInt = await str.replace(/[^0-9/]/g, '');
    // const singleInt = str.match(/[\d\.]+|\D+/g);
    // console.log("after removing alphabets => " + singleInt);
    return singleInt;
  }

  async getMonthDifference(
    d1: any,
    d2: any //date format should be dd/mm/yy->calculates month difference
  ) {
    d1 = await d1.split('/');
    d2 = await d2.split('/');
    console.log('d1 ' + d1);
    console.log('d2 ' + d2);

    let months = 0;

    months = (await ((await parseInt(d2[2])) - (await parseInt(d1[2])))) * 12;
    console.log('months ' + months); //12

    months = await (months - (await parseInt(d1[1]))); //12-
    console.log('months ' + months);

    months = await (months + (await parseInt(d2[1])));
    if (d1[0] > d2[0]) {
      months = months - 1;
    }
    console.log('months ' + months);

    return months;
  }

  async getFormatatedDate(date: any, format: any) {
    if (format == 'BR') {
      date = await date.toLocaleString('en-GB'); //dd/mm/yy
    } else {
      date = await date.toLocaleString('en-US'); //mm/dd/yy
    }
    date = await date.split(',');
    return date[0];
  }

  async upto2Decimal2(value: number) {
    const roundedValue = Math.round(value * 100) / 100;
    return roundedValue.toFixed(2);
  }
  async upto2Decimal(num: any) {
    //take 2 decimal or add zeros
    //add zeros if it's a whole number
    num = Number(num);
    if (num % 1 == 0) {
      num = await num.toFixed(2);
    } else {
      num = await num.toString();
      num = await num.slice(0, num.indexOf('.') + 3);
      num = await Number(num);
      num = await num.toFixed(2);
    }
    return num;
  }
  async removeComma(str: string) {
    if (str.includes(',')) {
      return await str.replace(',', '');
    }
    return str;
  }
  /**TO BE FIX IN TS */
  async getProductDesc(merchant_name: any, productItems: any) {
    // const prodDes = [];
    console.log('Merchant Name ' + merchant_name);
    let separatedProducts = [];
    separatedProducts = await productItems.split('$');
    console.log('Saved prod list ' + separatedProducts);

    // for (let i = 0; i < separatedProducts.length; i++) {
    //   const localMerchant: any = merchantsLocal.find(
    //     (i) => i.name === merchant_name
    //   );
    // prodDes[i] =
    //   localMerchant?.merchantProducts[separatedProducts[i]].description;
    // }
    // console.log("extracted product description "+ prodDes);

    return separatedProducts;
  }

  async randomInteger(min: number, max: number) {
    // find diff
    const difference: number = max - min;
    // generate random number
    let rand = Math.random();
    // multiply with difference
    rand = Math.floor(rand * difference);
    // add with min value
    rand = rand + min;
    return rand;
  }

  async removeSpace(str: string) {
    const removeSpace = await str.replace(/\s+/g, '');
    return removeSpace;
  }
  async readJsonFile(path: string) {
    await this.delay(4000);
    let Data = readFileSync(join('tests/setup', path), 'utf-8');
    await this.delay(2000);
    Data = await JSON.parse(Data);
    return Data;
  }

  async removeLine(str: string) {
    return str.replace(/\n/g, '');
  }

  /****returns whether product or merchant level settings will be applied ***/
  /****argumrnts=> property is the setting which needs to be checked,***/
  /****item is name of the product and rule canbe 'merchantLevel' or 'productLevel' ***/
  async checkAppliedRule(rule: string, property: string, item?: string) {
    let setting;
    //reading merchant config file
    const merchantConfiguration = await this.commonJsonReadFunc('jsonFile');
    if (rule == 'merchantLevel') {
      setting = merchantConfiguration.merchant;
    } else {
      const merchantProduct = merchantConfiguration.products.items.find(
        (product) => product.description == item
      );
      setting = merchantProduct;
    }

    if (setting[property] != null) {
      return setting[property];
    } else {
      return 'null';
    }
  }

  async idHandler(str: any) {
    const id = str.toLowerCase().split(' ').join('_');
    return id;
  }

  async replaceDaywithMothinDates(str: string) {
    const myArr: any = str.split('/');
    return myArr[1] + '/' + myArr[0] + '/' + myArr[2]; // mm//dd//yyyy
  }

  async getCurrentDate() {
    const date = new Date();
    let month = date.getMonth() + 1;
    month = await this.addZeroinSingleDigit(month);
    return `${date.getDate()}/${month}/${date.getFullYear()}`;
  }

  async printValues(title: any, amount: any, functionName: any) {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log(
      '%%%%%%%%%% Actual Values on \u001b[1;34m' +
        functionName +
        '\u001b[1;37m Screen %%%%%%%%%'
    );
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    if (Array.isArray(title)) {
      for (let i = 0; i < title.length; i++) {
        console.log(title[i] + ' : ' + amount[i]);
      }
    } else {
      console.log(title + ' : ' + amount);
    }
    console.log('%%%%%%%%%%%Print Function is Ended%%%%%%%%%%%%');
  }

  async printExpectedValues(title: any, amount: any, functionName: any) {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log(
      '%%%%%%%%%% Expected Values on ' + functionName + ' Screen %%%%%%%%%'
    );
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    if (Array.isArray(title)) {
      for (let i = 0; i < title.length; i++) {
        console.log(title[i] + ' : ' + amount[i]);
      }
    } else {
      console.log(title + ' : ' + amount);
    }
    console.log('%%%%%%%%%%%Print Function is Ended%%%%%%%%%%%%');
  }

  async printExpectedandAcctualValues(
    title: any,
    actual: any,
    expected: any,
    functionName: any
  ) {
    console.log('%%%%%%%% Calling Print Function %%%%%%%%');
    console.log(
      '%%%%%%%% Actual Values on ' + functionName + ' Screen %%%%%%%%'
    );
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    for (let i = 0; i < title.length; i++) {
      console.log(title[i] + ' : ' + actual[i]);
    }

    console.log(
      '%%%%%%%% Expected Values on ' + functionName + ' Screen %%%%%%%%'
    );
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    for (let i = 0; i < title.length; i++) {
      console.log(title[i] + ' : ' + expected[i]);
    }
    console.log('%%%%%%%% Calling Print Ended %%%%%%%%');
  }

  async getMaxValue(value1: string | number, value2: string | number) {
    //returns the greater number among two numbres
    value1 = Number(value1);
    value2 = Number(value2);
    if (value1 > value2) {
      return value1;
    } else {
      return value2;
    }
  }

  async generateEmail(email: string) {
    const rNum = await this.enterRandomNumber(4);
    const emailAddress: any =
      (await email) + rNum + config.LocalEnv.signUpDomain;
    return emailAddress;
    //'@planpay.testinator.com';
  }

  //JSON read and write for database transactions.
  async readJSON() {
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    const path =
      'tests/setup/expected/' +
      expectedConfig.planSummary.checkoutType +
      '/' +
      merchant +
      '/events-transactions.json';
    console.log('Inside expected file func');
    const extractedData = readFileSync(path, 'utf-8');
    const expectedData = await JSON.parse(extractedData);
    return expectedData;
  }

  async WriteJSON(extractedData: any) {
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    const path =
      'tests/setup/expected/' +
      expectedConfig.planSummary.checkoutType +
      '/' +
      merchant +
      '/events-transactions.json';
    fs.writeFileSync(
      path,
      JSON.stringify(extractedData, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
  }

  async assignJsontoExpectedConf(merchantName: string) {
    const expectedJson = await this.readJsonFile(
      'expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        merchantName +
        '/expected-values.json'
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expectedConfig = {
      ...expectedConfig,
      ...expectedJson,
    };
  }

  async addZeroinSingleDigit(day: any) {
    for (let i = 1; i <= 9; i++) {
      if (day == i) {
        return '0' + day;
      }
    }
    return day;
  }
  //this function land directly on order details page from merchant acccount,
  async merchantPortalOrderDetailsPage() {
    await page.goto(
      `${process.env.PLANPAY_NEXT_URL}/portal/merchant/${expectedConfig.merchantDetails.merchantId}/plan-detail/${expectedConfig.planSummary.planID}`
    );
  }
  async customerPortalOrderDetailsPage() {
    await page.goto(
      `${process.env.PLANPAY_NEXT_URL}/portal/plan/${expectedConfig.planSummary.planID}`
    );
  }

  async dateFormatHandling(convertedDate: any) {
    //handle the th,st,rd,nd in day field.
    if (convertedDate.includes('th')) {
      convertedDate = convertedDate.replace('th', '');
    } else if (convertedDate.includes('st')) {
      convertedDate = convertedDate.replace('st', '');
    } else if (convertedDate.includes('rd')) {
      convertedDate = convertedDate.replace('rd', '');
    } else if (convertedDate.includes('nd')) {
      convertedDate = convertedDate.replace('nd', '');
    }
    return convertedDate;
  }

  async convertUTCDateIntoLocal(date: any) {
    const localDate = date.toString();

    const newDate = new Date(localDate);
    const dd = newDate.getDate();

    const mm = newDate.getMonth() + 1;
    const yyyy = newDate.getFullYear();
    let ddStr: any = dd;
    let mmStr: any = mm;
    if (dd < 10) {
      ddStr = '0' + dd;
    }

    if (mm < 10) {
      mmStr = '0' + mm;
    }
    const newDateStr = ddStr + '/' + mmStr + '/' + yyyy;
    // console.log("Convert date format => " + newDate);
    return newDateStr;
  }

  async callExpectedJson() {
    //handel sub merchant in this function
    let expectedValues: any = '';
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      expectedValues = await this.readJsonFile(
        'expected/' +
          expectedConfig.planSummary.checkoutType +
          '/' +
          expectedConfig.merchantDetails.sub_merchantName +
          '/expected-values.json'
      );
    } else {
      expectedValues = await this.readJsonFile(
        'expected/' +
          expectedConfig.planSummary.checkoutType +
          '/' +
          expectedConfig.merchantDetails.merchantName +
          '/expected-values.json'
      );
    }
    // expectedValues = await JSON.parse(expectedValues);
    return expectedValues;
  }

  //pass expectedFile or jsonFile as parameter
  async commonJsonReadFunc(type: string) {
    let expectedValues: any = '';
    let merchant = expectedConfig.merchantDetails.merchantName;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      merchant = expectedConfig.merchantDetails.sub_merchantName;
    }
    if (type == 'expectedFile') {
      expectedValues = await this.readJsonFile(
        'expected/' +
          expectedConfig.planSummary.checkoutType +
          '/' +
          merchant +
          '/expected-values.json'
      );
    } else if (type == 'transactions') {
      expectedValues = await this.readJsonFile(
        'expected/' +
          expectedConfig.planSummary.checkoutType +
          '/' +
          merchant +
          '/events-transactions.json'
      );
    } else if (type == 'jsonFile') {
      expectedValues = await this.readJsonFile(
        'configurations/merchants-products-configuration/' +
          merchant +
          '/' +
          merchant +
          '.json'
      );
    }
    return expectedValues;
  }
  //takes deposit amount as argument, make sure paymentPlatform_vendor is being set in expectedConfig
  async depositCheck(deposit: number) {
    if (
      expectedConfig.planSummary.paymentPlatform_vendor == 'Braintree' ||
      expectedConfig.planSummary.paymentPlatform_vendor == 'Adyen' ||
      expectedConfig.planSummary.paymentPlatform_vendor == 'Mint'
    ) {
      if (
        (deposit >= 2000.0 && deposit <= 3000.99) ||
        deposit == 5001.0 ||
        deposit == 5001.01
      ) {
        return true;
      } else {
        return false;
      }
    } else if (
      expectedConfig.planSummary.paymentPlatform_variant == 'Managed'
    ) {
      if (deposit > 1000) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async RoundUpRoundDownNear50(val: any, condition: any) {
    let number = 0;
    if (condition === 'roundUp') {
      number = (await Math.ceil(val / 50)) * 50;
    }
    if (condition === 'roundDown') {
      number = (await val) - (val % 50);
    }
    return await this.upto2Decimal(number);
  }
  async capitalizeFirstLetter(word: string) {
    const firstLetter = await word.charAt(0);
    const firstLetterCap = await firstLetter.toUpperCase();
    const remainingLetters = await word.slice(1);
    return await (firstLetterCap + remainingLetters);
  }

  async ordinal_suffix_of(i: any) {
    const j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + 'st';
    }
    if (j == 2 && k != 12) {
      return i + 'nd';
    }
    if (j == 3 && k != 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  async dateComparison(date1: any, date2: any) {
    //if date1 is before date2
    console.log('**Date Comparison**');
    const today = new Date(date2);
    const date = new Date(date1);
    // Set hours, minutes, seconds and milliseconds to 0
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    // Compare the date objects
    if (date < today) {
      console.log('The date is before today.');
      return true;
    } else {
      return false;
    }
  }
  async change_DateFormat(date: string) {
    const DateArray = await this.convertDateStringtoArray(date);
    date = (await DateArray[2]) + '/' + DateArray[1] + '/' + DateArray[0];
    console.log('date =>', date);
    return date;
  }
  async titleCase(str: any) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }
  async removespacefromArr(Arr: any) {
    for (let i = 0; i < Arr.length; i++) {
      Arr[i] = await Arr[i].trim();
    }
    return Arr;
  }
  async canBeEquallyDivided(amount: number, numberOfinst: number) {
    // Check if the amount and numberOfinst are positive integers
    if (amount > 0 && numberOfinst > 0) {
      // Check if the amount is divisible by the numberOfinst without any remainder
      const mod = await (amount * 100);
      console.log('mod==> ', mod % numberOfinst);
      return (await mod) % numberOfinst === 0;
    }
  }

  async createFolder(path: any) {
    if (!fs.existsSync(path)) {
      console.log('Folder does not exists!');
      console.log('Creating Folder');
      console.log('path', path);

      await fs.mkdirSync(path);
      // await mkdirp.sync(path);
      this.delay(2000);
    }
  }
  async moveToFirst(arr: any, element: any) {
    const index = await arr.indexOf(element);
    if (index !== -1) {
      await arr.splice(index, 1);
      await arr.unshift(element);
    }
    return await arr;
  }

  async saveMerchantToCommon(id: any) {
    const common = await this.readJsonFile('expected/common-details.json');
    common.merchant.id = id;
    common.merchant.name = merchantsConfig.merchant.name;

    console.log('Set Merchant => ', common.merchant);
    await this.writeIntoJsonFile('common-details', common, 'expected');
  }

  async removeTrailingZeros(number: string) {
    // Use regular expression to remove trailing zeros and a trailing dot if present
    number = await number.replace(/\.?0+$/, '');
    return number;
  }
}
