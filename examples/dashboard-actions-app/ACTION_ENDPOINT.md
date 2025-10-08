# Order Actions

This document describes the order action implementations (single order detail and multiple order list) for both API and IFRAME methods.

## Overview

The ikas app supports two types of order actions:

1. **Order Detail** (`/ikas/actions/order-detail`): View details for a single order
2. **Order List** (`/ikas/actions/order-list`): View summary for multiple orders

Each action supports two invocation methods:

- **API Method**: Server-to-server API call with signature validation
- **IFRAME Method**: Client-side page loaded in an iframe with session authentication

---

## Order Detail Action (Single Order)

### API Method (Server-to-Server)

The API endpoint receives order detail action requests from the ikas platform, validates the request signature, fetches order information from the ikas API, and logs comprehensive order details.

#### Endpoint Details

- **URL**: `/api/ikas/actions/order-detail`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Body

```json
{
  "signature": "webhook_signature_string",
  "authorizedAppId": "authorized_app_id",
  "merchantId": "merchant_id",
  "data": "{\"actionRunId\":\"unique_action_run_id\",\"idList\":[\"order_id\"],\"userLocale\":\"en\"}"
}
```

### Fields

- `signature` (string, required): HMAC signature for validating the request authenticity
- `authorizedAppId` (string, required): ID of the authorized app installation
- `merchantId` (string, required): ID of the merchant making the request
- `data` (string, required): JSON-stringified object containing:
  - `actionRunId` (string, required): Unique identifier for this action execution
  - `idList` (string[], required): Array containing the order ID(s) to fetch
  - `userLocale` (string, optional): ISO2 language code (e.g., 'en', 'tr'). Defaults to 'en' if not provided

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "actionRunId": "unique_action_run_id",
  "orderId": "order_id",
  "orderNumber": "1001"
}
```

**Note**: The `message` field is localized based on the `userLocale` parameter.

### Error Responses

#### 400 Bad Request
- Missing required fields
- Invalid data format
- Missing actionRunId or idList

```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "Missing required fields"
}
```

#### 401 Unauthorized
- Invalid signature

```json
{
  "success": false,
  "message": "Invalid signature",
  "error": "Invalid signature"
}
```

#### 404 Not Found
- Auth token not found for the authorized app
- Order not found

```json
{
  "success": false,
  "message": "Order not found",
  "error": "Order not found"
}
```

#### 500 Internal Server Error
- Server configuration error
- Failed to fetch order

```json
{
  "success": false,
  "message": "Failed to process action",
  "error": "Failed to process action"
}
```

**Note**: All error `message` fields are also localized based on the `userLocale` parameter.

## Logged Information

When an order is successfully fetched, the following information is logged to the console:

### Basic Order Information
- Action Run ID
- Order ID
- Order Number
- Order Date (ISO 8601 format)
- Order Status
- Payment Status
- Total Amount with Currency

### Customer Information
- Customer ID
- Customer Full Name
- Customer Email
- Customer Phone

### Shipping Address
- Name
- Phone
- Address Line 1
- Address Line 2 (if available)
- City
- State
- Country
- Postal Code

### Order Items
- Total Item Count
- For each item:
  - Product/Variant Name
  - SKU
  - Quantity
  - Price

## Example Log Output

```
===== ORDER DETAILS =====
Action Run ID: 550e8400-e29b-41d4-a716-446655440000
Order ID: 60d5ec49f1a2c8b4f8e4d5e3
Order Number: 1001
Order Date: 2025-10-08T10:30:00.000Z
Order Status: CREATED
Payment Status: PAID
Total Amount: 150.50 USD
--- Customer Info ---
Customer ID: 60d5ec49f1a2c8b4f8e4d5e4
Customer Name: John Doe
Customer Email: john.doe@example.com
Customer Phone: +1234567890
--- Shipping Address ---
Name: John Doe
Phone: +1234567890
Address: 123 Main Street
City: New York
State: New York
Country: United States
Postal Code: 10001
--- Order Items ---
Item Count: 2
Item 1: Blue T-Shirt - Medium
  SKU: TSHIRT-BLUE-M
  Quantity: 1
  Price: 29.99
Item 2: Black Jeans - Large
  SKU: JEANS-BLACK-L
  Quantity: 1
  Price: 120.51
========================
```

## Security

The endpoint implements the following security measures:

1. **Signature Validation**: Uses a local HMAC-SHA256 signature validation method to verify request authenticity. The signature is generated using `crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex')` and compared with the received signature.
2. **Token Management**: Retrieves and uses authorized app tokens securely
3. **Error Handling**: Comprehensive error handling with appropriate status codes
4. **Secret Management**: Uses environment variable `CLIENT_SECRET` for signature validation

