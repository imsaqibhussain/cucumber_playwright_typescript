const reporter = require('cucumber-html-reporter');
const options = {
  theme: 'bootstrap',
  jsonFile: 'tests/report/report.json',
  output: 'tests/report/cucumber-html-report.html',
  reportSuiteAsScenaros: true,
  launchReport: true,
  screenshotsDirectory: 'screenshot/',
  storeScreenshots: true,
  metadata: {
    'App Version': '8.3.2',
    'Test Environment': 'SBX',
    Browser: 'Chrome  54.0.2840.98',
    Platform: 'Windows 10',
    Parallel: 'Scenarios',
    Executed: 'Remote',
  },
};
reporter.generate(options);
