Feature: Database connectivity

  Scenario: Verifying the Finance data for all transactions in the database
    When I can fetch all the transaction data in the database

  Scenario: Get User Info and Write to config file
    Given As a PlanPay User, I can get all "<userId>" merchant User Info
    Examples:
      | userId       |
      | b64e71ac1c68 |
      | d0ee0aea1c68 |
      | 0e59f7041c69 |

  Scenario: Fetch User details on Plan Creation using database
    When I can fetch all the details of a user "<emailAddress>"
    Examples:
      | emailAddress                                |
      | planpaytestingautomation2152@mailinator.com |

#  Scenario: create-checkout-session API Run
#     Given I can successfully execute '<apiCallName>' checkout on '<merchantName>' '<nItems>' items '<sku>' with '<quantity>' having '<redemptionDate>' date
#     Examples:
#     | apiCallName            |merchantName   |  nItems | quantity | sku          |  redemptionDate|
#   # | create-checkout-session| Noora Wedding | 2       | 2,3      |WD2134,WV1234 | 2023-12-18,2023-12-18|
#   # | create-checkout        | Noora Wedding | 2       | 1,1      |WD2134,WV1234 | 2023-12-18,2023-12-18|
#     | get-checkout        | Noora Wedding | 2       | 1,1      |WD2134,WV1234 | 2023-12-18,2023-12-18|


# Scenario: Fetch the email address from planID
#   When I can fetch the user email from "<planId>" ID
#   Examples:
#     | planId       |
#     | 524i8ztnvtze |


# Scenario: Reading Plan Details From Plan Table
#   When I can fetch the details of a '<planID>'
#   Examples:
#         | planID       |
#         | 33pvbyzsuzxp |
