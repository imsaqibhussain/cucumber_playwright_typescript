import { LaunchOptions } from '@playwright/test';
const browserOptions: LaunchOptions = {
  headless: process.env.HEADLESS == 'true' || false,
  slowMo: 100000,
  //   args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  //   firefoxUserPrefs: {
  //     'media.navigator.streams.fake': true,
  //     'media.navigator.permission.disabled': true,
  //   },
};

export const config = {
  browser: process.env.BROWSER || 'chromium',
  browserOptions,
  BASE_URL: 'https://planpay-next.dev.planpaytech.com/auth/signin',
  IMG_THRESHOLD: { threshold: 0.4 },
  BASE_API_URL: 'https://planpay-next.dev.planpaytech.com/auth/signin',
};
