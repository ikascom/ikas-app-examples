# ikas App Starter (Next.js 15)

Modern Next.js 15 App Router starter app for building ikas Admin apps with OAuth, Prisma, GraphQL (codegen), Tailwind + shadcn/ui, and secure server routes.

## 🚀 Features

- **Next.js 15 + App Router** with React 19 and TypeScript
- **OAuth for ikas**: end-to-end flow (authorize → callback → session/JWT)
- **Admin GraphQL client**: `@ikas/admin-api-client` with codegen
- **App Actions**: API and IFRAME actions for order management
- **Prisma**: local dev DB to store tokens (via `AuthTokenManager`)
- **Tailwind CSS v4 + shadcn/ui** components
- **Iron Session** server-side session management
- **Frontend ↔ Backend bridge** via typed API helpers
- **Internationalization**: Multi-language support (EN/TR)

## 📁 Project Structure

```
src/
├─ app/
│  ├─ api/
│  │  ├─ ikas/
│  │  │  ├─ actions/
│  │  │  │  ├─ order-detail/route.ts    # API action: single order
│  │  │  │  └─ order-list/route.ts      # API action: multiple orders
│  │  │  ├─ get-merchant/route.ts       # Example secure API route (JWT required)
│  │  │  └─ get-order/route.ts          # Backend API for iframe order fetching
│  │  └─ oauth/
│  │     ├─ authorize/ikas/route.ts     # Starts OAuth authorization (GET)
│  │     └─ callback/ikas/route.ts      # Handles OAuth callback, saves token
│  ├─ authorize-store/page.tsx           # Manual store authorization page
│  ├─ callback/page.tsx                  # Client handler for OAuth callback redirect
│  ├─ dashboard/page.tsx                 # Authenticated page using JWT + API bridge
│  ├─ ikas/actions/
│  │  ├─ order-detail/page.tsx          # IFRAME action: single order
│  │  └─ order-list/page.tsx            # IFRAME action: multiple orders
│  ├─ page.tsx                           # Entry, decides auth flow
│  └─ hooks/use-base-home-page.ts        # Auth/bootstrap logic
│
├─ components/
│  ├─ home-page/index.tsx                # Simple authenticated UI
│  └─ ui/*                               # shadcn/ui components
│
├─ globals/
│  ├─ config.ts                          # Env + OAuth config
│  └─ constants.ts                       # Common constants/types
│
├─ helpers/
│  ├─ api-helpers.ts                     # getIkas(), onCheckToken(), getRedirectUri()
│  ├─ jwt-helpers.ts                     # JWT create/verify
│  └─ token-helpers.ts                   # Browser token utilities (AppBridge)
│
├─ lib/
│  ├─ api-requests.ts                    # Frontend → backend bridge (axios)
│  ├─ auth-helpers.ts                    # getUserFromRequest() (JWT)
│  ├─ i18n.ts                            # Internationalization (EN/TR)
│  ├─ ikas-client/
│  │  ├─ graphql-requests.ts             # gql documents (queries/mutations)
│  │  ├─ codegen.ts                      # GraphQL Codegen config
│  │  └─ generated/graphql.ts            # Generated types + client
│  ├─ prisma.ts                          # Prisma client
│  ├─ session.ts                         # iron-session wrappers
│  └─ validation.ts                      # zod helpers
│
└─ models/
   └─ auth-token/                        # Token store via Prisma
      ├─ index.ts                        # AuthToken interface
      └─ manager.ts                      # CRUD with Prisma
```

## 🛠️ Setup

1) Install dependencies

```bash
pnpm install
```

2) Create env file and set variables

```bash
cp .env.example .env.local
```

Required envs (see `src/globals/config.ts`):

- `NEXT_PUBLIC_GRAPH_API_URL` — ikas Admin GraphQL URL (e.g. `https://api.myikas.com/api/v2/admin/graphql`)
- `NEXT_PUBLIC_ADMIN_URL` — ikas Admin base with `{storeName}` placeholder (e.g. `https://{storeName}.myikas.com/admin`)
- `NEXT_PUBLIC_CLIENT_ID` — your ikas app client id
- `CLIENT_SECRET` — your ikas app client secret
- `NEXT_PUBLIC_DEPLOY_URL` — public base URL of this app (e.g. `https://yourapp.example.com`)
- `SECRET_COOKIE_PASSWORD` — long random string for iron-session

3) Initialize Prisma (first run)

```bash
pnpm prisma:init
```

4) Generate GraphQL types (whenever you change `graphql-requests.ts`)

```bash
pnpm codegen
```

5) Start dev server

