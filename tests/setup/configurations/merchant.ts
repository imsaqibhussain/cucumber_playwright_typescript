import {
  MutationCheckoutCreateCheckoutRequest,
  MutationCheckoutCreateCheckoutRequestItemsInner,
  MutationCheckoutCreateCheckoutRequestItemsInnerMinimumDepositPerItem,
  MutationCheckoutCreateCheckoutRequestItemsInnerMinimumDepositPerItemAnyOf,
} from '@planpay/planpay-client';
import { PaymentPlatform_variant, RefundPolicy_type } from '@prisma/client';
import { addMonths } from 'date-fns';

export type MinimumDepositType =
  | MutationCheckoutCreateCheckoutRequestItemsInnerMinimumDepositPerItem
  | MutationCheckoutCreateCheckoutRequestItemsInnerMinimumDepositPerItemAnyOf;

export type MerchantItem = Omit<
  MutationCheckoutCreateCheckoutRequestItemsInner,
  'quantity' | 'redemptionDate' | 'minimumDepositPerItem'
> & {
  minimumDepositPerItem?: MinimumDepositType;
  shipmentDate: string;
  quantity?: number;
};
// 'redirectURL' will be taken from env
export interface MerchantDemo
  extends Omit<
    MutationCheckoutCreateCheckoutRequest,
    'items' | 'redirectURL' | 'currencyCode'
  > {
  name: string;
  paymentPlatform: Array<{
    variant: PaymentPlatform_variant;
    currencyCode: string;
  }>;
  items: ExampleCartItem[];
}

export interface RefundPolicy {
  id: string;
  type: RefundPolicy_type;
  daysWithinRedemptionDate: number;
  refundablePercentage: number;
}

interface ExampleCartItem {
  id: string;
  productName: string;
  sku: string;
  pageUrl: string;
  imageUrl: string;
  price: {
    amount: number;
    currency: string;
  };
  depositRefundable: boolean;
  quantity: number;
  shipmentDate: Date;
  minimumDepositPerItem?: {
    unit: string;
    value: number;
  };
  paymentDeadline?: number;
  refundPolicies?: RefundPolicy[];
}

const SIX_MONTHS_FROM_NOW = addMonths(Date.now(), 6);

//const ITEM_REFUND_POLICY: ItemRefundPolicy[] = {};

