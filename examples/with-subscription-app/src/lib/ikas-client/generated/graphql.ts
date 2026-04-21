import { BaseGraphQLAPIClient, BaseGraphQLAPIClientOptions, APIResult } from '@ikas/admin-api-client';

export enum MerchantRegionEnum {
  AF = "AF",
  AN = "AN",
  AS = "AS",
  EU = "EU",
  OC = "OC",
  PL = "PL",
  TR = "TR",
  US = "US"
}

export enum SubscriptionCodeEnum {
  CUSTOM = "CUSTOM",
  EXTENSION = "EXTENSION",
  FREEMIUM = "FREEMIUM",
  GROW = "GROW",
  MARKETING_CORE = "MARKETING_CORE",
  MARKETING_EXPERT = "MARKETING_EXPERT",
  MARKETING_FREE = "MARKETING_FREE",
  MARKETING_MID = "MARKETING_MID",
  MARKETING_PRO = "MARKETING_PRO",
  ONE_TIME = "ONE_TIME",
  PREMIUM = "PREMIUM",
  SCALE = "SCALE",
  SCALE_PLUS = "SCALE_PLUS",
  START = "START",
  TRIAL = "TRIAL"
}

export enum SubscriptionPeriodEnum {
  MONTHLY = "MONTHLY",
  ONE_TIME = "ONE_TIME",
  YEARLY = "YEARLY"
}

export type GetMerchantQueryVariables = {}

export type GetMerchantQueryData = {
  id: string;
  email: string;
  storeName?: string;
}

export interface GetMerchantQuery {
  getMerchant: GetMerchantQueryData;
}

export type GetAuthorizedAppQueryVariables = {}

export type GetAuthorizedAppQueryData = {
  id: string;
  salesChannelId?: string;
}

export interface GetAuthorizedAppQuery {
  getAuthorizedApp: GetAuthorizedAppQueryData;
}

export type GetMerchantLicenceQueryVariables = {}

export type GetMerchantLicenceQueryData = {
  merchantId: string;
  activeSubscriptionCode: SubscriptionCodeEnum;
  period?: SubscriptionPeriodEnum;
  region: MerchantRegionEnum;
  fromDate?: number;
  toDate?: number;
  appSubscriptions?: Array<{
  id: string;
  name: string;
  storeAppId: string;
  storeAppListingSubscriptionId: string;
  storeAppListingSubscriptionKey: string;
  appPaymentKey?: string;
  merchantAppPaymentId?: string;
  authorizedAppId?: string;
  addedDate?: number;
  lastPaymentDate?: number;
  lastPaymentPrice: number;
  lastPaymentPriceWithTax: number;
  lastPaymentPeriod: SubscriptionPeriodEnum;
  lastPaymentPeriodInDays: number;
  lastPaymentDiscountRatio?: number;
  currencyCode?: string;
  currencySymbol?: string;
  deleted: boolean;
  createdAt?: number;
  updatedAt?: number;
}>;
}

export interface GetMerchantLicenceQuery {
  getMerchantLicence: GetMerchantLicenceQueryData;
}

export class GeneratedQueries {
  client: BaseGraphQLAPIClient<any>;

  constructor(client: BaseGraphQLAPIClient<any>) {
    this.client = client;
  }

  async getMerchant(): Promise<APIResult<Partial<GetMerchantQuery>>> {
    const query = `
  query getMerchant {
    getMerchant {
      id
      email
      storeName
    }
  }
`;
    return this.client.query<Partial<GetMerchantQuery>>({ query });
  }

  async getAuthorizedApp(): Promise<APIResult<Partial<GetAuthorizedAppQuery>>> {
    const query = `
  query getAuthorizedApp {
    getAuthorizedApp {
      id
      salesChannelId
    }
  }
`;
    return this.client.query<Partial<GetAuthorizedAppQuery>>({ query });
  }

  async getMerchantLicence(): Promise<APIResult<Partial<GetMerchantLicenceQuery>>> {
    const query = `
  query getMerchantLicence {
    getMerchantLicence {
      merchantId
      activeSubscriptionCode
      period
      region
      fromDate
      toDate
      appSubscriptions {
        id
        name
        storeAppId
        storeAppListingSubscriptionId
        storeAppListingSubscriptionKey
        appPaymentKey
        merchantAppPaymentId
        authorizedAppId
        addedDate
        lastPaymentDate
        lastPaymentPrice
        lastPaymentPriceWithTax
        lastPaymentPeriod
        lastPaymentPeriodInDays
        lastPaymentDiscountRatio
        currencyCode
        currencySymbol
        deleted
        createdAt
        updatedAt
      }
    }
  }
`;
    return this.client.query<Partial<GetMerchantLicenceQuery>>({ query });
  }
}

export class ikasAdminGraphQLAPIClient<TokenData> extends BaseGraphQLAPIClient<TokenData> {
  queries: GeneratedQueries;

  constructor(options: BaseGraphQLAPIClientOptions<TokenData>) {
    super(options);
    this.queries = new GeneratedQueries(this);
  }
}
