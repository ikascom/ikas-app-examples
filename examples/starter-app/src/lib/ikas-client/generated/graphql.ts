import { BaseGraphQLAPIClient, BaseGraphQLAPIClientOptions, APIResult } from '@ikas/admin-api-client';

export type StringFilterInput = {
  eq?: string;
  in?: Array<string>;
  ne?: string;
  nin?: Array<string>;
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

export type ListCustomerQueryVariables = {
  email?: StringFilterInput;
}

export type ListCustomerQueryData = {
  count: number;
  data: Array<{
  accountStatus?: CustomerAccountStatusEnum;
  accountStatusUpdatedAt?: number;
  addresses?: Array<{
  addressLine1: string;
  addressLine2?: string;
  city: {
  code?: string;
  id?: string;
  name: string;
};
  company?: string;
  country: {
  code?: string;
  id?: string;
  iso2?: string;
  iso3?: string;
  name: string;
};
  createdAt?: number;
  deleted: boolean;
  district?: {
  code?: string;
  id?: string;
  name?: string;
};
  firstName: string;
  id: string;
  identityNumber?: string;
  isDefault?: boolean;
  lastName: string;
  phone?: string;
  postalCode?: string;
  region?: {
  createdAt?: number;
  deleted?: boolean;
  id: string;
  name: string;
  updatedAt?: number;
};
  state?: {
  code?: string;
  id?: string;
  name?: string;
};
  taxNumber?: string;
  taxOffice?: string;
  title: string;
  updatedAt?: number;
}>;
  attributes?: Array<{
  customerAttributeId?: string;
  customerAttributeOptionId?: string;
  value?: string;
}>;
  b2bStatus?: CustomerB2BStatusEnum;
  birthDate?: number;
  createdAt?: number;
  customerGroupIds?: Array<string>;
  customerSegmentIds?: Array<string>;
  customerSequence?: number;
  deleted: boolean;
  email?: string;
  emailVerifiedDate?: number;
  firstName: string;
  firstOrderDate?: number;
  fullName?: string;
  gender?: CustomerGenderTypeEnum;
  id: string;
  ip?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastName?: string;
  lastOrderDate?: number;
  lastPriceListId?: string;
  lastStorefrontRoutingId?: string;
  note?: string;
  orderCount?: number;
  passwordUpdateDate?: number;
  phone?: string;
  phoneSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
  phoneSubscriptionStatusUpdatedAt?: number;
  phoneVerifiedDate?: number;
  preferredLanguage?: string;
  priceListId?: string;
  priceListRules?: Array<{
  discountRate?: number;
  filters?: Array<{
  type: CustomerPriceListRuleFilterTypeEnum;
  valueList: Array<string>;
}>;
  priceListId?: string;
  shouldMatchAllFilters?: boolean;
  value: number;
  valueType: CustomerPriceListRuleValueTypeEnum;
}>;
  registrationSource?: CustomerRegistrationSourceEnum;
  smsSubscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
  smsSubscriptionStatusUpdatedAt?: number;
  subscriptionStatus?: CustomerEmailSubscriptionStatusesEnum;
  subscriptionStatusUpdatedAt?: number;
  tagIds?: Array<string>;
  totalOrderPrice?: number;
  updatedAt?: number;
  userAgent?: string;
}>;
  hasNext: boolean;
  limit: number;
  page: number;
}

export interface ListCustomerQuery {
  listCustomer: ListCustomerQueryData;
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

  async listCustomer(variables: ListCustomerQueryVariables): Promise<APIResult<Partial<ListCustomerQuery>>> {
    const query = `
  query ListCustomer($email: StringFilterInput) {
  listCustomer(email: $email) {
    count
    data {
      accountStatus
      accountStatusUpdatedAt
      addresses {
        addressLine1
        addressLine2
        city {
          code
          id
          name
        }
        company
        country {
          code
          id
          iso2
          iso3
          name
        }
        createdAt
        deleted
        district {
          code
          id
          name
        }
        firstName
        id
        identityNumber
        isDefault
        lastName
        phone
        postalCode
        region {
          createdAt
          deleted
          id
          name
          updatedAt
        }
        state {
          code
          id
          name
        }
        taxNumber
        taxOffice
        title
        updatedAt
      }
      attributes {
        customerAttributeId
        customerAttributeOptionId
        value
      }
      b2bStatus
      birthDate
      createdAt
      customerGroupIds
      customerSegmentIds
      customerSequence
      deleted
      email
      emailVerifiedDate
      firstName
      firstOrderDate
      fullName
      gender
      id
      ip
      isEmailVerified
      isPhoneVerified
      lastName
      lastOrderDate
      lastPriceListId
      lastStorefrontRoutingId
      note
      orderCount
      passwordUpdateDate
      phone
      phoneSubscriptionStatus
      phoneSubscriptionStatusUpdatedAt
      phoneVerifiedDate
      preferredLanguage
      priceListId
      priceListRules {
        discountRate
        filters {
          type
          valueList
        }
        priceListId
        shouldMatchAllFilters
        value
        valueType
      }
      registrationSource
      smsSubscriptionStatus
      smsSubscriptionStatusUpdatedAt
      subscriptionStatus
      subscriptionStatusUpdatedAt
      tagIds
      totalOrderPrice
      updatedAt
      userAgent
    }
    hasNext
    limit
    page
  }
}
`;
    return this.client.query<Partial<ListCustomerQuery>>({ query, variables });
  }
}

export class ikasAdminGraphQLAPIClient<TokenData> extends BaseGraphQLAPIClient<TokenData> {
  queries: GeneratedQueries;

  constructor(options: BaseGraphQLAPIClientOptions<TokenData>) {
    super(options);
    this.queries = new GeneratedQueries(this);
  }
}
