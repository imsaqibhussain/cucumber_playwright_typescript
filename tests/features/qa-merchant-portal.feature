Feature: Merchant portal

  Scenario: Login logout to merchant portal
    Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
    When I can successfully search based on the "<fieldValue>" value on the merchant Portal application and "<verifyOperation>" verify
    Then As a merchant I can successfully logout from application
    Examples:
      | applicationName | merchantName    | userRole       | fieldValue                                  | verifyOperation |
      | merchant-portal | Enad Hotels     | Merchant Agent | ukhrzyt45t31                                | true            |
      | merchant-portal | Noraa Travel    | Merchant Agent | yrcmpny-123-abcsdha9gck65e5                 | true            |
      | merchant-portal | Ovolo Hotels    | Merchant Agent | planpaytestingautomation4903@mailinator.com | true            |
      | merchant-portal | Shonrate Hotels | Merchant Agent | planpaytesting_firstNameGmDH                | true            |
      | merchant-portal | YapNalp Hotels  | Merchant Agent | ukhrzyt45t31                                | true            |
      | merchant-portal | Ideyas Hotels   | Merchant Agent | yrcmpny-123-abcsdha9gck65e5                 | true            |
      | merchant-portal | ROTVIC Hotels   | Merchant Agent | planpaytesting_firstNameGmDH                | true            |

  Scenario: I can verify the details of a plan on the portal
    Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
    When I can verify the "<detailsScreen>" details for "<nPlans>" nOrders using "<checkoutType>" checkout
    Then As a merchant I can successfully logout from application
    Examples:
      | merchantName    | userRole       | applicationName | detailsScreen                                                                          | nPlans | checkoutType      |
      | Enad Hotels     | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | Noraa Travel    | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | Ovolo Hotels    | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | Shonrate Hotels | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | YapNalp Hotels  | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | Ideyas Hotels   | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | ROTVIC Hotels   | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |
      | Assilem Hotels  | Merchant Agent | merchant-portal | basicDetails,customerDetails,planDetails,paymentHistory,productSummary,refundMilestones | 2      | customer-checkout |


  # Scenario: Filter on Search based on Status value
  #   Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
  #   When I can successfully filter based on "<fieldValue>" value on the merchant Portal application and "<verifyOperation>" verify
  #   Then As a merchant I can successfully logout from application
  #   Examples:
  #     | applicationName | merchantName | userRole       | fieldValue  | verifyOperation |
  #     | merchant-portal | Enad Hotels  | Merchant Agent | On Schedule | true            |
  #     | merchant-portal | Enad Hotels  | Merchant Agent | On Schedule | true            |
  #     | merchant-portal | Enad Hotels  | Merchant Agent | On Schedule | true            |
  #     | merchant-portal | Enad Hotels  | Merchant Agent | Cancelled   | true            |
  #     | merchant-portal | Enad Hotels  | Merchant Agent | Late        | true            |

  #     | merchant-portal | Ovolo Hotels | Merchant Agent | Completed   | true |
  #     | merchant-portal | Ovolo Hotels | Merchant Agent | On Schedule | true |
  #     | merchant-portal | Ovolo Hotels | Merchant Agent | Cancelled   | true |
  #     | merchant-portal | Ovolo Hotels | Merchant Agent | Late        | true |
  #     | merchant-portal | Ovolo Hotels | Merchant Agent | Suspended   | true |

  #     | merchant-portal | Shonrate Hotels | Merchant Agent | Suspended   | true |
  #     | merchant-portal | Shonrate Hotels | Merchant Agent | Completed   | true |
  #     | merchant-portal | Shonrate Hotels | Merchant Agent | On Schedule | true |
  #     | merchant-portal | Shonrate Hotels | Merchant Agent | Cancelled   | true |
  #     | merchant-portal | Shonrate Hotels | Merchant Agent | Late        | true |
  #     | merchant-portal | Shonrate Hotels | Merchant Agent | Suspended   | true |