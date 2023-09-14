Feature:  Smoke Tests- QA team
    # Scenario: User registration
    #     Given I can successfully signup to the "<applicationName>" application with "<keepMeSignedIn>" keepMeSignedIn and "<isSubscribed>" isSubscribed
    #     Then I can carry out post validate operations on "<validationApplications>" on customer-portal
    #     Examples:
    #         | applicationName | validationApplications                                                                                  | keepMeSignedIn | isSubscribed |
    #         | customer-portal | customer-portal,customer-portal-profile,customer-portal-marketplace,AccountSetupSendWelcomeNotification | false          | false        |

    Scenario: Verify the creation of plan using checkout
        Given As a user I can navigate to the "<merchantName>" merchant on the "<applicationName>" application
        When I can successfully checkout items "<producItem>" with "<Quantity>" having "<redemptionDate>" date with currency "<checkoutCurrency>" and selected settings "<depositSetting>","<installmentType_checkout_widget>","<installmentType_checkout_summary>", "<InstalmentDay>" plan with a "<userCategory>" user with "<cardType>" card and verifying the booking "<validationApplications_onCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application
        Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
        # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

        Examples:
            | merchantName  | applicationName  | producItem                                                                                                                                          | Quantity | redemptionDate                               | depositSetting | installmentType_checkout_widget | installmentType_checkout_summary | InstalmentDay | userCategory | cardType   | validationApplications_onCheckout                                            | validationApplications_postCheckout                                                                                                                 | checkoutCurrency | checkoutType      | validationApplications_emails                                           |
            ##Stripe Payment Gateway - Managed
            | Noraa Travel  | merchant-testing | Airline flight$Hotel booking                                                                                                                        | 1,2      | 4/December/2023,1/November/2023              | random         | Fortnightly                     | Monthly                          | 30            | New          | American   | price_preview_widget,price_preview_widget_2,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |
            ##Stripe Payment Gateway - Enterprise
            | ROTVIC Hotels | merchant-testing | Superior Deluxe Twin Guest room 2 Twin/Single Bed(s)$Superior Studio Twin Larger Guest room 2 Double$Club King Club lounge access Guest room 1 King | 1,1,1    | 1/August/2024,23/December/2023,25/March/2024 | default        | Weekly                          | Fortnightly                      | Monday        | Existing     | Visa       | price_preview_widget,price_preview_widget_2,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal                            | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |
            ## Adyen Payment Gateway
            | Leinad Hotels | merchant-testing | Superior Deluxe King Guest room 1 King$Superior Studio Twin Larger Guest room 2 Double                                                              | 1,2      | 21/December/2023,5/November/2024             | max            | Fortnightly                     | Weekly                           | Thursday      | Existing     | MasterCard | price_preview_widget,price_preview_widget_2,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal                            | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |
            ## Mint Payment Gateway
            | Minty Hotels  | merchant-testing | Superior Deluxe King Guest room 1 King$Superior Studio Twin Larger Guest room 2 Double                                                              | 1,2      | 22/December/2023,1/November/2024             | min            | Weekly                          | Monthly                          | 30            | Existing     | MasterCard | price_preview_widget,price_preview_widget_2,checkout_widget,checkout_summary | events-transactions-planCreated,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal                            | AUD              | customer-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification |

# Scenario: Assisted Checkout
#     Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
#     When I can successfully create a plan in "<currencyCode>" currency having "<redemptionDate>" date and "<planTotal>" plan total and selected settings "<depositSetting>","<installmentType>" and "<InstalmentDay>" plan with a "<userCategory>" user with "<cardType>" card and verifying the booking "<validationApplications_assistedCheckout>" on applications for the merchant "<merchantName>" on "<applicationName>" application using "<policyType>"
#     Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Examples:
#         | userRole       | merchantName  | applicationName   | currencyCode | redemptionDate  | planTotal | depositSetting | installmentType | InstalmentDay | cardType | userCategory | validationApplications_assistedCheckout                                                         | validationApplications_postCheckout                                                                                                                 | checkoutType      | validationApplications_emails                                           | policyType |
#         | Merchant Agent | Enad Hotels   | assisted-checkout | AUD          | 15/January/2024 | 4000.34   | default        | Weekly          | Friday        | Visa     | New          | verify-userDetails,email-verification,verify_payment_plan_details,verify-standard-refund-policy | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |
#         | Merchant Admin | Ideyas Hotels | assisted-checkout | AUD          | 15/March/2024   | 3300.99   | default        | Monthly         | 12            | Visa     | Existing     | verify-userDetails,verify_payment_plan_details,verify-standard-refund-policy                    | events-transactions-planCreated,events-transactions-due-requested-succeeded,paymentHistory-planCreated,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCreatedSendMerchantNotification,PlanCreatedSendCustomerNotification | Standard   |


