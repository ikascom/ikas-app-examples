import { BaseGraphQLAPIClient, BaseGraphQLAPIClientOptions, APIResult } from '@ikas/admin-api-client';

// Enum type aliases
export type OrderStatusEnum = string;
export type OrderPaymentStatusEnum = string;
export type OrderPackageStatusEnum = string;

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

export type ListOrderQueryVariables = {
  id?: StringFilterInput;
}

export type ListOrderQueryData = {
  data: Array<{
  id: string;
  orderNumber?: string;
  orderedAt?: number;
  status: OrderStatusEnum;
  orderPaymentStatus?: OrderPaymentStatusEnum;
  orderPackageStatus?: OrderPackageStatusEnum;
  totalFinalPrice: number;
  currencyCode: string;
  customer?: {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  fullName?: string;
};
  billingAddress?: {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: {
  name: string;
};
  state?: {
  name?: string;
};
  country: {
  name: string;
};
  postalCode?: string;
};
  shippingAddress?: {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: {
  name: string;
};
  state?: {
  name?: string;
};
  country: {
  name: string;
};
  postalCode?: string;
};
  orderLineItems: Array<{
  id: string;
  quantity: number;
  finalPrice?: number;
  variant: {
  id?: string;
  name: string;
  sku?: string;
};
}>;
}>;
}

export interface ListOrderQuery {
  listOrder: ListOrderQueryData;
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

  async listOrder(variables: ListOrderQueryVariables): Promise<APIResult<Partial<ListOrderQuery>>> {
    const query = `
  query listOrder($id: StringFilterInput) {
    listOrder(id: $id) {
      data {
        id
        orderNumber
        orderedAt
        status
        orderPaymentStatus
        orderPackageStatus
        totalFinalPrice
        currencyCode
        customer {
          id
          firstName
          lastName
          email
          phone
          fullName
        }
        billingAddress {
          firstName
          lastName
          phone
          addressLine1
          addressLine2
          city {
            name
          }
          state {
            name
          }
          country {
            name
          }
          postalCode
        }
        shippingAddress {
          firstName
          lastName
          phone
          addressLine1
          addressLine2
          city {
            name
          }
          state {
            name
          }
          country {
            name
          }
          postalCode
        }
        orderLineItems {
          id
          quantity
          finalPrice
          variant {
            id
            name
            sku
          }
        }
      }
    }
  }
`;
    return this.client.query<Partial<ListOrderQuery>>({ query, variables });
  }
}

export class ikasAdminGraphQLAPIClient<TokenData> extends BaseGraphQLAPIClient<TokenData> {
  queries: GeneratedQueries;

  constructor(options: BaseGraphQLAPIClientOptions<TokenData>) {
    super(options);
    this.queries = new GeneratedQueries(this);
  }
}
