export const config = {
  LocalEnv: {
    env: '.uat', //.uat, PROD, .test
    GSTPercentage: 10,
    verifyFlag: 'true',
    signUpDomain: '@mailinator.com',
    // signUpDomain : '@planpay.testinator.com'
  },
  customerPortal: {},

  testCards: {
    Stripe: {
      valid: {
        MasterCard: {
          //Valid Card
          cardnumber: '5555555555554444',
          Expiry: '11/28',
          CVC: '191',
        },
        Visa: {
          cardnumber: '4242424242424242',
          Expiry: '11/28',
          CVC: '191',
        },
        American: {
          cardnumber: '378282246310005',
          Expiry: '11/28',
          CVC: '191',
        },
        threeD_Visa: {
          cardnumber: '4000002500003155',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      invalid: {
        Visa: {
          //Incorrect_number_decline
          cardnumber: '4242424242424241',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      decline: {
        Visa: {
          // Decline after attaching
          cardnumber: '4000000000000341',
          Expiry: '11/28',
          CVC: '123',
        },
      },
      unsupported: {
        Discover: {
          // Invalid Card
          cardnumber: '6011111111111117',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      card_decline: {
        Visa: {
          //Generic_decline
          cardnumber: '4000000000000002',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Insufficient_funds_decline: {
        Visa: {
          //Insufficient_funds_decline
          cardnumber: '4000000000009995',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Lost_card_decline: {
        Visa: {
          //Lost_card_decline
          cardnumber: '4000000000009987',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Stolen_card_decline: {
        Visa: {
          //Stolen_card_decline
          cardnumber: '4000000000009979',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      expired_card: {
        Visa: {
          //Expired_card_decline
          cardnumber: '4000000000000069',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      incorrect_cvc: {
        Visa: {
          //Incorrect_cvc_decline
          cardnumber: '4000000000000127',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      processing_error: {
        Visa: {
          //Processing_error_decline
          cardnumber: '4000000000000119',
          Expiry: '11/28',
          CVC: '191',
        },
      },
    },
    Braintree: {
      valid: {
        MasterCard: {
          //Valid Card
          cardnumber: '5555555555554444',
          Expiry: '11/28',
          CVC: '191',
        },
        Visa: {
          cardnumber: '4111111111111111',
          Expiry: '11/28',
          CVC: '191',
        },
        American: {
          cardnumber: '378282246310005',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      invalid: {
        Visa: {
          //Incorrect_number_decline
          cardnumber: '4242424242424241',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      decline: {
        Visa: {
          // Decline after attaching
          cardnumber: '4000111111111115',
          Expiry: '11/28',
          CVC: '123',
        },
      },
      unsupported: {
        Discover: {
          // Invalid Card
          cardnumber: '6011000991300009',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      card_decline: {
        Visa: {
          //Generic_decline
          cardnumber: '4000111111111115',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Insufficient_funds_decline: {
        Visa: {
          //Insufficient_funds_decline
          cardnumber: '4000000000009995',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Lost_card_decline: {
        Visa: {
          //Lost_card_decline
          cardnumber: '4000000000009987',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Stolen_card_decline: {
        Visa: {
          //Stolen_card_decline
          cardnumber: '4000000000009979',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      expired_card: {
        Visa: {
          //Expired_card_decline
          cardnumber: '4000000000000069',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      incorrect_cvc: {
        Visa: {
          //Incorrect_cvc_decline
          cardnumber: '4000000000000127',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      processing_error: {
        Visa: {
          //Processing_error_decline
          cardnumber: '4000000000000119',
          Expiry: '11/28',
          CVC: '191',
        },
      },
    },
    // Adyen
    Adyen: {
      valid: {
        MasterCard: {
          //Valid Card
          cardnumber: '2222400070000005',
          Expiry: '03/30',
          CVC: '737',
        },
        Visa: {
          cardnumber: '4000620000000007',
          Expiry: '03/30',
          CVC: '737',
        },
        American: {
          cardnumber: '370000000000002',
          Expiry: '03/30',
          CVC: '7373',
        },
        threeD_Visa: {
          cardnumber: '4917610000000000',
          Expiry: '03/30',
          CVC: '737',
        },
      },
      invalid: {
        Visa: {
          //Incorrect_number_decline
          cardnumber: '4242424242424241',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      decline: {
        Visa: {
          // Decline after attaching
          cardnumber: '4000000000000341',
          Expiry: '11/28',
          CVC: '123',
        },
      },
      unsupported: {
        Discover: {
          // Invalid Card
          cardnumber: '6011111111111117',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      card_decline: {
        Visa: {
          //Generic_decline
          cardnumber: '4000000000000002',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Insufficient_funds_decline: {
        Visa: {
          //Insufficient_funds_decline
          cardnumber: '4000000000009995',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Lost_card_decline: {
        Visa: {
          //Lost_card_decline
          cardnumber: '4000000000009987',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      Stolen_card_decline: {
        Visa: {
          //Stolen_card_decline
          cardnumber: '4000000000009979',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      expired_card: {
        Visa: {
          //Expired_card_decline
          cardnumber: '4000000000000069',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      incorrect_cvc: {
        Visa: {
          //Incorrect_cvc_decline
          cardnumber: '4000000000000127',
          Expiry: '11/28',
          CVC: '191',
        },
      },
      processing_error: {
        Visa: {
          //Processing_error_decline
          cardnumber: '4000000000000119',
          Expiry: '11/28',
          CVC: '191',
        },
      },
    },
    // Mint
    Mint: {
      valid: {
        MasterCard: {
          cardnumber: '5555555555554444',
          Expiry: '11/25',
          CVC: '737',
        },
        Visa: {
          cardnumber: '4000000360000006',
          Expiry: '11/25',
          CVC: '737',
        },
      },
      invalid: {
        Visa: {
          cardnumber: '4000000000009987',
          Expiry: '11/25',
          CVC: '737',
        },
      },
      decline: {
        Visa: {
          cardnumber: '4000000000009987',
          Expiry: '11/25',
          CVC: '737',
        },
      },
    },
  },
  customer: {
    Email: 'planpaytestingautomation',
    firstName: 'planpaytesting_firstName',
    lastName: 'planpaytesting_lastName',
    phoneNumber: '+61345678999',
    billingAddress: 'testing billingAddress',
    suburb: 'testingSuburb',
    state: 'testingState',
    postCode: '2205',
  },
  merchants: {
    merchantName: 'Hotel',
    merchantEmail: 'merchantstestingautomation',
    merchantNumber: '+61345678999',
    merchantSupportEmail: 'merchantsupportautomation',
    customerSupportEmail: 'customersupportautomation',
    merchantPageUrl:
      'https://planpay-next.pr-582.nonprod.planpay.com.au/admin/merchants/create',
    staus: 'Active',
    merchantBillingAddress: 'merchant testing billingAddress',
    suburb: 'merchantTestingSuburb',
    state: 'testingState',
    city: 'Testing City',
    postCode: '2205',
    country: 'AUS',
    defaultMinimumDepositType: 'Currency',
    currencyCode: 'AUD',
    defaultRefundCurrencyCode: 'AUD',
    googleAnalyticId: 'UA-1234',
  },
};