## Configuration

Ensure the following environment variable is set:

```env
CLIENT_SECRET=your_ikas_app_secret
```

This secret is used to validate the webhook signature and ensure requests are coming from the ikas platform.

## Integration with ikas Platform

To use this endpoint with the ikas platform:

1. Register your app action in the ikas app configuration
2. Set the action method to `API` (not `IFRAME`)
3. Configure the action URL to point to: `https://your-app-domain.com/api/actions/order-detail`
4. Set the action type appropriately (e.g., for order actions)

The ikas platform will:
1. Generate the action request with the order ID(s)
2. Sign the request using your app secret
3. POST the request to your endpoint
4. Expect a success/failure response

## Development Notes

- The endpoint uses the `listOrder` GraphQL query to fetch order details
- Token refresh is handled automatically by the `getIkas` client
- All sensitive information (tokens, secrets) is handled securely
- Comprehensive logging helps with debugging and monitoring

---

### IFRAME Method (Client-Side Page)

The iframe version displays order details in a user-friendly interface within an iframe loaded by the ikas platform.

#### Page Details

- **URL**: `/ikas/actions/order-detail`
- **Method**: Client-side page (GET via browser)
- **Authentication**: Session-based (iron-session)

#### Query Parameters

The page receives the following query parameters from the ikas platform:

- `actionRunId` (string, required): Unique identifier for this action execution
- `idList` (string, required): Comma-separated list of order IDs (typically contains a single order ID)
- `userLocale` (string, optional): ISO2 language code (e.g., 'en', 'tr'). Defaults to 'en' if not provided

**Example URL:**
```
https://your-app-domain.com/ikas/actions/order-detail?actionRunId=550e8400-e29b-41d4-a716-446655440000&idList=60d5ec49f1a2c8b4f8e4d5e3&userLocale=tr
```

#### How It Works

1. **Page Load**: The ikas platform opens the action URL in an iframe
2. **Close Loader**: The page calls `AppBridgeHelper.closeLoader()` to close the platform loading indicator
3. **Parameter Extraction**: The page extracts `actionRunId` and `idList` from URL query parameters
4. **Token Retrieval**: The page uses `TokenHelpers.getTokenForIframeApp()` to get the authentication token from the app bridge
5. **API Call**: The page calls `/api/ikas/get-order?orderId={orderId}` with the JWT token to fetch order data
6. **Token Validation**: The fetch endpoint validates the JWT token and extracts user information
7. **Data Display**: The page renders the order information in a clean, responsive UI

#### Displayed Information

The iframe page displays the following information in a card-based layout:

**Order Header**
- Order Number
- Order Date and Time
- Action Run ID
- Order Status, Payment Status, Package Status
- Total Amount with Currency

**Customer Information**
- Customer Name
- Email Address
- Phone Number
- Customer ID

**Addresses**
- **Shipping Address**: Full address with name, phone, street, city, state, country, postal code
- **Billing Address**: Full address with name, phone, street, city, state, country, postal code

**Order Items**
- Product/Variant Name
- SKU
- Quantity
- Unit Price
- Total Price per Item

#### Security

The iframe implementation uses:

1. **App Bridge Integration**: Uses `AppBridgeHelper.closeLoader()` to close platform loader and `TokenHelpers.getTokenForIframeApp()` for authentication
2. **JWT Token Validation**: Backend validates JWT token and extracts user information via `getUserFromRequest`
3. **Token Management**: Uses authorized app tokens for ikas API access with automatic refresh
4. **Iframe Security**: Leverages ikas app bridge for secure cross-origin communication
5. **Audit Logging**: Logs order access with merchantId, authorizedAppId, and timestamp

#### User Experience

- **Loading State**: Shows a loading spinner while fetching data
- **Error Handling**: Displays user-friendly error messages for:
  - Missing order ID
  - Order not found
  - Authentication failures
  - API errors
- **Responsive Design**: Adapts to different screen sizes within the iframe
- **Clean UI**: Uses shadcn/ui components for a modern, consistent look

#### Integration with ikas Platform

To use this iframe action with the ikas platform:

1. Register your app action in the ikas app configuration
2. Set the action method to `IFRAME`
3. Configure the action URL to: `https://your-app-domain.com/ikas/actions/order-detail`
4. Set the action type appropriately (e.g., for order actions)

