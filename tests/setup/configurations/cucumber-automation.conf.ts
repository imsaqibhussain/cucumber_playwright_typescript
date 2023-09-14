// import { browser, Config } from "protractor";
// import { Reporter } from "./tests/features/support/reporter";
// const jsonReports = process.cwd() + '/e2e/reports/json';

export const config: Config = {
  //seleniumAddress: "http://127.0.0.1:9229/wd/hub",
  SELENIUM_PROMISE_MANAGER: false,
  //baseUrl: "https://www.google.com",

  directConnect: true,
  capabilities: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      useAutomationExtension: false,
      args: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
    },
  },
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  specs: ['./features/**/*.feature'],
  allScriptsTimeout: 120000,
  onPrepare: () => {
    // browser.waitForAngularEnabled(false);
    // browser.driver.manage().window().setSize(1280, 1050);
    // Reporter.createDirectory(jsonReports);
  },
  cucumberOpts: {
    compiler: 'ts:ts-node/register',
    format: 'json:e2e/reports/json/cucumber_report.json',
    require: [
      './features/step_definitions/**/*.js',
      './features/support/hooks.js',
    ],
    strict: true,
    ignoreUncaughtExceptions: true,
  },
  onComplete: () => {
    // Reporter.createHTMLReport();
  },
  params: {
    email: 'planpaytestingautomation0000@mailinator.com',
  },
};
