Feature: Customer portal

    @SmokeTest
    Scenario: User registration
        Given I can successfully signup to the "<applicationName>" application with "<keepMeSignedIn>" keepMeSignedIn and "<isSubscribed>" isSubscribed
     #   Then I can carry out post validate operations on "<validationApplications>" on customer-portal
        Examples:
            | applicationName | validationApplications | keepMeSignedIn | isSubscribed |
            | customer-portal | customer-portal        | false          | true         |
    #  | customer-portal | customer-portal,customer-portal-profile,customer-portal-marketplace,AccountSetupSendWelcomeNotification | false          | false        |

    Scenario: Customer Portal Password Reset and login with new password
        Given I can successfully reset my password for "<planPayUser>" on "<applicationName>" application
        Then I can carry out post validate operations on "<validationApplications>" on customer-portal
        Examples:
            | planPayUser | applicationName | validationApplications                              |
            |             | customer-portal | customer-portal-profile,customer-portal-marketplace |

    Scenario: Accessing orders on customer portal
        Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
        When I can successfully verify the order details on "<tabName>" tab and "<screenName>"
        Then As a user I can successfully logout
        Examples:
            | merchantName    | customerUser | keepMeSignedIn | applicationName | tabName                      | screenName      | checkoutType      |
            | Shonrate Hotels |              | true           | customer-portal | All orders,Upcoming-Payments | Summary,Details | customer-checkout |
            | Noraa Travel    |              | true           | customer-portal | Upcoming-Payments            | Summary,Details | customer-checkout |
            | Ovolo Hotels    |              | true           | customer-portal | All orders                   | Summary,Details | customer-checkout |

    Scenario:Adding payment methods at the plan level
        Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
        When I can successfully add "<paymentMethods>" with card status "<cardStatus>" for "<planIDs>" plans for "<merchantName>" merchant using "<checkoutType>" checkout
        Then As a user I can successfully logout
        Examples:
            | merchantName    | customerUser | keepMeSignedIn | applicationName | cardStatus | paymentMethods | planIDs | checkoutType      |
            # Stripe
            | Shonrate Hotels |              | true           | customer-portal | decline    | Visa           | All     | customer-checkout |
            # BrainTree
            | Ideyas Hotels   |              | true           | customer-portal | decline    | Visa           | All     | customer-checkout |
            # Ayden
            | Leinad Hotels   |              | true           | customer-portal | decline    | Visa           | All     | customer-checkout |


    Scenario: Updating Customer User Profile
        Given As a "<customerUser>" Customer portal user having "<keepMeSignedIn>" keepMeSignedIn setting I can successfully login to the "<applicationName>" application for the merchant "<merchantName>" using "<checkoutType>" checkout
        Then I can successfully "<operationName>" profile details by updating the "<fieldName>"
        Then I can carry out post validate operations on "<validationApplications>" on customer-portal
        Examples:
            | merchantName    | customerUser | keepMeSignedIn | applicationName | operationName | fieldName                                                 | validationApplications                                                                                                                    | checkoutType      |
            | Shonrate Hotels |              | true           | customer-portal | edit          | customer_firstName,customer_lastName,phone,password,email | customer-portal-profile,passwordUpdatedSendCustomerNotification,emailUpdatedSendCustomerNotification,emailChangedSendCustomerNotification | customer-checkout |