The ikas platform will:
1. Generate the action URL with required query parameters (`actionRunId`, `idList`)
2. Open the URL in an iframe within the ikas admin interface
3. Provide app bridge functionality for secure authentication token retrieval
4. Display the rendered order details to the user

### Example Screenshot Structure

```
┌─────────────────────────────────────────────────────┐
│ Order #1001                      Action Run ID:     │
│ October 8, 2025, 10:30 AM       550e8400-e29b...    │
│                                                      │
│ Status: CREATED  Payment: PAID  Package: FULFILLED │
│ Total: 150.50 USD                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Customer Information                                 │
│ Name: John Doe          Email: john.doe@example.com│
│ Phone: +1234567890      Customer ID: 60d5ec49...   │
└─────────────────────────────────────────────────────┘

┌───────────────────────────┬─────────────────────────┐
│ Shipping Address          │ Billing Address         │
│ John Doe                  │ John Doe                │
│ +1234567890               │ +1234567890             │
│ 123 Main Street           │ 123 Main Street         │
│ New York, NY 10001        │ New York, NY 10001      │
│ United States             │ United States           │
└───────────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Order Items (2)                                      │
│ Blue T-Shirt - Medium            29.99 USD          │
│ SKU: TSHIRT-BLUE-M                                  │
│ Quantity: 1                      29.99 each         │
│ ─────────────────────────────────────────────────── │
│ Black Jeans - Large             120.51 USD          │
│ SKU: JEANS-BLACK-L                                  │
│ Quantity: 1                     120.51 each         │
└─────────────────────────────────────────────────────┘
```

---

## Order List Action (Multiple Orders)

### API Method (Server-to-Server)

The API endpoint receives order list action requests from the ikas platform, validates the request signature, fetches multiple order information from the ikas API, and logs summary information for each order.

#### Endpoint Details

- **URL**: `/api/ikas/actions/order-list`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

Same format as Order Detail, but `idList` contains multiple order IDs:

```json
{
  "signature": "webhook_signature_string",
  "authorizedAppId": "authorized_app_id",
  "merchantId": "merchant_id",
  "data": "{\"actionRunId\":\"unique_action_run_id\",\"idList\":[\"order_id_1\",\"order_id_2\",\"order_id_3\"],\"userLocale\":\"en\"}"
}
```

#### Response

##### Success Response (200 OK)

```json
{
  "success": true,
  "message": "3 orders retrieved successfully",
  "actionRunId": "unique_action_run_id",
  "totalOrders": 3,
  "successCount": 3,
  "failedCount": 0,
  "orders": [
    { "id": "order_id_1", "orderNumber": "1001" },
    { "id": "order_id_2", "orderNumber": "1002" },
    { "id": "order_id_3", "orderNumber": "1003" }
  ]
}
```

**Note**: If some orders fail to fetch, `failedOrderIds` array will be included in the response.

#### Logged Information

For each order in the list, the following information is logged:

- Order ID
- Order Number
- Order Date
- Order Status
- Payment Status
- Total Amount
- Customer Name and Email
- Item Count

Plus a summary showing successful vs failed order counts.

---

### IFRAME Method (Client-Side Page)

The iframe version displays a list of orders with summary information for each order.

#### Page Details

- **URL**: `/ikas/actions/order-list`
- **Method**: Client-side page (GET via browser)
- **Authentication**: Session-based (iron-session)

#### Query Parameters

The page receives the following query parameters from the ikas platform:

- `actionRunId` (string, required): Unique identifier for this action execution
- `idList` (string, required): Comma-separated list of order IDs (contains multiple order IDs)
- `userLocale` (string, optional): ISO2 language code (e.g., 'en', 'tr'). Defaults to 'en' if not provided

**Example URL:**
```
https://your-app-domain.com/ikas/actions/order-list?actionRunId=550e8400-e29b-41d4-a716-446655440000&idList=order_id_1,order_id_2,order_id_3&userLocale=tr
```

#### How It Works

1. **Page Load**: The ikas platform opens the action URL in an iframe
2. **Close Loader**: The page calls `AppBridgeHelper.closeLoader()` to close the platform loading indicator
3. **Parameter Extraction**: The page extracts `actionRunId` and `idList` from URL query parameters
4. **Parse Order IDs**: Splits the comma-separated `idList` into individual order IDs
5. **Token Retrieval**: The page uses `TokenHelpers.getTokenForIframeApp()` to get the authentication token
6. **Parallel API Calls**: The page calls `/api/ikas/get-order` for each order ID in parallel using `Promise.all()`
7. **Data Display**: The page renders all orders in a card-based list layout