# Scenario: Pay Early Instalments at the plan level on the customer-portal
#     Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
#     When I can process on customer-portal "<nTransactions_UI>" payments using operation "<operation_type>" on for plans for "<merchantName>" merchant and verify "<screens>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_postPayInstalment>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Examples:
#         | merchantName  | customerUser | keepMeSignedIn | applicationName | nTransactions_UI | operation_type | screens                                                  | checkoutType      | validationApplications_postPayInstalment                                                                                                              | validationApplications_emails                           |
#         #         #         #         # # #    Assisted-checkout # # #
#         # | Enad Hotels   |              | true           | customer-portal | 2                | pay-instalment | make-payment-popup,make-payment-review,payment-completed | assisted-checkout | events-transactions-due-requested-succeeded,events-transactions-planChanged,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | CustomerAdvancePaymentSucceededSendCustomerNotification |
#         # # | Ideyas Hotels |              | true           | customer-portal | 1                | pay-instalment | make-payment-popup,make-payment-review,payment-completed | assisted-checkout | events-transactions-due-requested-succeeded,events-transactions-planChanged,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | CustomerAdvancePaymentSucceededSendCustomerNotification |
#         # # # #         # # #    Customer-checkout # # #
#         # | Noraa Travel  |              | true           | customer-portal | 2                | pay-instalment | make-payment-popup,make-payment-review,payment-completed | customer-checkout | events-transactions-due-requested-succeeded,events-transactions-planChanged,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | CustomerAdvancePaymentSucceededSendCustomerNotification |
#         | ROTVIC Hotels |              | true           | customer-portal | 1                | pay-instalment | make-payment-popup,make-payment-review,payment-completed | customer-checkout | events-transactions-due-requested-succeeded,events-transactions-planChanged,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | CustomerAdvancePaymentSucceededSendCustomerNotification |



# Scenario: Update Cadence at the plan level
#     Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
#     When I can successfully update the plan cadence with "<cadenceOption>" with "<InstalmentDay>" for "<merchantName>" merchant and verify "<screens>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_postUpdateCadence>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

#     Examples:
#         | merchantName  | customerUser | keepMeSignedIn | applicationName | cadenceOption | InstalmentDay | screens                                             | validationApplications_postUpdateCadence                                     | checkoutType      | validationApplications_emails               |
#         # # #    Assisted-checkout # # #
#         | Enad Hotels   |              | true           | customer-portal | Monthly       | 30            | update-plan-overview,update-plan-recap,plan_updated | events-transactions-planChanged,customer-portal,merchant-portal,admin-portal | assisted-checkout | CustomerPlanChangedSendCustomerNotification |
#         | Ideyas Hotels |              | true           | customer-portal | Monthly       | 30            | update-plan-overview,update-plan-recap,plan_updated | events-transactions-planChanged,customer-portal,merchant-portal,admin-portal | assisted-checkout | CustomerPlanChangedSendCustomerNotification |
#         # # #    Customer-checkout # # #
#         | Noraa Travel  |              | true           | customer-portal | Fortnightly   | Saturday      | update-plan-overview,update-plan-recap,plan_updated | events-transactions-planChanged,customer-portal,merchant-portal,admin-portal | customer-checkout | CustomerPlanChangedSendCustomerNotification |
#         | ROTVIC Hotels |              | true           | customer-portal | Fortnightly   | Saturday      | update-plan-overview,update-plan-recap,plan_updated | events-transactions-planChanged,customer-portal,merchant-portal,admin-portal | customer-checkout | CustomerPlanChangedSendCustomerNotification |

# Scenario: Process Overdue transactions using debug endpoint
#     When I can successfully add "<paymentMethods_before>" with card status "<cardStatus>" for "<planIDs>" plans for "<merchantName>" merchant using "<checkoutType>" checkout
#     # Then I can process using debug endpoint "<nTransactions_debug>" payments with "<finalStatus>" order status for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_postCheckout_before>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # When I can successfully add "<paymentMethods_after>" with card status "<cardStatus_after>" for "<planIDs>" plans for "<merchantName>" merchant using "<checkoutType>" checkout
#     # Then I can process "<latePayments>" late payments for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_postCheckout_after>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Examples:
#         | merchantName | cardStatus | paymentMethods_before | planIDs | nTransactions_debug | finalStatus | validationApplications_postCheckout_before                                             | validationApplications_postCheckout_after                                                                             | paymentMethods_after | cardStatus_after | latePayments | validationApplicationstransaction_late | checkoutType      | validationApplications_emails                    |
#         # # #    Assisted-checkout # # #
#         | Enad Hotels  | decline    | Visa                  |         | 1                   | Late        | CustomerPaymentFailedSendCustomerNotification,events-transactions-due-requested-failed | events-transactions-due-requested-succeeded,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | American             | valid            | 1            | Merchant-portal                        | assisted-checkout | CustomerPaymentSucceededSendCustomerNotification |
# # #    Customer-checkout # # #
#         | Noraa Travel  | decline    | Visa                  |         | 1                   | Late        | CustomerPaymentFailedSendCustomerNotification,events-transactions-due-requested-failed | events-transactions-due-requested-succeeded,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | American             | valid            | 1            | Merchant-portal                        | customer-checkout | CustomerPaymentSucceededSendCustomerNotification |

#************************MANAGED************************
# Scenario: Perform n number of transaction for merchant checkout - Completed
#     Then I can process using debug endpoint "<nTransactions_debug>" payments with "<finalStatus>" order status for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplicationstransaction>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can move the plan "<finalStatus>" status "<merchantName>" and "<checkoutType>"
#     Then I can carry out post validate operations on "<validationApplicationsonPayable>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout

#     Examples:
#         | merchantName  | nTransactions_debug | finalStatus | validationApplicationstransaction                                                                           | checkoutType      | validationApplicationsonPayable              | validationApplications_emails                                                                                                |
# #         # # #    Assisted-checkout # # #
# #         | Enad Hotels   | 5                   | Completed   | events-transactions-planCompleted,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | assisted-checkout | events-transactions-eligible-merchantPayable | CustomerPaymentSucceededSendCustomerNotification,PlanCompletedSendCustomerNotification,PlanCompletedSendMerchantNotification |
# #         # # #    Customer-checkout # # #
#         | Noraa Travel  | 5                   | Completed   | events-transactions-planCompleted,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal | customer-checkout | events-transactions-eligible-merchantPayable | CustomerPaymentSucceededSendCustomerNotification,PlanCompletedSendCustomerNotification,PlanCompletedSendMerchantNotification |

#************************ENTERPRISE************************
# Scenario: Perform n number of transaction for merchant checkout - Completed
#     Then I can process using debug endpoint "<nTransactions_debug>" payments with "<finalStatus>" order status for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplicationstransaction>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can verify the transactions are balancing out for the "<plan>" or the merchant "<merchantName>" using "<checkoutType>" checkout

#     Examples:
#         | merchantName  | nTransactions_debug | finalStatus | validationApplicationstransaction                                                                           | plan | checkoutType      | validationApplications_emails                                                                                                |
#         # # #    Assisted-checkout # # #
#         | Ideyas Hotels | 5                   | Completed   | events-transactions-planCompleted,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal |  ALL | assisted-checkout |   CustomerPaymentSucceededSendCustomerNotification,PlanCompletedSendCustomerNotification,PlanCompletedSendMerchantNotification |
#         # # #    Customer-checkout # # #
#         | ROTVIC Hotels | 5                   | Completed   | events-transactions-planCompleted,paymentHistory-payInstalment,customer-portal,merchant-portal,admin-portal |  ALL | customer-checkout |   CustomerPaymentSucceededSendCustomerNotification,PlanCompletedSendCustomerNotification,PlanCompletedSendMerchantNotification |


# Scenario: Cancelling a Plan
#     # Then As a Merchant, I can cancel the plan with "<cancellationReason>" "<finalCancellation>" reason for "<merchantName>" and verify "<screens>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_postCheckout>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     # Then I can carry out post validate operations on "<validationApplications_emails>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Examples:
#         | merchantName  | screens                                                 | cancellationReason                             | finalCancellation                 | validationApplications_postCheckout                                                                        | checkoutType      | validationApplications_emails                                               |
# #         # # #    Assisted-checkout # # #
# #         | Enad Hotels   | cancellation_summary_popup,how_this_is_calculated_popup | Customer requested to cancel                   | Cancel and refund a custom amount | events-transactions-planCancelled,paymentHistory-planRefunded,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCancelledSendMerchantNotification,PlanCancelledSendCustomerNotification |
# #         | Ideyas Hotels | cancellation_summary_popup,how_this_is_calculated_popup | Customer requested to cancel                   | Cancel with full refund           | events-transactions-planCancelled,paymentHistory-planRefunded,customer-portal,merchant-portal,admin-portal | assisted-checkout | PlanCancelledSendMerchantNotification,PlanCancelledSendCustomerNotification |
# #         # # #    Customer-checkout # # #
#         | Noraa Travel  | cancellation_summary_popup,how_this_is_calculated_popup | We can no longer take this Booking/Reservation | Cancel and refund a custom amount | paymentHistory-planRefunded,customer-portal,merchant-portal,admin-portal | customer-checkout | PlanCancelledSendMerchantNotification,PlanCancelledSendCustomerNotification |
# #         | ROTVIC Hotels | cancellation_summary_popup,how_this_is_calculated_popup | We can no longer take this Booking/Reservation | Cancel with full refund           | events-transactions-planCancelled,paymentHistory-planRefunded,customer-portal,merchant-portal,admin-portal | customer-checkout | PlanCancelledSendMerchantNotification,PlanCancelledSendCustomerNotification |


# Scenario: Merchant Re-try for Managed
#     When I can successfully add "<paymentMethods_before>" with card status "<cardStatus>" for "<planIDs>" plans for "<merchantName>" merchant using "<checkoutType>" checkout
#     Then I can process using debug endpoint "<nTransactions_debug>" payments with "<finalStatus>" order status for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_postCheckout_before>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     When As a Merchant, I can retry the failed transactions for the "<planIDs>" plan for "<merchantName>"  using "<checkoutType>" checkout
#     When I can successfully add "<paymentMethods_after>" with card status "<cardStatus_after>" for "<planIDs>" plans for "<merchantName>" merchant using "<checkoutType>" checkout
#     Then I can process "<latePayments>" late payments for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Then I can carry out post validate operations on "<validationApplications_postCheckout_after>" on applications for the merchant "<merchantName>" using "<checkoutType>" checkout
#     Examples:
#         | merchantName | cardStatus | paymentMethods_before | planIDs | nTransactions_debug | finalStatus | validationApplications_postCheckout_before | validationApplications_postCheckout_after | paymentMethods_after | cardStatus_after | latePayments | validationApplicationstransaction_late | checkoutType |
#         # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
#         # %%%%%%%%%%%%%%%%%%%%%%%%% Assisted Checkout Managed Hotels   %%%%%%%%%%%%%%%%%%%%%%%%%
#         # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#         | Enad Hotels   | decline | Visa |  | 1 | Late | CustomerPaymentFailedSendCustomerNotification,events-transactions-due-requested-failed | CustomerPaymentSucceededSendCustomerNotification,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal | Visa | valid | 1 | Merchant-portal | assisted-checkout |
#         | Ideyas Hotels | decline | Visa |  | 1 | Late | CustomerPaymentFailedSendCustomerNotification,events-transactions-due-requested-failed | CustomerPaymentSucceededSendCustomerNotification,events-transactions-due-requested-succeeded,customer-portal,merchant-portal,admin-portal | Visa | valid | 1 | Merchant-portal | assisted-checkout |

#  Scenario: Verify payment Methods added at Checkout
#     Given As a user I can navigate to the "<merchantName>" merchant on the "<applicationName>" application
#     When I can successfully checkout items "<producItem>" with "<Quantity>" having "<redemptionDate>" date with "<checkoutCurrency>" and selected settings "<depositSetting>","<installmentType_checkout_widget>","<installmentType_checkout_summary>", "<InstalmentDay>" plan with a "<userCategory>" user with "<defaultCardType>" card and additional "<paymentMethods>" for "<merchantName>" and "<checkoutType>"
#     Examples:
#       | merchantName  | applicationName  | producItem                                                                                  | Quantity | redemptionDate                  | depositSetting | installmentType_checkout_widget | installmentType_checkout_summary | InstalmentDay | userCategory | defaultCardType | paymentMethods | checkoutCurrency | checkoutType      |
#       | Noraa Travel    | merchant-testing | Airline flight$Hotel booking                                                                | 1,2      | 15/December/2024,10/October/2024 | max            | Fortnightly                     | Monthly                          | 30            | New     | Visa            | American,MasterCard | AUD |   customer-checkout   |
#       | ROTVIC Hotels   | merchant-testing | Superior Deluxe King Guest room 1 King$Superior Deluxe Twin Guest room 2 Twin/Single Bed(s) | 1,1      | 15/November/2023,15/December/23  | default        | Weekly                          | Monthly                          | 28            | New     | MasterCard      | Visa,American       | AUD |   customer-checkout   |

