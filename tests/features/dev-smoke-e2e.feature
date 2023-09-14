Feature:  Smoke tests - Dev team

    Scenario: User registration
        Given I can successfully signup to the "<applicationName>" application with "<keepMeSignedIn>" keepMeSignedIn and "<isSubscribed>" isSubscribed
        Then I can carry out post validate operations on "<validationApplications>" on customer-portal
        Examples:
            | applicationName | validationApplications                                                                                  | keepMeSignedIn | isSubscribed |
            | customer-portal | customer-portal,customer-portal-profile,customer-portal-marketplace,AccountSetupSendWelcomeNotification | false          | false        |

    Scenario: Verify the creation of plan using checkout
        Given As a user I can navigate to the "<merchantName>" merchant on the "<applicationName>" application
        When I can successfully checkout items "<producItem>" with "<Quantity>" having "<redemptionDate>" date with currency "<checkoutCurrency>" and selected settings "<depositSetting>","<installmentType_checkout_widget>","<installmentType_checkout_summary>", "<InstalmentDay>" plan with a "<userCategory>" user with "<cardType>" card and verifying the booking "<validationApplications_onCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application
        Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

        Examples:
            | merchantName | applicationName  | producItem                   | Quantity | redemptionDate                  | depositSetting | installmentType_checkout_widget | installmentType_checkout_summary | InstalmentDay | userCategory | cardType   | validationApplications_onCheckout                                            | validationApplications_postCheckout                                                                                                                 | checkoutCurrency | checkoutType      | validationApplications_emails                                           |
            | Noraa Travel | merchant-testing | Airline flight$Hotel booking | 1,2      | 1/December/2024,1/November/2023 | min            | Weekly                          | Monthly                          | 30            | New          | MasterCard | price_preview_widget,price_preview_widget_2,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |

    Scenario: Assisted Checkout
        Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
        When I can successfully create a plan in "<currencyCode>" currency having "<redemptionDate>" date and "<planTotal>" plan total and selected settings "<depositSetting>","<installmentType>" and "<InstalmentDay>" plan with a "<userCategory>" user with "<cardType>" card and verifying the booking "<validationApplications_assistedCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application using "<policyType>"
        Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        Examples:
            | userRole       | merchantName  | applicationName   | currencyCode | redemptionDate | planTotal | depositSetting | installmentType | InstalmentDay | cardType | userCategory | validationApplications_assistedCheckout                                      | validationApplications_postCheckout                                                                                                                 | checkoutType      | validationApplications_emails                                           | policyType |
            | Merchant Admin | Ideyas Hotels | assisted-checkout | AUD          | 15/March/2024  | 3300.99   | default        | Monthly         | 12            | Visa     | Existing     | verify-userDetails,verify_payment_plan_details,verify-standard-refund-policy | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |

    Scenario: Pay Early Instalments at the plan level on the customer-portal
        Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
        When I can process on customer-portal "<nTransactions_UI>" payments using operation "<operation_type>" on for plans for "<merchantName>" merchant and verify "<screens>" using "<checkoutType>" checkout
        Then I can carry out post validate operations on "<validationApplications_postPayInstalment>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        Examples:
            | merchantName | customerUser | keepMeSignedIn | applicationName | nTransactions_UI | operation_type | screens                                                  | checkoutType      | validationApplications_postPayInstalment                                                                                                              | validationApplications_emails                           |
            | Noraa Travel |              | true           | customer-portal | 2                | pay-instalment | make-payment-popup,make-payment-review,payment-completed | customer-checkout | events-transactions-due-requested-succeeded,events-transactions-planChanged,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | CustomerAdvancePaymentSucceededSendCustomerNotification |



    Scenario: Update Cadence at the plan level
        Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
        When I can successfully update the plan cadence with "<cadenceOption>" with "<InstalmentDay>" for "<merchantName>" merchant and verify "<screens>" using "<checkoutType>" checkout
        Then I can carry out post validate operations on "<validationApplications_postUpdateCadence>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

        Examples:
            | merchantName | customerUser | keepMeSignedIn | applicationName | cadenceOption | InstalmentDay | screens                                             | validationApplications_postUpdateCadence                                     | checkoutType      | validationApplications_emails               |
            | Noraa Travel |              | true           | customer-portal | Fortnightly   | Saturday      | update-plan-overview,update-plan-recap,plan_updated | events-transactions-planChanged,customer-portal,merchant-portal,admin-portal | customer-checkout | CustomerPlanChangedSendCustomerNotification |


    #************************MANAGED************************
    Scenario: Perform n number of transaction for merchant checkout - Completed
        Then I can process using debug endpoint "<nTransactions_debug>" payments with "<finalStatus>" order status for the merchant "<merchantName>" using "<checkoutType>" checkout
        Then I can carry out post validate operations on "<validationApplicationstransaction>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        Then I can move the plan "<finalStatus>" status "<merchantName>" and "<checkoutType>"
        Then I can carry out post validate operations on "<validationApplicationsonPayable>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

        Examples:
            | merchantName | nTransactions_debug | finalStatus | validationApplicationstransaction                                                                           | checkoutType      | validationApplicationsonPayable              | validationApplications_emails                                                                                                |
            | Noraa Travel | 5                   | Completed   | events-transactions-planCompleted,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | customer-checkout | events-transactions-eligible-merchantPayable | CustomerPaymentSucceededSendCustomerNotification,PlanCompletedSendCustomerNotification,PlanCompletedSendMerchantNotification |


    Scenario: Cancelling a Plan
        Then As a Merchant, I can cancel the plan with "<cancellationReason>" "<finalCancellation>" reason for "<merchantName>" and verify "<screens>" using "<checkoutType>" checkout
        Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        Examples:
            | merchantName | screens                                                 | cancellationReason                             | finalCancellation                 | validationApplications_postCheckout                                      | checkoutType      | validationApplications_emails                                               |
            | Noraa Travel | cancellation_summary_popup,how_this_is_calculated_popup | We can no longer take this Booking/Reservation | Cancel and refund a custom amount | paymentHistory-planRefunded,customer-portal,merchant-portal,admin-portal | customer-checkout | PlanCancelledSendMerchantNotification,PlanCancelledSendCustomerNotification |


