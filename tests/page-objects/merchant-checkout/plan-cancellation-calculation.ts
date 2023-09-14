import { expectedConfig } from '../../header';
import { Utilities } from '../utilities';
import { calculations } from './calculations';
const utility = new Utilities();
const calculation = new calculations();

export class PlanCancellationCalculation {
  //calculated NonRefundAmount against the refund policy
  //function parameters (Refund policies, description = items name like Holiday)

  // async setDepositRefundableItemLevel(description: any) {
  async calculateNonRefundableAmount_refundPolicy(
    policies: any,
    description: any,
    count: any
  ) {
    console.log('policies', policies);
    console.log('description', description);
    console.log('count', count);
    //Date conversion and find differnce in redemption and cancellation date.
    const convertedCancellationDate: any =
      await utility.replaceDaywithMothinDates(
        String(expectedConfig.cancellationDetails.planCancellationDate)
      );
    const convertedRedemtionDate: any = await utility.replaceDaywithMothinDates(
      expectedConfig.planDetails.items[count].redemptionDate
    );
    const cancellationDate: any = await new Date(convertedCancellationDate);
    const redemptionDate: any = await new Date(convertedRedemtionDate);
    // expectedConfig.cancellationDetails.daysFromCancellationtoRedemtion
    expectedConfig.planDetails.items[count].daysFromCancellationtoRedemtion =
      String(
        await utility.differenceInDate(
          redemptionDate,
          cancellationDate,
          false,
          true
        )
      );

    //get refunable policies against the all item.
    const refund_policies = await calculation.commonFunction(
      policies,
      description
    );
    // if(refund_policies[1] == null){
    //   console.log('no policy found')
    // }
    // if (refund_policies[1].length === 0) {
    //   console.log("The second array is empty");
    // }
    // console.log(refund_policies[1][0].length, 'refund policy founds in merchat.JSON file.')
    console.log(
      '\u001b[1;32m' + description + ' refund policies \u001b[1;37m: ',
      refund_policies[1][0]
    );
    const settings = await calculation.commonFunction(
      'minimumDepositPerItem',
      description
    );

    const depositAmount = await utility.upto2Decimal(
      await calculation.calculateDeposit(
        description,
        await utility.upto2Decimal(
          Number(expectedConfig.planDetails.productsAmount[count])
        ),
        Number(expectedConfig.planDetails.productsQuantity[count]),
        settings[1][0]
      )
    );

    // console.log('description: ', description)
    let depositFlag: any;
    if (expectedConfig.planSummary.checkoutType != 'assisted-checkout') {
      depositFlag = await calculation.commonFunction(
        'depositRefundable',
        description
      );
    } else {
      depositFlag = await calculation.commonFunction('depositRefundable');
    }

    // console.log('depositFlag: ',depositFlag)

    //inserting depositAmount on item level
    expectedConfig.planDetails.items[count].depositAmount = depositAmount;
    expectedConfig.planDetails.items[count].depositRefundable = String(
      depositFlag[1][0]
    );

    if (expectedConfig.planDetails.items[count].depositRefundable == 'false') {
      expectedConfig.planDetails.items[count].nonRefundableDeposit =
        depositAmount;
    } else {
      expectedConfig.planDetails.items[count].nonRefundableDeposit = '0.00';
    }
    let NonRefundableAmount_refundPolicy: any;
    let percent: number;
    const policyDays: any = [];
    const policyPercentage: any = [];
    const sortedDays: any = [];
    const all_nonRefunableamount_refundPolicy = [];
    const all_customerRefundAmount_refundPolicy = [];

    //mapping the days & percentage into array.
    refund_policies[1][0].map((n: any) =>
      policyDays.push(n.daysWithinRedemptionDate)
    );
    refund_policies[1][0].map((n: any) =>
      policyPercentage.push(n.refundablePercentage)
    );
    refund_policies[1][0].map((n: any) =>
      sortedDays.push(n.daysWithinRedemptionDate)
    );

    //sorting the array
    sortedDays.sort(function (a: any, b: any) {
      return a - b;
    });

    // console.log('sortedDays: ', sortedDays);

    //get all amounts against the possible policies
    for (let i = 0; i < sortedDays.length; i++) {
      percent = await this.getPercentageAgainstPolicy(
        policyDays,
        policyPercentage,
        sortedDays[i]
      );

      console.log('percent: ', percent);
      console.log(
        'total amount',
        await utility.upto2Decimal(
          Number(expectedConfig.planDetails.productsAmount[count]) *
            Number(expectedConfig.planDetails.productsQuantity[count])
        )
      );

      all_nonRefunableamount_refundPolicy[i] =
        await this.nonRefundableAmount_refundPolicy(
          percent,
          await utility.upto2Decimal(
            Number(expectedConfig.planDetails.productsAmount[count]) *
              Number(expectedConfig.planDetails.productsQuantity[count])
          ),
          false
        );
      console.log(
        'all_nonRefunableamount_refundPolicy[i]: ',
        all_nonRefunableamount_refundPolicy[i]
      );
      all_customerRefundAmount_refundPolicy[i] =
        await this.calculatedFinalNonRefundAmount(
          Number(expectedConfig.planDetails.items[count].nonRefundableDeposit),
          all_nonRefunableamount_refundPolicy[i],
          false,
          count
        );
    }
    console.log(
      'all_nonRefunableamount_refundPolicy: ',
      all_nonRefunableamount_refundPolicy
    );
    for (let i = 0; i < sortedDays.length; i++) {
      if (
        expectedConfig.planDetails.items[count]
          .daysFromCancellationtoRedemtion >
          sortedDays[sortedDays.length - 1] ||
        expectedConfig.planDetails.items[count]
          .daysFromCancellationtoRedemtion <= sortedDays[sortedDays.length - 1]
      ) {
        NonRefundableAmount_refundPolicy = 0;
        if (NonRefundableAmount_refundPolicy == 0) {
          percent = 100;
        }
        all_nonRefunableamount_refundPolicy[sortedDays.length] =
          await this.nonRefundableAmount_refundPolicy(
            Number(percent),
            await utility.upto2Decimal(
              Number(expectedConfig.planDetails.productsAmount[count])
            ),
            false
          );

        // console.log('all_nonRefunableamount_refundPolicy[]: ', all_nonRefunableamount_refundPolicy)
        // console.log('all_nonRefunableamount_refundPolicy[sortedDays.length]: ', all_nonRefunableamount_refundPolicy[sortedDays.length])
        all_customerRefundAmount_refundPolicy[sortedDays.length] =
          await this.calculatedFinalNonRefundAmount(
            Number(
              expectedConfig.planDetails.items[count].nonRefundableDeposit
            ),
            all_nonRefunableamount_refundPolicy[sortedDays.length],
            false,
            count
          );
        break;
      }
    }

    //Printing calculated amount values.
    // console.log(
    //   'Customer Refund Amount Refund Policy: ',
    //   all_customerRefundAmount_refundPolicy
    // );

    //get all amounts against the possible policies
    // await console.log('\u001b[1;33mPolicy found ' + description +'\u001b[1;37m.');

    //getting only required policy.
    for (let i = 0; i < sortedDays.length; i++) {
      if (
        expectedConfig.planDetails.items[count]
          .daysFromCancellationtoRedemtion <= sortedDays[i]
      ) {
        console.log(
          '\u001b[1;32m' +
            sortedDays[i] +
            ' Days Policy will Apply\u001b[1;37m .'
        );
        percent = await this.getPercentageAgainstPolicy(
          policyDays,
          policyPercentage,
          sortedDays[i]
        ); //[],[],dd
        expectedConfig.planDetails.items[count].effectivePolicyPercentage =
          String(percent);
        expectedConfig.planDetails.items[count].effectivePolicyDays = String(
          sortedDays[i]
        );
        break;
      } else if (
        expectedConfig.cancellationDetails.daysFromCancellationtoRedemtion >
        sortedDays[sortedDays.length - 1]
      ) {
        NonRefundableAmount_refundPolicy = 0;
        if (NonRefundableAmount_refundPolicy == 0) percent = 100;
        console.log(
          'Days are greater than :' +
            sortedDays[sortedDays.length - 1] +
            ' now ' +
            percent +
            ' %age will apply'
        );
        expectedConfig.planDetails.items[count].effectivePolicyPercentage =
          String(percent);
        expectedConfig.planDetails.items[count].effectivePolicyDays = String(
          sortedDays[sortedDays.length - 1]
        );
        break;
      }
    }
    // console.log('Refund policy percenatage is: ', percent);
    console.log(
      'Total Funds paid by customer: ',
      await utility.upto2Decimal(Number(expectedConfig.planSummary.totalFunds))
    );

    console.log('percent: ', percent);
    console.log(
      'expectedConfig.planDetails.productsAmount[count]: ',
      await utility.upto2Decimal(
        Number(expectedConfig.planDetails.productsAmount[count])
      )
    );
    const nonRefunableamount_refundPolicy: number =
      await this.nonRefundableAmount_refundPolicy(
        Number(percent),
        await utility.upto2Decimal(
          Number(expectedConfig.planDetails.productsAmount[count])
        ),
        true
      );
    console.log(
      'nonRefunableamount_refundPolicy: ',
      nonRefunableamount_refundPolicy
    );
    expectedConfig.planDetails.items[count].itemRefundableAmount =
      await this.calculatedFinalNonRefundAmount(
        Number(expectedConfig.planDetails.items[count].nonRefundableDeposit),
        nonRefunableamount_refundPolicy,
        true,
        count
      );

    // console.log(
    //   'all_customerRefundAmount_refundPolicy: ',
    //   all_customerRefundAmount_refundPolicy
    // );

    console.log(
      'all_nonRefunableamount_refundPolicy: ',
      all_nonRefunableamount_refundPolicy
    );

    await this.calculateMilestoneDates(
      sortedDays,
      all_nonRefunableamount_refundPolicy,
      description
    );
  }

  //calculate Total non refundable amount
  async totalNonRefundableAmount() {
    const totalItems = expectedConfig.planDetails.items.length;
    let total = 0;
    for (let i = 0; i < totalItems; i++) {
      total =
        total +
        Number(
          expectedConfig.planDetails.items[i]
            .effectiveFinalNonRefundableAmountItem
        );
    }
    return await utility.upto2Decimal(total);
  }

  //calculate Total refundable amount
  async totalRefundableAmount() {
    const totalItems = expectedConfig.planDetails.items.length;
    let total = 0;
    for (let i = 0; i < totalItems; i++) {
      total =
        total +
        Number(expectedConfig.planDetails.items[i].itemRefundableAmount);
    }
    return await utility.upto2Decimal(total);
  }

  //calculated Final NonRefundAmount which will return to the customer
  async calculatedFinalNonRefundAmount(
    NonRefundabledeposit: number,
    nonRefunableamount_refundPolicy: number,
    flag: boolean,
    count: any
  ) {
    // console.log('NonRefundable Amount testing: ', NonRefundabledeposit, nonRefunableamount_refundPolicy)
    expectedConfig.planDetails.items[
      count
    ].effectiveFinalNonRefundableAmountItem = await utility.upto2Decimal(
      await this.max(NonRefundabledeposit, nonRefunableamount_refundPolicy)
    );

    // console.log(
    //   'expectedConfig.planDetails.items[count].effectiveFinalNonRefundableAmountItem: ',
    //   expectedConfig.planDetails.items[count]
    //     .effectiveFinalNonRefundableAmountItem
    // );
    if (flag === true)
      console.log(
        'Final NonRefund Amount:',
        expectedConfig.planDetails.items[count]
          .effectiveFinalNonRefundableAmountItem
      );
    let CustomerRefundValue: any =
      (await utility.upto2Decimal(
        Number(expectedConfig.planDetails.productsAmount[count])
      )) -
      Number(
        expectedConfig.planDetails.items[count]
          .effectiveFinalNonRefundableAmountItem
      );

    CustomerRefundValue = await utility.upto2Decimal(CustomerRefundValue);
    if (flag === true)
      await console.log('Customer Refund Value is: ', CustomerRefundValue);
    return CustomerRefundValue;
  }

