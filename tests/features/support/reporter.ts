import * as reporter from 'cucumber-html-reporter';
import * as fs from 'fs';
// import * as mkdirp from 'mkdirp';
import * as path from 'path';

const jsonReports = path.join(process.cwd(), 'e2e/reports/json'); //process.cwd() returns the current working directory,
const htmlReports = path.join(process.cwd(), 'e2e/reports/html');
const targetJson = jsonReports + '/cucumber_report.json';
const currentTime = new Date();

const cucumberReporterOptions: any = {
  jsonFile: targetJson,
  output: htmlReports + '/' + currentTime.getTime() + '_cucumber_reporter.html',
  reportSuiteAsScenarios: true,
  theme: 'bootstrap',
  launchReport: true,
  metadata: {
    'Test Environment': 'UAT',
    Browser: 'Chrome 79',
    Platform: 'Windows 10',
  },
  name: 'Automation Test',
  brandTitle: 'Smoke Test Report',
  screenshotsDirectory: './screenshots',
  storeScreenshots: true,
};

export class Reporter {
  public static createDirectory(dir: string) {
    const resolvedDir = path.resolve(dir);
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }
  }
  // public static createDirectory(dir: string) {
  //   if (!fs.existsSync(dir)) {
  //     mkdirp.sync(dir);
  //   }
  // }

  public static createHTMLReport() {
    try {
      reporter.generate(cucumberReporterOptions); // invoke cucumber-html-reporter
    } catch (err) {
      if (err) {
        throw new Error('Failed to save cucumber test results to json file.');
      }
    }
  }
}