const EXAMPLE_ITEM_REFUND_POLICIES: RefundPolicy[][] = [
  [
    {
      id: '101',
      refundablePercentage: 100,
      daysWithinRedemptionDate: 50,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '102',
      refundablePercentage: 70,
      daysWithinRedemptionDate: 20,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '103',
      refundablePercentage: 50,
      daysWithinRedemptionDate: 10,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
  ],
  [
    {
      id: '201',
      refundablePercentage: 100,
      daysWithinRedemptionDate: 60,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '202',
      refundablePercentage: 70,
      daysWithinRedemptionDate: 30,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '203',
      refundablePercentage: 50,
      daysWithinRedemptionDate: 15,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
  ],
  [
    {
      id: '301',
      refundablePercentage: 100,
      daysWithinRedemptionDate: 100,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '302',
      refundablePercentage: 70,
      daysWithinRedemptionDate: 50,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
    {
      id: '303',
      refundablePercentage: 50,
      daysWithinRedemptionDate: 30,
      type: RefundPolicy_type.percentage_refundable_days_within_redemption_date,
    },
  ],
];

const EXAMPLE_CART: ExampleCartItem[][] = [
  [
    {
      id: '1',
      productName: 'Holiday',
      sku: '6789',
      pageUrl:
        'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1036&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1036&q=80',
      price: {
        amount: 20000,
        currency: 'AUD',
      },
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      minimumDepositPerItem: {
        unit: 'Currency',
        value: 50.0,
      },
      paymentDeadline: 25,
      refundPolicies: EXAMPLE_ITEM_REFUND_POLICIES[2],
      depositRefundable: false,
    },
  ],
  [
    {
      id: '1',
      productName: 'Wedding dress',
      pageUrl:
        'https://images.unsplash.com/photo-1543290556-86c013a17574?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1543290556-86c013a17574?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
      price: {
        amount: 50,
        currency: 'AUD',
      },
      sku: 'WD2134',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      minimumDepositPerItem: {
        unit: 'Percentage',
        value: 25,
      },
      paymentDeadline: 0,
      refundPolicies: EXAMPLE_ITEM_REFUND_POLICIES[1],
      depositRefundable: true,
    },
    {
      id: '2',
      productName: 'Wedding veil',
      pageUrl:
        'https://images.unsplash.com/photo-1515647433590-bd29995561a4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8V2VkZGluZyUyMHZlaWx8ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1515647433590-bd29995561a4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8V2VkZGluZyUyMHZlaWx8ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 500,
        currency: 'AUD',
      },
      sku: 'WV1234',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      minimumDepositPerItem: {
        unit: 'Percentage',
        value: 20.0,
      },
      paymentDeadline: 0,
      refundPolicies: EXAMPLE_ITEM_REFUND_POLICIES[0],
      depositRefundable: false,
    },
    {
      id: '3',
      productName: 'Wedding crown',
      pageUrl:
        'https://images.unsplash.com/photo-1507095171625-cdc6e4fa8c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fFdlZGRpbmclMjBjcm93bnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1507095171625-cdc6e4fa8c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fFdlZGRpbmclMjBjcm93bnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 1000,
        currency: 'AUD',
      },
      sku: 'WC5678',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 0,
      depositRefundable: true,
    },
    {
      id: '4',
      productName: 'Wedding shoes',
      pageUrl:
        'https://images.unsplash.com/photo-1599081682585-2a25f66f9875?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1599081682585-2a25f66f9875?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: {
        amount: 1500,
        currency: 'AUD',
      },
      sku: 'WS9876',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 0,
      depositRefundable: true,
    },
  ],
  [
    {
      id: '1',
      productName: 'Airline flight',
      pageUrl:
        'https://images.unsplash.com/photo-1670572157788-20f2c55204ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1670572157788-20f2c55204ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80',
      price: {
        amount: 50,
        currency: 'AUD',
      },
      sku: 'PP-FLT-123',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      minimumDepositPerItem: {
        unit: 'Currency',
        value: 5.0,
      },
      paymentDeadline: 30,
      depositRefundable: true,
    },

    {
      id: '2',
      productName: 'Hotel booking',
      sku: 'BK-HTL-456',
      pageUrl:
        'https://images.unsplash.com/photo-1666913804166-7dae710dcd50?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8b3ZvbG98ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1666913804166-7dae710dcd50?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8b3ZvbG98ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 500,
        currency: 'AUD',
      },
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      minimumDepositPerItem: {
        unit: 'Currency',
        value: 250.0,
      },
      paymentDeadline: 0,
      depositRefundable: true,
    },
  ],
  [
    {
      id: '1',
      productName: 'Superior Deluxe King Guest room 1 King',
      pageUrl:
        'https://images.unsplash.com/photo-1666913804166-7dae710dcd50?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8b3ZvbG98ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1666913804166-7dae710dcd50?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8b3ZvbG98ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 200,
        currency: 'AUD',
      },
      sku: 'SKU-2564853',
      depositRefundable: false,
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      refundPolicies: EXAMPLE_ITEM_REFUND_POLICIES[0],
    },
    {
      id: '2',
      productName: 'Superior Deluxe Twin Guest room 2 Twin/Single Bed(s)',
      pageUrl:
        'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGhvdGVsJTIwcm9vbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGhvdGVsJTIwcm9vbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 500,
        currency: 'AUD',
      },
      sku: 'SKU-9250513',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 30,
      depositRefundable: true,
      refundPolicies: EXAMPLE_ITEM_REFUND_POLICIES[0],
    },
    {
      id: '3',
      productName: 'Superior Studio Twin Larger Guest room 2 Double',
      pageUrl:
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fGhvdGVsJTIwcm9vbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      imageUrl:
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fGhvdGVsJTIwcm9vbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
      price: {
        amount: 1000,
        currency: 'AUD',
      },
      sku: 'SKU-6723570',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 0,
      depositRefundable: true,
    },
    {
      id: '4',
      productName: 'Club King Club lounge access Guest room 1 King',
      pageUrl:
        'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: {
        amount: 1500,
        currency: 'AUD',
      },
      sku: 'SKU-8129803',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 45,
      depositRefundable: true,
    },
    {
      id: '5',
      productName: 'Presidential Suite Club lounge access High floor',
      pageUrl:
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      imageUrl:
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: {
        amount: 2000,
        currency: 'AUD',
      },
      sku: 'SKU-3622103',
      quantity: 1,
      shipmentDate: SIX_MONTHS_FROM_NOW,
      paymentDeadline: 60,
      depositRefundable: false,
    },
  ],
];

export const merchantDemo: MerchantDemo[] = [
  {
    merchantId: '62972bbf7919',
    name: 'Enad Hotels',
    merchantOrderId: 'yrcmpny-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[0],
  },
  {
    merchantId: '000abcd00ef0',
    name: 'YapNalp Hotels',
    merchantOrderId: 'yrcmpny-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[3],
  },
  {
    merchantId: '630880668a41',
    name: 'Noraa Travel',
    merchantOrderId: 'yrcmpny-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[2],
  },
  {
    merchantId: '62bd1b7e5e8b',
    name: 'Ovolo Hotels',
    merchantOrderId: 'yrcmpny-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[1],
  },
  {
    merchantId: '631adba97bf3',
    name: 'Shonrate Hotels',
    merchantOrderId: 'shonrate-123-asdjajasfsdljls',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[3],
  },
  {
    merchantId: 'ffue5jqyrctz',
    name: 'Ideyas Hotels',
    merchantOrderId: 'arcfpnc-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Enterprise, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[3],
  },
  {
    merchantId: 'u2bxn7leqclv',
    name: 'Assilem Hotels',
    merchantOrderId: 'arcfpnc-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'USD' },
    ],
    items: EXAMPLE_CART[0],
  },
  {
    merchantId: '796y21ttw000',
    name: 'Leinad Hotels',
    merchantOrderId: 'leinad-123-asdjajasfsdljls',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Enterprise, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[3],
  },
  {
    merchantId: 'apgit66vzosi',
    name: 'Idnib Hotels',
    merchantOrderId: 'arcfpnc-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Enterprise, currencyCode: 'AUD' },
      { variant: PaymentPlatform_variant.Enterprise, currencyCode: 'NZD' },
      { variant: PaymentPlatform_variant.Enterprise, currencyCode: 'GBP' },
    ],
    items: EXAMPLE_CART[0],
  },
  {
    merchantId: 'mw7n2hj3s36s',
    name: 'Minty Hotels',
    merchantOrderId: 'yrcmpny-123-abcsdha9gck65e5',
    paymentPlatform: [
      { variant: PaymentPlatform_variant.Managed, currencyCode: 'AUD' },
    ],
    items: EXAMPLE_CART[3],
  },
];

export { EXAMPLE_CART };
export type { ExampleCartItem };