  //find max value
  async max(
    NonRefundabledeposit: number,
    NonRefundableAmount_refundPolicy: number
  ) {
    return Math.max(NonRefundabledeposit, NonRefundableAmount_refundPolicy);
  }

  //find out the refunable amount according to the applied policy
  async nonRefundableAmount_refundPolicy(
    refundablePercentage: number,
    totalPrice: number,
    flag: boolean
  ) {
    const refunadable_amount: number = await utility.upto2Decimal2(
      totalPrice * (refundablePercentage / 100)
    );
    if (flag === true)
      await console.log('Refundable Amount: ', refunadable_amount);
    let nonRefundableAmount: number = await utility.upto2Decimal2(
      totalPrice - refunadable_amount
    );
    nonRefundableAmount = await utility.upto2Decimal2(nonRefundableAmount);
    if (flag === true)
      await console.log('nonRefundable Amount: ', nonRefundableAmount);
    return nonRefundableAmount;
  }

  //find the policy & get percentage against the policy
  async getPercentageAgainstPolicy(
    policydays: any,
    percentage: any,
    policyDay: any
  ) {
    for (let i = 0; i <= policydays.length; i++) {
      if (policyDay == policydays[i]) {
        return percentage[i];
      }
    }
    return 0;
  }

  async calculateMilestoneDates(
    noOfDays: any,
    nonRefundAmount: any,
    description: any
  ) {
    const redemDate: any = expectedConfig.planDetails.items.find(
      (i) => i.description == description
    );
    // console.log('Item Redemption Date: ', redemDate.redemptionDate);
    const convertedRedemtionDate = await this.dateRightFormate(
      redemDate.redemptionDate
    );
    // console.log('Converted Redemtion Date: ', convertedRedemtionDate);
    const date = new Date(convertedRedemtionDate);
    // console.log('New Date:', date);
    // console.log('noOfDays: ', noOfDays);

    const reversedArray = await noOfDays.reverse();
    // console.log('Before Reverse: ', nonRefundAmount)
    const reverseNonRefundAmount = await nonRefundAmount.reverse();
    // console.log('reverseNonRefundAmount: ', reverseNonRefundAmount);
    reverseNonRefundAmount.shift(); // removing first index from array
    // console.log('reverseNonRefundAmount: ', reverseNonRefundAmount);
    await this.deriveDate(
      reversedArray,
      date,
      reverseNonRefundAmount,
      description
    );
  }

