Feature: Pre-Validation set up


  Scenario: Get Merchant Info and Write to config file
    Given As a PlanPay User, I can get all  "<merchantName>" "<merchantId>" merchant info
    Given As a PlanPay User, I can update "<merchantName>" product info
    # Given As a PlanPay User, I can get all "<merchantName>" merchant User Info

    Examples:
      | merchantName    | merchantId   |
      | Enad Hotels     | 62972bbf7919 |
      | Ovolo Hotels    | 62bd1b7e5e8b |
      | Noraa Travel    | 630880668a41 |
      | Shonrate Hotels | 631adba97bf3 |
      | Rydges Hotels   | apgit66vzosi |
      | Atura Hotels    | u2bxn7leqclv |
      | YapNalp Hotels  | 000abcd00ef0 |
      |  Ideyas Hotels  | apgit66vzosi |
      | ROTVIC Hotels   | ffue5jqyrctz |
      | Assilem Hotels  | u2bxn7leqclv |
      | Leinad Hotels   | 796y21ttw000 |
      | Minty Hotels    | mw7n2hj3s36s |


    Scenario: Update merchant level prefund policies
       When I can fetch all the configurations and update '<merchantName>' '<merchantId>' file
       Examples:
         | merchantName    | merchantId   |
     | Enad Hotels     | 62972bbf7919 |
      | Ovolo Hotels    | 62bd1b7e5e8b |
      | Noraa Travel    | 630880668a41 |
      | Shonrate Hotels | 631adba97bf3 |
      | Rydges Hotels   | apgit66vzosi |
      | Atura Hotels    | u2bxn7leqclv |
      | YapNalp Hotels  | 000abcd00ef0 |
      |  Ideyas Hotels  | apgit66vzosi|
      | ROTVIC Hotels   | ffue5jqyrctz|
      | Assilem Hotels  | u2bxn7leqclv|



    Scenario: Fetch the currency details
      When I can fetch the currency details for  '<currencyCode>'
      Examples:
        | currencyCode |
        | AUD          |
        | USD          |
         | NZD          |

    Scenario: Fetch the eventProcessor details
      When I can check for errors in the '<tableName>' table
      Examples:
        | tableName |
        | EventProcessor         |

