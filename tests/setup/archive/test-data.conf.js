const config = {
  LocalEnv: {
    env: '.dev', //.uat, PROD, .test
    verifyFlag: 'true',
  },

  merchant0: {
    Name: 'Merchant0',
    id: '62972bbf7919eb729da3c852',

    //Email: "planpayweddinguser1@yopmail.com",
    //Name: "Merchant 1",
    Email: 'planpayuser11@yopmail.com',
    DefaultPaymentDeadline: 'null',
    Products: ['Laptop', 'Sofa', 'Motorbike', 'Car', 'Holiday'],
    prelocator: '.MuiGrid-root > .css-j7qwjs > .MuiBox-root:nth-child(',
    postlocator: ') > .MuiCheckbox-root > .PrivateSwitchBase-input',
    globalMinimumDeposit: {
      unit: 'currency',
      value: 0,
    },
    merchantProducts: {
      Sofa: {
        minimumDeposit: {
          unit: 'percentage',
          value: 10,
        },
        DefaultPaymentDeadline: 5,
        description: 'Furniture',
      },
      Laptop: {
        minimumDeposit: {
          unit: 'currency',
          value: 1000,
        },
        DefaultPaymentDeadline: 10,
        description: 'Electronic',
      },
      Motorbike: {
        minimumDeposit: {
          unit: 'currency',
          value: 1000,
        },
        DefaultPaymentDeadline: 15,
        description: 'Vehicle',
      },
      Car: {
        minimumDeposit: {
          unit: 'percentage',
          value: 30,
        },
        DefaultPaymentDeadline: 20,
        description: 'Vehicle',
      },
      Holiday: {
        minimumDeposit: {
          unit: 'percentage',
          value: 50,
        },
        DefaultPaymentDeadline: 25,
        description: 'Holiday',
      },
    },
  },

  merchant1: {
    Name: 'Wedding Store',
    id: '62bd1b7e5e8b9a0007cf2a52',
    // Email: "planpayweddinguser1@yopmail.com",
    Email: 'alice@planpay.com.au',
    DefaultPaymentDeadline: 15,
    Products: [
      'Wedding dress',
      'Wedding veil',
      'Wedding crown',
      'Wedding shoes',
    ],
    globalMinimumDeposit: {
      unit: 'percentage',
      value: 10,
    },
    merchantProducts: {
      Weddingdress: {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Costume',
      },
      Weddingveil: {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Accessory',
      },
      Weddingcrown: {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Accessory',
      },
      Weddingshoes: {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Accessory',
      },
    },
  },

  merchant2: {
    Name: 'PlayTravel',
    id: '630880668a41691add29334d',
    Email: 'carmen.sandiego@planpay.com.au',
    DefaultPaymentDeadline: 30,
    Products: ['Airline flight', 'Hotel booking'],
    globalMinimumDeposit: {
      unit: 'percentage',
      value: 20,
    },

    merchantProducts: {
      Airlineflight: {
        minimumDeposit: {
          unit: 'percentage',
          value: 50,
        },
        DefaultPaymentDeadline: 30,
        description: 'Airline flight',
      },
      Hotelbooking: {
        minimumDeposit: {
          unit: 'currency',
          value: 250,
        },
        DefaultPaymentDeadline: 10,
        description: 'Hotel booking',
      },
    },
  },
  merchant3: {
    Name: 'Shonrate Hotels and Resorts',
    id: '631adba97bf3375479312c9e',
    Email: 'planpayhoteluser1@yopmail.com',
    DefaultPaymentDeadline: 30,
    Products: [
      'Superior Deluxe King, Guest room, 1 King',
      'Superior Deluxe Twin, Guest room, 2 Twin/Single Bed(s)',
      'Superior Studio Twin, Larger Guest room, 2 Double',
      'Club King, Club lounge access, Guest room, 1 King',
      'Presidential Suite, Club lounge access, High floor',
    ],
    prelocator: '.MuiGrid-root > .css-j7qwjs > .MuiBox-root:nth-child(',
    postlocator: ') > .MuiCheckbox-root > .PrivateSwitchBase-input',
    globalMinimumDeposit: {
      unit: 'currency',
      value: 200,
    },
    merchantProducts: {
      'SuperiorDeluxeKing,Guestroom,1King': {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Superior Deluxe King, Guest room, 1 King',
      },
      'SuperiorDeluxeTwin,Guestroom,2Twin/SingleBed(s)': {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Superior Deluxe Twin, Guest room, 2 Twin/Single Bed(s)',
      },
      'SuperiorStudioTwin,LargerGuestroom,2Double': {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Superior Studio Twin, Larger Guest room, 2 Double',
      },
      'ClubKing,Clubloungeaccess,Guestroom,1King': {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Club King, Club lounge access, Guest room, 1 King',
      },
      'PresidentialSuite,Clubloungeaccess,Highfloor': {
        minimumDeposit: {
          unit: 'null',
          value: 0,
        },
        DefaultPaymentDeadline: 'null',
        description: 'Presidential Suite, Club lounge access, High floor',
      },
    },
  },

  testCards: {
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
    },
    invalid: {
      Visa: {
        //Incorrect_number_decline
        cardnumber: '4242424242424241',
        Expiry: '11/28',
        CVC: '191',
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
  customer: {
    Email: 'planpayNextAutomation',
    firstName: 'planpayNext_firstName',
    lastName: 'planpayNext_lastName',
    phoneNumber: '+61345678999',
    billingAddress: 'testing billingAddress',
    suburb: 'testSuburb',
    state: 'testState',
    postCode: '2205',
  },

  Stripe: {},
};
// module.exports = config;
