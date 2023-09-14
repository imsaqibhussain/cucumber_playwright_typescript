import { Given, When } from '@cucumber/cucumber';
import { databaseConnectDisconnect } from '../page-objects/backend-configuration/database-connect-disconnect';
import { CreateCheckoutSession } from '../page-objects/backend-configuration/CreateCheckoutSession';
const dbconnection = new databaseConnectDisconnect();
const CreateCheckout = new CreateCheckoutSession();

When(
  'I can fetch all the details of a user {string}',
  async function (emailAddress) {
    await dbconnection.getCustomerDetails(emailAddress);
  }
);

When('I can fetch the user email from {string} ID', async function (planId) {
  await dbconnection.getEmailAddress(planId);
});

When('I can fetch the details of a {string}', async function (planID) {
  await dbconnection.getPlanDetails(planID);
});

When('I can fetch all the transaction data in the database', async function () {
  await dbconnection.allTransactions();
});

Given(
  'I can successfully execute {string} checkout on {string} {string} items {string} with {string} having {string} date',
  async function (
    apiCallName,
    merchantName,
    nItems,
    sku,
    quantity,
    redemptionDate
  ) {
    if (apiCallName == 'create-checkout-session') {
      await CreateCheckout.CreateCheckoutSession(
        apiCallName,
        merchantName,
        nItems,
        sku,
        quantity,
        redemptionDate
      );
    } else if (apiCallName == 'create-checkout') {
      await CreateCheckout.CreateCheckout(apiCallName);
    } else if (apiCallName == 'get-checkout') {
      await CreateCheckout.GetCheckout(apiCallName);
    }
  }
);
