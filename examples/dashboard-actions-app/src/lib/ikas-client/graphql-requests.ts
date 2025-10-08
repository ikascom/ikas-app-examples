import { gql } from 'graphql-request';

export const GET_MERCHANT = gql`
  query getMerchant {
    getMerchant {
      id
      email
      storeName
    }
  }
`;

export const GET_AUTHORIZED_APP = gql`
  query getAuthorizedApp {
    getAuthorizedApp {
      id
      salesChannelId
    }
  }
`;

export const LIST_ORDER = gql`
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