```bash
pnpm dev
```

Port and redirect path are also defined in `ikas.config.json`:

```json
{
  "portMapping": { "default": 3000 },
  "oauthRedirectPath": "/api/oauth/callback/ikas",
  "runCommand": "pnpm run dev"
}
```

## 📦 Scripts

- `pnpm dev` — start Next.js in dev
- `pnpm build` — build production
- `pnpm start` — start production server
- `pnpm lint` — run ESLint
- `pnpm codegen` — GraphQL Codegen using `src/lib/ikas-client/codegen.ts`
- `pnpm prisma:init` — generate client and push schema to local DB
- `pnpm prisma:migrate` — create/apply migrations
- `pnpm prisma:generate` — regenerate Prisma client
- `pnpm prisma:studio` — open Prisma Studio
- `pnpm ui:check` / `pnpm ui:sync` — compare the installed @ikas registry files with builders.ikas.com and refresh outdated ones

## 🔐 OAuth Flow

- User starts at `/` which runs `use-base-home-page`:
  - If embedded (iFrame) and a valid token exists via `TokenHelpers.getTokenForIframeApp()`, redirect to `/dashboard`.
  - Otherwise, if `storeName` is present in query, redirect to `/api/oauth/authorize/ikas?storeName=...`.
  - Else route to `/authorize-store` where user enters store name.

- `GET /api/oauth/authorize/ikas` validates `storeName`, sets `state` in session, and redirects to ikas authorize URL.
- `GET /api/oauth/callback/ikas` exchanges `code` for tokens, fetches `getMerchant` and `getAuthorizedApp`, upserts token via `AuthTokenManager`, sets session, builds a short-lived JWT via `JwtHelpers.createToken`, and redirects to `/callback?...`.
- `/callback` (client) reads `token`, `redirectUrl`, `authorizedAppId`, stores token in `sessionStorage`, then redirects back to Admin.

### OAuth Callback Security
The OAuth callback endpoint requires a `signature` query parameter to validate the authorization code:
- **Signature Generation**: `HMAC-SHA256(code, clientSecret)` in hex format
- **Validation**: `validateCodeSignature(code, signature, clientSecret)` from `src/helpers/signature-helpers.ts` (server-only)
- **State Parameter**: Optional but recommended for additional CSRF protection

## 🎯 App Actions

This starter includes two types of **ikas App Actions** for order management:

### Action Types

1. **API Actions** — Direct server-to-server calls with signature validation
2. **IFRAME Actions** — Embedded UI pages that fetch data via backend APIs

### Order Detail Action (Single Order)

Fetches and displays comprehensive details for a single order.

**API Endpoint:** `POST /api/ikas/actions/order-detail`

```json
{
  "signature": "hmac-sha256-signature",
  "authorizedAppId": "app-id",
  "merchantId": "merchant-id",
  "data": "{\"actionRunId\":\"uuid\",\"idList\":[\"order-id\"],\"userLocale\":\"en\"}"
}
```

**IFRAME Page:** `/ikas/actions/order-detail?actionRunId=uuid&idList=order-id&userLocale=en`

Shows:
- Order number and date
- Order status (order, payment, package)
- Total amount
- Customer information
- Billing/shipping addresses
- Line items with quantities and prices

### Order List Action (Multiple Orders)

Fetches and displays multiple orders in a single request/page.

**API Endpoint:** `POST /api/ikas/actions/order-list`

```json
{
  "signature": "hmac-sha256-signature",
  "authorizedAppId": "app-id",
  "merchantId": "merchant-id",
  "data": "{\"actionRunId\":\"uuid\",\"idList\":[\"order-id-1\",\"order-id-2\",\"order-id-3\"],\"userLocale\":\"en\"}"
}
```

**IFRAME Page:** `/ikas/actions/order-list?actionRunId=uuid&idList=order-id-1,order-id-2,order-id-3&userLocale=en`

Shows:
- Summary of all requested orders
- Card-based list layout
- Order status indicators
- Customer information
- Total amounts
- Success/failure counts

### Signature Validation (API Actions)

All API actions validate the request signature using HMAC-SHA256:

```ts
const signature = crypto
  .createHmac('sha256', appSecret)
  .update(dataString, 'utf8')
  .digest('hex');
```

The `data` field contains JSON with `actionRunId`, `idList`, and optional `userLocale`.

### Localization Support

Both actions support multiple languages via the `userLocale` parameter:

- **Supported locales:** `en` (English), `tr` (Turkish)
- **Default:** `en`
- **Implementation:** Centralized in `src/lib/i18n.ts`

