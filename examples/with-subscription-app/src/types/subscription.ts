import { GetMerchantLicenceQueryData } from '@/lib/ikas-client/generated/graphql';

export type MerchantAppSubscription = NonNullable<
  GetMerchantLicenceQueryData['appSubscriptions']
>[number];

export interface WebhookPaymentData {
  paymentStatus: string;
  subscriptionKey: string;
  merchantId: string;
  paymentId?: string;
  paymentDate?: number;
}

export interface IkasWebhook {
  scope: string;
  merchantId: string;
  data: string;
}
