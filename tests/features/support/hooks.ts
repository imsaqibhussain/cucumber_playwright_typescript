import { Before, BeforeAll, AfterAll, After } from '@cucumber/cucumber';
import { Status, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { Utilities } from '../../page-objects/utilities';
const utility = new Utilities();
let scenarioName: any;
let oldvideoPath: any;

let browser: Browser;
let context: BrowserContext;
let page: Page;

setDefaultTimeout(320000);

// Function to launch the browser
async function launchBrowser() {
  browser = await chromium.launch({
    headless: false, // Open with browser (false) or without browser (true)
    slowMo: 900, // Slow motion for better visibility
  });
}

// Function to create a browser context with video recording
async function createBrowserContextwithRecording() {
  context = await browser.newContext({
    recordVideo: {
      dir: path.join(__dirname, 'videos'), // Video recording directory
      size: { width: 640, height: 480 }, // Video dimensions
    },
  });
  await createPageContext();
}

// Function to create a new page context
async function createPageContext() {
  page = await context.newPage();
}

// Function to capture a screenshot
async function captureScreenshot() {
  const screenshotPath = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotPath)) {
    fs.mkdirSync(screenshotPath);
  }
  const screenshotName = `${scenarioName}_${new Date()
    .toLocaleString()
    .replace(/[/:,]/g, '_')}.png`;
  console.log('screenshotName: ', screenshotName);
  const screenshotFilePath = path.join(screenshotPath, screenshotName);
  await page.screenshot({ path: screenshotFilePath });
}

async function renamedCapturedVideo() {
  try {
    await page.close();
    const newVideoName = `${scenarioName}_${new Date()
      .toLocaleString()
      .replace(/[/:,]/g, '_')}.webm`;
    const newVideoPath = path.join(__dirname, 'videos', newVideoName);

    let isVideoWritten = false;
    let attemptCount = 0;
    const maxAttempts = 10; // Maximum number of attempts
    const retryDelay = 5000; // Delay between attempts in milliseconds

    await utility.delay(5000);

    while (!isVideoWritten && attemptCount < maxAttempts) {
      try {
        await fs.promises.rename(oldvideoPath, newVideoPath);
        isVideoWritten = true;
        console.log('File is renamed');
      } catch (error) {
        console.error(
          `Error while renaming the video (attempt ${attemptCount + 1}):` //, error
        );
        attemptCount++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    if (!isVideoWritten) {
      console.error('Failed to rename the video after multiple attempts.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to close the context
async function closeContext() {
  await page.close();
  await page.video()?.delete(); // Delete the recorded video
  await context.close();
}

// Function to close the browser
async function closeBrowser() {
  await browser.close();
}

BeforeAll(async function () {
  await launchBrowser();
});

// Before Hook: Create a new browser context and page before each scenario
Before(async (scenario) => {
  scenarioName = scenario.pickle.name;
  await createBrowserContextwithRecording();
});

// After Hook: Cleanup and capture a screenshot after each scenario
After(async function (scenario) {
  oldvideoPath = await page.video()?.path();
  if (scenario.result?.status === Status.FAILED) {
    await captureScreenshot();
    console.log('Scenario is failed.');
    await renamedCapturedVideo();
  } else {
    await closeContext();
    console.log('Your scenario is looking good!.');
  }
});

// After All Hook: Close the browser after all scenarios
AfterAll(async function () {
  await closeBrowser();
});

export { page, browser, context };