All UI text, error messages, and API responses are localized.

### File Structure

```
src/app/
├─ api/ikas/
│  ├─ actions/
│  │  ├─ order-detail/route.ts     # API: single order
│  │  └─ order-list/route.ts       # API: multiple orders
│  └─ get-order/route.ts            # Backend API for iframe pages
│
└─ ikas/actions/
   ├─ order-detail/page.tsx         # IFRAME: single order
   └─ order-list/page.tsx           # IFRAME: multiple orders
```

### Testing Actions

**API Method (using curl):**

```bash
curl -X POST http://localhost:3000/api/ikas/actions/order-detail \
  -H "Content-Type: application/json" \
  -d '{
    "signature": "your-signature",
    "authorizedAppId": "your-app-id",
    "merchantId": "your-merchant-id",
    "data": "{\"actionRunId\":\"test-123\",\"idList\":[\"order-id\"],\"userLocale\":\"en\"}"
  }'
```

**IFRAME Method:**

Open in browser (must be embedded in ikas Admin for full functionality):

```
http://localhost:3000/ikas/actions/order-detail?actionRunId=test-123&idList=order-id&userLocale=en
```

### Key Features

- ✅ Secure signature validation (API)
- ✅ JWT token authentication (IFRAME)
- ✅ Parallel order fetching (Order List)
- ✅ Comprehensive error handling
- ✅ Audit logging
- ✅ Localization (EN/TR)
- ✅ Responsive UI design
- ✅ Type-safe GraphQL integration
- ✅ Graceful partial failure handling

**📚 Documentation:**
- **[App Actions Guide](./APP_ACTIONS_GUIDE.md)** — Complete guide for implementing app actions
- **[Action API Reference](./ACTION_ENDPOINT.md)** — Detailed API specifications and examples

## 🔑 Auth and API Calls

- Browser obtains JWT via AppBridge or OAuth callback and stores it in `sessionStorage`.
- Frontend calls backend routes with `Authorization: JWT <token>`.
- Example backend route: `GET /api/ikas/get-merchant` uses `getUserFromRequest()` to extract `merchantId` and `authorizedAppId`, loads the stored token via `AuthTokenManager`, creates GraphQL client with `getIkas()`, then calls `ikasClient.queries.getMerchant()`.

Frontend bridge (`src/lib/api-requests.ts`):

```ts
ApiRequests.ikas.getMerchant(token) // -> GET /api/ikas/get-merchant
ApiRequests.ikas.getOrder(token, orderId) // -> GET /api/ikas/get-order
```

## 🧠 GraphQL Workflow (ikas Admin)

- Define documents in `src/lib/ikas-client/graphql-requests.ts` using `gql`:

```ts
export const GET_MERCHANT = gql`
  query getMerchant { getMerchant { id email storeName } }
`;
```

- Run `pnpm codegen` to regenerate `src/lib/ikas-client/generated/graphql.ts`.
- Create client via `getIkas(token)` which auto-refreshes tokens in `onCheckToken`.
- Use: `ikasClient.queries.getMerchant()` or `ikasClient.mutations.someMutation(vars)`.

MCP guidance (required before adding new ops):
- Discover operation with ikas MCP list, then introspect shape.
- Add to `graphql-requests.ts`, then run `pnpm codegen`.

## 🗃️ Database (Prisma)

- Local SQLite DB located under `prisma/dev.db` with schema managed by `schema.prisma`.
- `AuthTokenManager` persists tokens (`models/auth-token/*`).
- Use Prisma Studio to inspect tokens:

```bash
pnpm prisma:studio
```

## 🧩 UI and Styling

- Tailwind v4 with CSS file at `src/app/globals.css`.
- shadcn/ui components under `src/components/ui/*`.

## 🧰 MCP Helpers

- UI scaffolding: use shadcn MCP to fetch components/demos and place under `src/components/ui/*`.
- ikas GraphQL: use ikas MCP list + introspect before adding operations.

## 🔒 Security

- Never log secrets or tokens. Do not expose access/refresh tokens to the client.
- Use the short-lived JWT for browser → server auth; server uses stored OAuth tokens.
- `onCheckToken` auto-refreshes tokens server-side.
- OAuth callback uses HMAC-SHA256 signature validation to verify authorization code authenticity before token exchange.

## 📝 License

MIT

## 🤝 Contributing

- Use Conventional Commits. Example: `feat(auth): add token refresh on client`
- Ensure type-safety and linter cleanliness.

## 📞 Support

- ikas Admin GraphQL: `https://api.myikas.com/api/v2/admin/graphql`
- File issues or questions in this repo.
