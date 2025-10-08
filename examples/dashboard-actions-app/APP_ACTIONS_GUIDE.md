# ikas App Actions - Complete Guide

This guide provides comprehensive documentation for implementing **ikas App Actions** in your Next.js application.

## Table of Contents

- [Overview](#overview)
- [Action Types](#action-types)
- [Action Contexts](#action-contexts)
- [Architecture](#architecture)
- [Implementation Guide](#implementation-guide)
  - [API Actions](#api-actions)
  - [IFRAME Actions](#iframe-actions)
- [Configuration](#configuration)
- [Security](#security)
- [Localization](#localization)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

**App Actions** are custom operations that your ikas app can expose to merchants within the ikas Admin interface. They allow merchants to perform app-specific tasks directly from relevant contexts (e.g., order details, product lists).

### Key Benefits

- **Contextual Integration**: Actions appear where they're needed (order pages, product lists, etc.)
- **Flexible Execution**: Choose between API (server-to-server) or IFRAME (embedded UI) methods
- **Type-Safe**: Full TypeScript support with generated types
- **Secure**: Built-in signature validation and JWT authentication
- **Localized**: Multi-language support for international merchants

---

## Action Types

ikas supports two execution methods for app actions:

### 1. API Actions (`method: "api"`)

**Server-to-server** actions where ikas sends a POST request to your API endpoint.

**When to Use:**
- Background operations (no UI needed)
- Bulk processing
- Automated workflows
- Integration with third-party services
- When you need to return success/failure immediately

**How It Works:**
```
ikas Admin → POST request with signature → Your API Endpoint → Process → Return JSON response
```

**Response Format:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "actionRunId": "uuid",
  "data": { /* optional additional data */ }
}
```

### 2. IFRAME Actions (`method: "iframe"`)

**Embedded UI** actions where ikas displays your page in an iframe within the Admin.

**When to Use:**
- Complex user interactions needed
- Visual data display/visualization
- Multi-step workflows
- User input required
- Rich UI/UX experiences

**How It Works:**
```
ikas Admin → Opens iframe with your URL → Your page loads → Fetch data via backend API → Display UI
```

---

## Action Contexts

Actions are triggered from specific contexts in the ikas Admin:

| Context Type | Description | `idList` Contains |
|-------------|-------------|-------------------|
| `order-detail` | Single order detail page | Single order ID |
| `order-list` | Order list with bulk selection | Multiple order IDs |
| `product-detail` | Single product detail page | Single product ID |
| `product-list` | Product list with bulk selection | Multiple product IDs |

---

## Architecture

### Overall Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ikas Admin                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Order Detail Page                                          │ │
│  │ ┌────────────────────────────────────────────────────────┐ │ │
│  │ │ App Actions Menu                                       │ │ │
│  │ │ • View Order Details (IFRAME) ← Click                  │ │ │
│  │ │ • View Order Details (API)                             │ │ │
│  │ └────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │          Action Execution                │
        └─────────────────────────────────────────┘
                    │                   │
         ┌──────────┴──────────┐       └────────────────┐
         ▼                     ▼                         ▼
    ┌─────────┐         ┌──────────┐           ┌──────────────┐
    │   API   │         │  IFRAME  │           │  Signature   │
    │ Method  │         │  Method  │           │  Validation  │
    └─────────┘         └──────────┘           └──────────────┘
         │                     │
         ▼                     ▼
    ┌─────────┐         ┌──────────┐
    │ Process │         │ Display  │
    │ & Return│         │    UI    │
    └─────────┘         └──────────┘
```

### API Action Flow

```
┌──────────────┐
│ ikas Admin   │
└──────┬───────┘
       │ 1. Trigger Action
       │ POST /api/ikas/actions/order-detail
       │ {
       │   signature: "...",
       │   authorizedAppId: "...",
       │   merchantId: "...",
       │   data: "{\"actionRunId\":\"...\",\"idList\":[\"...\"]}"
       │ }
       ▼
┌──────────────────────────────────────┐
│ Your API Route                       │
│ /api/ikas/actions/order-detail       │
├──────────────────────────────────────┤
│ 1. Validate signature (HMAC-SHA256)  │
│ 2. Parse request data                │
│ 3. Fetch OAuth token (AuthManager)   │
│ 4. Call ikas GraphQL API             │
│ 5. Process order data                │
│ 6. Log activity                      │
│ 7. Return response                   │
└──────┬───────────────────────────────┘
       │
       │ Response:
       │ {
       │   success: true,
       │   message: "Order processed",
       │   actionRunId: "...",
       │   orderId: "...",
       │   orderNumber: "..."
       │ }
       ▼
┌──────────────┐
│ ikas Admin   │
│ Shows result │
└──────────────┘
```

### IFRAME Action Flow

```
┌──────────────┐
│ ikas Admin   │
└──────┬───────┘
       │ 1. Trigger Action
       │ Opens iframe:
       │ /ikas/actions/order-detail?actionRunId=...&idList=...&userLocale=en
       ▼
┌─────────────────────────────────────────────────────────┐
│ Your IFRAME Page (Client-Side)                          │
│ /ikas/actions/order-detail                              │
├─────────────────────────────────────────────────────────┤
│ 1. Close platform loader (AppBridgeHelper.closeLoader) │
│ 2. Get JWT token (TokenHelpers.getTokenForIframeApp)   │
│ 3. Parse URL params (actionRunId, idList, userLocale)  │
│ 4. Call backend API with token                         │
│    └─> GET /api/ikas/get-order?orderId=...             │
│ 5. Display order data in UI                            │
└──────┬──────────────────────────────────────────────────┘
       │
       │ Calls Backend API
       ▼
┌─────────────────────────────────────┐
│ Backend API Route                   │
│ /api/ikas/get-order                 │
├─────────────────────────────────────┤
│ 1. Validate JWT token               │
│ 2. Extract user info (merchantId)   │
│ 3. Fetch OAuth token (AuthManager)  │
│ 4. Call ikas GraphQL API            │
│ 5. Return order data                │
└──────┬──────────────────────────────┘
       │
       │ Returns: { order: {...} }
       ▼
┌──────────────────┐
│ IFRAME Page      │
│ Renders order UI │
└──────────────────┘
```

---

## Implementation Guide

### API Actions

API actions are server-to-server operations that validate signatures and return JSON responses.

#### 1. Create API Route

**File:** `src/app/api/ikas/actions/[action-name]/route.ts`

```typescript
import crypto from 'crypto';
import { getIkas } from '@/helpers/api-helpers';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { NextRequest, NextResponse } from 'next/server';
import { t } from '@/lib/i18n';

type ActionRequestBody = {
  signature: string;
  authorizedAppId: string;
  merchantId: string;
  data: string; // JSON stringified ActionData
};

type ActionData = {
  actionRunId: string;
  idList?: string[];
  userLocale?: string;
};

// Signature validation using HMAC-SHA256
function validateWebhookSignature(
  data: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('hex');
  return expectedSignature === receivedSignature;
}

export async function POST(request: NextRequest) {
  let userLocale = 'en'; // Default locale
  
  try {
    // 1. Parse request body
    const body: ActionRequestBody = await request.json();
    const { signature, authorizedAppId, merchantId, data } = body;

    // 2. Validate required fields
    if (!signature || !authorizedAppId || !merchantId || !data) {
      return NextResponse.json(
        { 
          success: false,
          message: t('action.error.missing_fields', userLocale),
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // 3. Parse action data
    let actionData: ActionData;
    try {
      actionData = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { 
          success: false,
          message: t('action.error.invalid_data', userLocale),
          error: 'Invalid data format' 
        },
        { status: 400 }
      );
    }

    userLocale = actionData.userLocale || 'en';
    const { actionRunId, idList } = actionData;

    // 4. Validate signature
    const authToken = await AuthTokenManager.get(authorizedAppId);
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          message: t('action.error.unauthorized', userLocale),
          error: 'Auth token not found' 
        },
        { status: 404 }
      );
    }

    const isValidSignature = validateWebhookSignature(
      data,
      signature,
      authToken.appSecret
    );

    if (!isValidSignature) {
      console.error('Invalid signature for action:', actionRunId);
      return NextResponse.json(
        { 
          success: false,
          message: t('action.error.invalid_signature', userLocale),
          error: 'Invalid signature' 
        },
        { status: 401 }
      );
    }

    // 5. Validate idList
    if (!idList || idList.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: t('action.error.missing_id_list', userLocale),
          error: 'Missing idList' 
        },
        { status: 400 }
      );
    }

    // 6. Process action (fetch data from ikas)
    const ikasClient = getIkas(authToken);
    const response = await ikasClient.queries.listOrder({ 
      id: { eq: idList[0] } 
    });

    if (response.isSuccess && response.data?.listOrder.data?.length) {
      const order = response.data.listOrder.data[0];

      // 7. Log action (for audit)
      console.log('========================');
      console.log(`Action Executed: ${actionRunId}`);
      console.log(`  Order ID: ${order.id}`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Merchant: ${merchantId}`);
      console.log(`  Timestamp: ${new Date().toISOString()}`);
      console.log('========================');

      // 8. Return success response
      return NextResponse.json({
        success: true,
        message: t('action.success', userLocale),
        actionRunId,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    // 9. Handle not found
    return NextResponse.json(
      { 
        success: false,
        message: t('action.error.not_found', userLocale),
        error: 'Order not found' 
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error processing action:', error);
    return NextResponse.json(
      { 
        success: false,
        message: t('action.error.failed', userLocale),
        error: 'Failed to process action' 
      },
      { status: 500 }
    );
  }
}
```

#### 2. Key Components

**Signature Validation:**
```typescript
function validateWebhookSignature(
  data: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('hex');
  return expectedSignature === receivedSignature;
}
```

**Token Management:**
```typescript
const authToken = await AuthTokenManager.get(authorizedAppId);
if (!authToken) {
  return NextResponse.json({ error: 'Auth token not found' }, { status: 404 });
}
```

**ikas API Call:**
```typescript
const ikasClient = getIkas(authToken);
const response = await ikasClient.queries.listOrder({ id: { eq: orderId } });
```

---

### IFRAME Actions

IFRAME actions display an embedded UI within the ikas Admin.

#### 1. Create IFRAME Page

**File:** `src/app/ikas/actions/[action-name]/page.tsx`

```typescript
'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/Loading';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { t, SupportedLocale } from '@/lib/i18n';

type OrderData = {
  id: string;
  orderNumber?: string;
  orderedAt?: number;
  status: string;
  totalFinalPrice: number;
  currencyCode: string;
  customer?: {
    fullName?: string;
    email?: string;
  };
};

function OrderActionContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters
  const actionRunId = searchParams.get('actionRunId');
  const idList = searchParams.get('idList');
  const userLocale = (searchParams.get('userLocale') || 'en') as SupportedLocale;

  // Memoized translations
  const translations = useMemo(() => ({
    loading: t('page.loading', userLocale),
    error: {
      noOrderId: t('page.error.no_order_id', userLocale),
      failedToLoad: t('page.error.failed_to_load', userLocale),
      unableToAuth: t('page.error.unable_to_authenticate', userLocale),
    },
    title: t('page.title', userLocale),
    orderNumber: t('page.order_number', userLocale),
    orderDate: t('page.order_date', userLocale),
    // ... more translations
  }), [userLocale]);

  // Fetch order data from backend API
  const fetchOrderDetails = useCallback(async (
    currentToken: string,
    orderId: string
  ) => {
    try {
      const res = await ApiRequests.ikas.getOrder(currentToken, orderId);
      
      if (res.status === 200 && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError(translations.error.failedToLoad);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(translations.error.failedToLoad);
    } finally {
      setLoading(false);
    }
  }, [translations]);

  // Initialize page
  const initializePage = useCallback(async () => {
    // Parse order ID from idList
    if (!idList) {
      setError(translations.error.noOrderId);
      setLoading(false);
      return;
    }

    const orderId = idList.split(',')[0];
    if (!orderId) {
      setError(translations.error.noOrderId);
      setLoading(false);
      return;
    }

    // Get JWT token from app bridge
    const fetchedToken = await TokenHelpers.getTokenForIframeApp();
    if (fetchedToken) {
      await fetchOrderDetails(fetchedToken, orderId);
    } else {
      setError(translations.error.unableToAuth);
      setLoading(false);
    }
  }, [idList, fetchOrderDetails, translations]);

  // Close platform loader on mount
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializePage();
  }, [initializePage]);

  // Render loading state
  if (loading) {
    return <Loading message={translations.loading} />;
  }

  // Render error state
  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || translations.error.failedToLoad}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render order data
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {actionRunId && (
              <span className="block text-xs font-mono mt-1">
                Action Run ID: {actionRunId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">
              {translations.orderNumber}
            </div>
            <div className="text-lg font-semibold">
              {order.orderNumber || order.id}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">
              {translations.orderDate}
            </div>
            <div className="text-lg">
              {order.orderedAt 
                ? new Date(order.orderedAt).toLocaleDateString(userLocale)
                : 'N/A'
              }
            </div>
          </div>

          {/* Add more fields as needed */}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderActionPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <OrderActionContent />
    </Suspense>
  );
}
```

#### 2. Create Backend API for IFRAME

**File:** `src/app/api/ikas/get-order/route.ts`

```typescript
import { getIkas } from '@/helpers/api-helpers';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

export type GetOrderApiResponse = {
  order?: {
    id: string;
    orderNumber?: string;
    // ... other fields
  };
};

export async function GET(request: NextRequest) {
  try {
    // 1. Validate JWT token from Authorization header
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get orderId from query params
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // 3. Fetch OAuth token for this authorized app
    const authToken = await AuthTokenManager.get(user.authorizedAppId);
    if (!authToken) {
      return NextResponse.json({ error: 'Auth token not found' }, { status: 404 });
    }

    // 4. Call ikas GraphQL API
    const ikasClient = getIkas(authToken);
    const orderResponse = await ikasClient.queries.listOrder({ 
      id: { eq: orderId } 
    });

    // 5. Return order data
    if (orderResponse.isSuccess && orderResponse.data?.listOrder.data?.length) {
      const order = orderResponse.data.listOrder.data[0];
      
      // Log for audit purposes
      console.log('Order accessed via iframe action:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        merchantId: user.merchantId,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ order });
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
```

#### 3. Add to API Requests Helper

**File:** `src/lib/api-requests.ts`

```typescript
import { GetOrderApiResponse } from '../app/api/ikas/get-order/route';

export const ApiRequests = {
  ikas: {
    getOrder: (token: string, orderId: string) => 
      makeGetRequest<GetOrderApiResponse>({ 
        url: '/api/ikas/get-order', 
        token, 
        data: { orderId } 
      }),
  },
};
```

---

## Configuration

### ikas.config.json

Register your actions in `ikas.config.json`:

```json
{
  "portMapping": {
    "default": 3000
  },
  "oauthRedirectPath": "/api/oauth/callback/ikas",
  "runCommand": "pnpm run dev",
  "actions": [
    {
      "name": "View Order Details (IFRAME)",
      "method": "iframe",
      "actionUrl": "http://localhost:3000/ikas/actions/order-detail",
      "type": "order-detail"
    },
    {
      "name": "View Order Details (API)",
      "method": "api",
      "actionUrl": "http://localhost:3000/api/ikas/actions/order-detail",
      "type": "order-detail"
    },
    {
      "name": "View Order List",
      "method": "iframe",
      "actionUrl": "http://localhost:3000/ikas/actions/order-list",
      "type": "order-list"
    }
  ]
}
```

**Important:** Update URLs for production deployment:
```json
{
  "actionUrl": "https://your-app.example.com/ikas/actions/order-detail"
}
```

---

## Security

### API Actions: Signature Validation

All API actions **must** validate the signature to prevent unauthorized access:

```typescript
function validateWebhookSignature(
  data: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('hex');
  return expectedSignature === receivedSignature;
}
```

**Flow:**
1. ikas signs the `data` payload using your app's secret
2. Your API receives `signature` and `data`
3. You recalculate the signature using the same secret
4. Compare signatures - reject if they don't match

### IFRAME Actions: JWT Authentication

IFRAME pages authenticate via JWT tokens:

```typescript
// Frontend: Get token from App Bridge
const token = await TokenHelpers.getTokenForIframeApp();

// Backend: Validate JWT
const user = getUserFromRequest(request);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**JWT Payload:**
```typescript
{
  authorizedAppId: string; // aud
  merchantId: string;      // sub
  exp: number;            // expiration timestamp
}
```

### Best Practices

✅ **DO:**
- Always validate signatures (API actions)
- Always validate JWT tokens (IFRAME actions)
- Never log tokens or secrets
- Use HTTPS in production
- Implement rate limiting
- Log all action executions for audit

❌ **DON'T:**
- Skip signature validation
- Expose app secrets in client code
- Make direct ikas API calls from frontend
- Hardcode tokens
- Trust client-provided data without validation

---

## Localization

All actions support multiple languages via the `userLocale` parameter.

### Supported Locales

- `en` - English (default)
- `tr` - Turkish

### Implementation

**File:** `src/lib/i18n.ts`

```typescript
export type SupportedLocale = 'en' | 'tr';

type TranslationKey = 
  | 'action.success'
  | 'action.error.missing_fields'
  | 'page.loading'
  | 'page.title'
  // ... more keys

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    'action.success': 'Order details retrieved successfully',
    'action.error.missing_fields': 'Missing required fields',
    'page.loading': 'Loading order details...',
    'page.title': 'Order Details',
  },
  tr: {
    'action.success': 'Sipariş detayları başarıyla alındı',
    'action.error.missing_fields': 'Gerekli alanlar eksik',
    'page.loading': 'Sipariş detayları yükleniyor...',
    'page.title': 'Sipariş Detayları',
  },
};

export function t(key: TranslationKey, locale: string = 'en'): string {
  const supportedLocale = (locale === 'tr' ? 'tr' : 'en') as SupportedLocale;
  return translations[supportedLocale][key] || translations.en[key];
}
```

### Usage in API Actions

```typescript
const userLocale = actionData.userLocale || 'en';

return NextResponse.json({
  success: true,
  message: t('action.success', userLocale),
});
```

### Usage in IFRAME Actions

```typescript
const userLocale = (searchParams.get('userLocale') || 'en') as SupportedLocale;

const translations = useMemo(() => ({
  loading: t('page.loading', userLocale),
  title: t('page.title', userLocale),
}), [userLocale]);
```

---

## Testing

### Testing API Actions

**Using curl:**

```bash
# 1. Generate signature
SECRET="your-app-secret"
DATA='{"actionRunId":"test-123","idList":["order-id"],"userLocale":"en"}'
SIGNATURE=$(echo -n "$DATA" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 2. Send request
curl -X POST http://localhost:3000/api/ikas/actions/order-detail \
  -H "Content-Type: application/json" \
  -d "{
    \"signature\": \"$SIGNATURE\",
    \"authorizedAppId\": \"your-app-id\",
    \"merchantId\": \"your-merchant-id\",
    \"data\": \"$DATA\"
  }"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "actionRunId": "test-123",
  "orderId": "order-id",
  "orderNumber": "1001"
}
```

### Testing IFRAME Actions

**In Browser:**

```
http://localhost:3000/ikas/actions/order-detail?actionRunId=test-123&idList=order-id&userLocale=en
```

**Note:** Full functionality requires embedding in ikas Admin for App Bridge to work.

### Testing in ikas Admin

1. Register your app in ikas Partner Portal
2. Install the app on a test store
3. Navigate to an order detail page
4. Click on your app action in the actions menu
5. Verify the action executes correctly

---

## Best Practices

### Code Organization

```
src/app/
├── api/ikas/
│   ├── actions/           # API actions (server-to-server)
│   │   ├── order-detail/
│   │   └── order-list/
│   └── get-*.../          # Backend APIs for IFRAME pages
│
└── ikas/actions/          # IFRAME actions (embedded UI)
    ├── order-detail/
    └── order-list/
```

### Error Handling

**Always return structured errors:**

```typescript
// Good ✅
return NextResponse.json({
  success: false,
  message: t('action.error.not_found', userLocale),
  error: 'Order not found'
}, { status: 404 });

// Bad ❌
throw new Error('Order not found');
```

### Logging

**Log all action executions:**

```typescript
console.log('========================');
console.log(`Action Executed: ${actionRunId}`);
console.log(`  Type: order-detail`);
console.log(`  Order ID: ${orderId}`);
console.log(`  Merchant: ${merchantId}`);
console.log(`  Timestamp: ${new Date().toISOString()}`);
console.log('========================');
```

### Performance

**For bulk actions (order-list), fetch in parallel:**

```typescript
const orderPromises = orderIds.map(id =>
  ikasClient.queries.listOrder({ id: { eq: id } })
);
const results = await Promise.all(orderPromises);
```

### IFRAME Best Practices

1. **Always close the loader:**
   ```typescript
   useEffect(() => {
     AppBridgeHelper.closeLoader();
   }, []);
   ```

2. **Use Suspense for `useSearchParams`:**
   ```typescript
   export default function ActionPage() {
     return (
       <Suspense fallback={<Loading />}>
         <ActionContent />
       </Suspense>
     );
   }
   ```

3. **Handle all states:**
   - Loading
   - Error
   - Empty data
   - Success

4. **Responsive design:**
   - Test on different screen sizes
   - Use responsive Tailwind classes
   - Mobile-friendly UI

---

## Examples

This project includes complete implementations:

### Order Detail Action

**Files:**
- API: `src/app/api/ikas/actions/order-detail/route.ts`
- IFRAME: `src/app/ikas/actions/order-detail/page.tsx`
- Backend: `src/app/api/ikas/get-order/route.ts`

**Features:**
- Single order details
- Full order information (customer, addresses, line items)
- Localized UI (EN/TR)
- Error handling

### Order List Action

**Files:**
- API: `src/app/api/ikas/actions/order-list/route.ts`
- IFRAME: `src/app/ikas/actions/order-list/page.tsx`

**Features:**
- Multiple order processing
- Parallel fetching
- Summary display
- Partial failure handling
- Success/failure counts

---

## Troubleshooting

### Common Issues

#### 1. Signature Validation Fails

**Problem:** API action returns 401 "Invalid signature"

**Solutions:**
- Verify app secret is correct
- Check data is not modified before validation
- Ensure HMAC algorithm is SHA-256
- Verify UTF-8 encoding

```typescript
// Correct implementation
const signature = crypto
  .createHmac('sha256', secret)
  .update(data, 'utf8')  // Important: UTF-8 encoding
  .digest('hex');
```

#### 2. IFRAME Shows "Unauthorized"

**Problem:** Cannot get JWT token or backend rejects it

**Solutions:**
- Verify app is properly installed
- Check App Bridge is initialized
- Ensure JWT validation logic is correct
- Verify sessionStorage is accessible

```typescript
// Check token retrieval
const token = await TokenHelpers.getTokenForIframeApp();
if (!token) {
  console.error('Failed to get token from App Bridge');
}
```

#### 3. GraphQL Query Fails

**Problem:** ikas API returns errors

**Solutions:**
- Run `pnpm codegen` after changing queries
- Check GraphQL schema using MCP introspect
- Verify OAuth token is valid
- Check merchant has permissions

```typescript
// Log detailed error
if (!response.isSuccess) {
  console.error('GraphQL Error:', response.error);
}
```

#### 4. IFRAME Doesn't Close Loader

**Problem:** Platform loading indicator stays visible

**Solution:**
```typescript
// Must be in useEffect with empty deps
useEffect(() => {
  AppBridgeHelper.closeLoader();
}, []); // Empty dependency array!
```

#### 5. Translations Not Working

**Problem:** UI shows English even with userLocale=tr

**Solutions:**
- Check locale is passed correctly
- Verify translation keys exist
- Ensure fallback to 'en' works

```typescript
// Debug translations
console.log('User locale:', userLocale);
console.log('Translation:', t('page.title', userLocale));
```

### Debug Checklist

- [ ] Actions registered in `ikas.config.json`
- [ ] URLs are correct (localhost vs production)
- [ ] Signature validation implemented (API)
- [ ] JWT validation implemented (IFRAME backend)
- [ ] App Bridge helper called (IFRAME)
- [ ] Suspense boundary for `useSearchParams` (IFRAME)
- [ ] GraphQL queries in `graphql-requests.ts`
- [ ] `pnpm codegen` executed
- [ ] All translations defined
- [ ] Error handling implemented
- [ ] Logging added for audit

---

## Additional Resources

- [ACTION_ENDPOINT.md](./ACTION_ENDPOINT.md) - Detailed API specifications
- [AGENTS.md](./AGENTS.md) - Project rules and patterns
- [README.md](./README.md) - Project overview and setup

---

## Summary

**App Actions** provide a powerful way to extend the ikas Admin with custom functionality. By following this guide, you can:

✅ Implement both API and IFRAME actions  
✅ Secure your actions with signature validation and JWT  
✅ Support multiple languages  
✅ Handle errors gracefully  
✅ Provide excellent user experience  
✅ Maintain audit logs  

**Key Takeaways:**

1. Choose the right action type (API vs IFRAME) for your use case
2. Always validate security (signatures for API, JWT for IFRAME)
3. Never make direct ikas API calls from the frontend
4. Support localization from the start
5. Log all action executions for audit purposes
6. Test thoroughly before deploying to production

Happy building! 🚀

