import 'dotenv/config';
import { Given, When } from '@cucumber/cucumber';
import { merchantConfig } from '../page-objects/backend-configuration/merchants-products-configuration';
const api = new merchantConfig();
import { databaseConnectDisconnect } from '../page-objects/backend-configuration/database-connect-disconnect';
const dbconnection = new databaseConnectDisconnect();

Given(
  'As a PlanPay User, I can get all  {string} {string} merchant info',
  { timeout: 80 * 1000 },
  async (merchantName, merchantId) => {
    console.log('merchant id from step file', merchantId);

    await api.getMerchnatDetails(merchantName, merchantId);
  }
);
Given(
  'As a PlanPay User, I can update {string} product info',
  { timeout: 80 * 1000 },
  async (merchantName) => {
    await api.updateMerchantProducts(merchantName);
  }
);

Given(
  'As a PlanPay User, I can get all {string} merchant User Info',
  { timeout: 80 * 1000 },
  async (merchantName) => {
    console.log('Fetching Merchant User Information ');
    await api.getMerchantUser(merchantName);
  }
);

When(
  'I can fetch all the configurations and update {string} {string} file',
  async function (merchantName, merchantId) {
    await dbconnection.getRefundPolicies(merchantName, merchantId);
  }
);

When(
  'I can fetch the currency details for  {string}',
  async function (currencyCode) {
    await dbconnection.getCurrencyDetails(currencyCode);
  }
);

When(
  'I can check for errors in the {string} table',
  async function (tableName) {
    console.log('table name ', tableName);
    await dbconnection.getEventProcessorErrors();
  }
);