#### Displayed Information

The iframe page displays each order as a card with:

**Per Order Card:**
- Order Number
- Order Date and Time
- Order Status, Payment Status, Package Status
- Total Amount with Currency
- Customer Name and Email (summary)
- Item Count

**Header:**
- Total number of orders
- Action Run ID

#### Integration with ikas Platform

To use this iframe action with the ikas platform:

1. Register your app action in the ikas app configuration
2. Set the action method to `IFRAME`
3. Configure the action URL to: `https://your-app-domain.com/ikas/actions/order-list`
4. Set the action type appropriately (e.g., for bulk order actions)

The ikas platform will:
1. Generate the action URL with required query parameters including multiple order IDs
2. Open the URL in an iframe within the ikas admin interface
3. Display the rendered order list to the user

---

## Localization Support

Both API and IFRAME methods support internationalization (i18n) through the `userLocale` parameter.

### Supported Languages

- **English (en)**: Default language
- **Turkish (tr)**: Full translation support

### How It Works

1. **API Method**: The `userLocale` is passed in the `data` payload. All response messages are automatically localized.
2. **IFRAME Method**: The `userLocale` is passed as a query parameter. All UI text is rendered in the specified language.

### Adding New Languages

To add support for a new language:

1. Open `/src/lib/i18n.ts`
2. Add the new locale to `SupportedLocale` type
3. Add translations to the `translations` object
4. Update the locale normalization logic if needed

**Example for adding German (de):**

```typescript
export type SupportedLocale = 'en' | 'tr' | 'de';

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: { /* English translations */ },
  tr: { /* Turkish translations */ },
  de: { /* German translations */ },
};
```

### Translation Keys

All translation keys are centrally managed in `/src/lib/i18n.ts`. Key naming convention:
- `action.*` - API action messages
- `page.*` - UI page labels and messages

---

## Choosing Between API and IFRAME Methods

### Use API Method When:
- You need server-to-server communication
- You want to perform background operations
- You need to integrate with external systems
- You want to log/audit actions without user interaction
- The action doesn't require user feedback

### Use IFRAME Method When:
- You want to show order details to the user
- You need user interaction or confirmation
- You want a rich, interactive UI
- You need to display complex data in a readable format
- You want the user to review information before proceeding

---

## Related Files

### Order Detail Action
**API Method:**
- `/src/app/api/ikas/actions/order-detail/route.ts` - Main API endpoint implementation
- `/src/lib/ikas-client/graphql-requests.ts` - GraphQL queries including `LIST_ORDER`
- `/src/helpers/api-helpers.ts` - Helper functions for ikas API client
- `/src/models/auth-token/manager.ts` - Token management utilities
- `/src/lib/i18n.ts` - Internationalization helper with translations

**IFRAME Method:**
- `/src/app/ikas/actions/order-detail/page.tsx` - Main iframe page component
- `/src/app/api/ikas/get-order/route.ts` - API endpoint for fetching order data (used by iframe page)
- `/src/lib/api-requests.ts` - Frontend-backend API bridge with `getOrder` method
- `/src/helpers/token-helpers.ts` - App bridge token helpers
- `/src/components/ui/card.tsx` - UI card component
- `/src/components/Loading/index.tsx` - Loading spinner component
- `/src/lib/auth-helpers.ts` - JWT token authentication helpers
- `/src/lib/i18n.ts` - Internationalization helper with translations

### Order List Action
**API Method:**
- `/src/app/api/ikas/actions/order-list/route.ts` - Main API endpoint for multiple orders
- `/src/lib/ikas-client/graphql-requests.ts` - GraphQL queries including `LIST_ORDER`
- `/src/helpers/api-helpers.ts` - Helper functions for ikas API client
- `/src/models/auth-token/manager.ts` - Token management utilities
- `/src/lib/i18n.ts` - Internationalization helper with translations

**IFRAME Method:**
- `/src/app/ikas/actions/order-list/page.tsx` - Main iframe page for multiple orders
- `/src/app/api/ikas/get-order/route.ts` - API endpoint for fetching order data (used by iframe page)
- `/src/lib/api-requests.ts` - Frontend-backend API bridge with `getOrder` method
- `/src/helpers/token-helpers.ts` - App bridge token helpers
- `/src/components/ui/card.tsx` - UI card component
- `/src/components/Loading/index.tsx` - Loading spinner component
- `/src/lib/auth-helpers.ts` - JWT token authentication helpers
- `/src/lib/i18n.ts` - Internationalization helper with translations

