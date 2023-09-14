Feature:  Testing on Preview links (WIP)

  ### https://github.com/Play-Travel/Planpay/pull/1792 MINT


  Scenario: Verify the creation of plan using checkout
    # Given As a user I can navigate to the "<merchantName>" merchant on the "<applicationName>" application
    # When I can successfully checkout items "<producItem>" with "<Quantity>" having "<redemptionDate>" date with currency "<checkoutCurrency>" and selected settings "<depositSetting>","<installmentType_checkout_widget>","<installmentType_checkout_summary>", "<InstalmentDay>" plan with a "<userCategory>" user with "<cardType>" card and verifying the booking "<validationApplications_onCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application
    Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
    # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
    Examples:
      | merchantName | applicationName  | producItem                                                                             | Quantity | redemptionDate                  | depositSetting | installmentType_checkout_widget | installmentType_checkout_summary | InstalmentDay | userCategory | cardType   | validationApplications_onCheckout                     | validationApplications_postCheckout                                                                                      | checkoutCurrency | checkoutType      | validationApplications_emails                                           |
      | Minty Hotels | merchant-testing | Superior Deluxe King Guest room 1 King$Superior Studio Twin Larger Guest room 2 Double | 1,2      | 1/December/2023,1/November/2024 | random         | Weekly                          | Monthly                          | 30            | New          | MasterCard | price_preview_widget,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |


### https://github.com/Play-Travel/Planpay/pull/1898 Payment Links - Phase 2
  Scenario: Verify the creation of plan using checkout

       Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
        When I can successfully create a plan in "<currencyCode>" currency having "<redemptionDate>" date and "<planTotal>" plan total and selected settings "<depositSetting>","<installmentType>" and "<InstalmentDay>" plan with a "<userCategory>" user using "<paymentMethod>" using "<cardType>" card and verifying the booking "<validationApplications_assistedCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application using "<policyType>"
        Then I can carry out post validate operations on "<validationApplications_postAssistedCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        Examples:
            | userRole            | merchantName | applicationName   | currencyCode | redemptionDate  | planTotal | depositSetting | installmentType | InstalmentDay | cardType | paymentMethod |userCategory | validationApplications_assistedCheckout                                                                             | validationApplications_postAssistedCheckout                                                                                                                 | checkoutType      | validationApplications_emails                                           | policyType |
            #Payment through Payment-Link
            # | Merchant Agent       | Ovolo Hotels | assisted-checkout | AUD          | 15/January/2024 | 3300      | default        | Weekly          | Wednesday     | Visa    |  payment-Link  | Existing        | verify-userDetails,verify_payment_plan_details,verify-standard-refund-policy,payment-link-summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |

            #Payment through Process-Manually
            #New User
            | Merchant Agent       | Noraa Travel | assisted-checkout | AUD          | 11/March/2024 | 5000      | default        | Weekly          | Monday     | Visa    |  process-payment-manually  | New        | verify-userDetails,verify_payment_plan_details,email-verification,verify-standard-refund-policy               | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |

            #Existing User
            | Merchant Agent       | Noraa Travel | assisted-checkout | AUD          | 11/March/2024 | 5000      | default        | Weekly          | Monday     | Visa    |  process-payment-manually  | Existing   | verify-userDetails,verify_payment_plan_details,verify-standard-refund-policy                                  | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |

