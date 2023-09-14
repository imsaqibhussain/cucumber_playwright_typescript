Feature: Admin portal


  Scenario:  Create New Merchant
    Given As an "<userRole>" admin user for "<merchantName>" I can successfully login to the "<applicationName>" application
    When I can successfully "<operationName>" a merchant in country "<merchantCountry>" with a "<groupStatus>" group with "<defaultPaymentdeadline>" defaultPaymentdeadline setting, "<depositType>" deposit type and "<depositValue>" value, "<serviceFeePercentage>" serviceFees, "<markUpFeePercentage>" markUpFeePercentage and "<transactionFeeIncludedSalesTax>" transactionFeeIncludedSalesTax
    When I can successfully "<operationName>" "<nSubmerchants>" sub-merchant in country "<merchantCountry>"
    When I can successfully "<operationName>" a new "<gateWayVendor>" Payment Gateway with "<gatewayCurrency>" currency
    When I can successfully "<operationName>" merchant Payment Platform with currency "<gatewayCurrency>" to the gateway
    Then I can carry out post validate operations on "<validationApplications>" on "<applicationName>"
    Examples:
      | userRole      | merchantName | nSubmerchants | merchantCountry | applicationName | operationName | groupStatus | defaultPaymentdeadline | serviceFeePercentage | depositType | depositValue | markUpFeePercentage | transactionFeeIncludedSalesTax | gateWayVendor | gatewayCurrency | validationApplications                                        |
      | PlanPay Admin | Admin Portal | 2             | United Kingdom  | admin-portal    | create        | New         | 30                     | 3                    | Currency    | 3            | 5                   | 12                             | BrainTree     | GBP             | merchant-details,submerchants-details,payment-gateway-details |

# Scenario:  Download Plans and transaction Report
#   Given As a user with Role "<userRole>" for "<merchantName>" I can successfully login to the "<applicationName>" application
#   When I can successfully download "<reportName>" from "<startDate>" to "<endDate>"
#   Examples:
#     | userRole      | merchantName | applicationName | reportName         | startDate      | endDate        |
#     | PlanPay Admin | Admin Portal | admin-portal    | plansReport        | 15/August/2023 | 22/August/2023 |
#     | PlanPay Admin | Admin Portal | admin-portal    | transactionsReport | 15/August/2023 | 22/August/2023 |
#     | PlanPay Admin | Admin Portal | admin-portal    | plansReport        | 15/August/2023 | 22/August/2023 |
#     | PlanPay Admin | Admin Portal | admin-portal    | transactionsReport | 15/August/2023 | 22/August/2023 |
