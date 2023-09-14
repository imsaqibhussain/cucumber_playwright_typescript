// import { PaymentPlatform_variant } from '@prisma/client';
import { ExampleCartItem, merchantDemo } from './merchant';

interface SubMerchantDemo {
  merchantId: string;
  subMerchantId: string;
  name: string;
  items: ExampleCartItem[] | undefined;
  //   paymentPlatform: Array<{
  //     variant: PaymentPlatform_variant;
  //     currencyCode: string;
  //   }> | undefined;
}

export const subMerchantDemo: SubMerchantDemo[] = [
  {
    subMerchantId: '000aaaa00aa1',
    name: 'Ñaamra Hotel',
    merchantId: '000abcd00ef0',
    items: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')?.items,
    // paymentPlatform: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')
    //   ?.paymentPlatform,
  },
  {
    subMerchantId: '000aaaa00aa2',
    name: 'EKÄJ Hotel',
    merchantId: '000abcd00ef0',
    items: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')?.items,
    // paymentPlatform: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')
    //   ?.paymentPlatform,
  },
  {
    subMerchantId: '000aaaa00aa3',
    name: 'ÏRTIMID Hotel',
    merchantId: '000abcd00ef0',
    items: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')?.items,
    // paymentPlatform: merchantDemo.find((v) => v.merchantId === '000abcd00ef0')
    //   ?.paymentPlatform,
  },
  {
    subMerchantId: '123bbbb45bb6',
    name: 'Idnib Flights',
    merchantId: 'apgit66vzosi',
    items: merchantDemo.find((v) => v.merchantId === 'apgit66vzosi')?.items,
    // paymentPlatform: merchantDemo.find((v) => v.merchantId === 'apgit66vzosi')
    //   ?.paymentPlatform,
  },
  {
    subMerchantId: '789abcd01ef2',
    name: 'Nosaj Agency',
    merchantId: 'apgit66vzosi',
    items: merchantDemo.find((v) => v.merchantId === 'apgit66vzosi')?.items,
    // paymentPlatform: merchantDemo.find((v) => v.merchantId === 'apgit66vzosi')
    //   ?.paymentPlatform,
  },
];
