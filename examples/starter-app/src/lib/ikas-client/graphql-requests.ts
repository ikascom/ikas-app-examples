import { gql } from 'graphql-request';
import { getIkas } from '../../helpers/api-helpers';

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


export const LIST_CUSTOMER = gql`
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