  async dateRightFormate(str: string) {
    const myArr: any = str.split('/');
    return myArr[2] + '/' + myArr[1] + '/' + myArr[0]; // yyyy//mm//dd
  }

  async deriveDate(noOfDays: any, endDate: any, refudArr: any, item: any) {
    const howThisIsCalculated: any = [];
    let i = 1;
    noOfDays.forEach((item: any, index: number) => {
      const a: any = 'milestoneDate' + i;
      const b: any = 'nonRefundableAmount' + i;
      const date = new Date(endDate);
      const milestoneDates = {
        [a]: new Date(date.setDate(date.getDate() - item)).toLocaleDateString(
          'default',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        ),
        [b]: refudArr[index],
      };
      i += 1;
      howThisIsCalculated.push(milestoneDates);
    });
    console.log('MileStone Dates: ', howThisIsCalculated);
    const product: any = expectedConfig.planDetails.items.find(
      (product: any) => product.description == item
    );
    Object.assign(product, { howThisIsCalculated });

    let path;
    if (expectedConfig.merchantDetails.checkoutCategory == 'submerchant') {
      path =
        'expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        expectedConfig.merchantDetails.sub_merchantName;
    } else {
      path =
        'expected/' +
        expectedConfig.planSummary.checkoutType +
        '/' +
        expectedConfig.merchantDetails.merchantName;
    }

    const data = await utility.readJsonFile(path + '/expected-values.json');
    data.planDetails.items = expectedConfig.planDetails.items;
    await utility.writeIntoJsonFile('expected-values', data, path);
  }

  async getExpectedItemIndex(itemTitle: any) {
    const totalItem = expectedConfig.planDetails.items.length;
    let i: number;
    for (i = 0; i < totalItem; i++) {
      if (
        await itemTitle.includes(
          String(expectedConfig.planDetails.items[i].description)
        )
      ) {
        return i;
      }
    }
    return undefined;
  }
}
