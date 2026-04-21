# ikas App Starter — with Subscription (Next.js 15)

Next.js 15 App Router starter for building ikas Admin apps that require a **paid subscription / licence**. It includes the full OAuth flow, merchant licence gating, payment webhook handling, Prisma-backed token storage, GraphQL codegen, and Tailwind + shadcn/ui.

## 🚀 Features

- **Next.js 15 + App Router** with React 19 and TypeScript
- **OAuth for ikas**: end-to-end flow (authorize → callback → session/JWT)
- **Merchant licence gating**: dashboard access requires an active `appSubscription`
- **Payment webhook**: receives and processes ikas payment status callbacks (`PAID`, `PAYMENT_FAILED`, `WAITING_FOR_PAYMENT`)
- **Admin GraphQL client**: `@ikas/admin-api-client` with codegen
- **Prisma (SQLite)**: persists OAuth tokens via `AuthTokenManager`
- **Tailwind CSS v4 + shadcn/ui** components
- **Iron Session** for server-side session state
- **Frontend ↔ Backend bridge** via typed API helpers

## 📁 Project Structure

```
src/
├─ app/
│  ├─ api/
│  │  ├─ ikas/
│  │  │  ├─ get-merchant/route.ts          # Secure API route (JWT required)
│  │  │  └─ get-merchant-licence/route.ts  # Returns licence + appSubscriptions
│  │  ├─ oauth/
│  │  │  ├─ authorize/ikas/route.ts        # Starts OAuth authorization (GET)
│  │  │  └─ callback/ikas/route.ts         # Handles OAuth callback, saves token
│  │  └─ webhooks/
│  │     └─ payment/route.ts               # Public payment webhook from ikas
│  ├─ authorize-store/page.tsx              # Manual store authorization page
│  ├─ callback/page.tsx                     # Client handler for OAuth callback
│  ├─ dashboard/page.tsx                    # Gated page — requires active subscription
│  ├─ subscription/page.tsx                 # Shown when no active licence exists
│  ├─ page.tsx                              # Entry, decides auth flow
│  └─ hooks/use-base-home-page.ts           # Auth/bootstrap logic
│
├─ components/
│  ├─ home-page/index.tsx                   # Dashboard UI (shows active plan)
│  ├─ Loading/index.tsx                     # Shared loading state
│  └─ ui/*                                  # shadcn/ui components
│
├─ globals/
│  ├─ config.ts                             # Env + OAuth config
│  └─ constants.ts                          # Common constants/types
│
├─ helpers/
│  ├─ api-helpers.ts                        # getIkas(), onCheckToken(), getRedirectUri()
│  ├─ jwt-helpers.ts                        # JWT create/verify
│  └─ token-helpers.ts                      # Token utilities (AppBridge, signature validation)
│
├─ lib/
│  ├─ api-requests.ts                       # Frontend → backend bridge (axios)
│  ├─ auth-helpers.ts                       # getUserFromRequest() (JWT)
│  ├─ ikas-client/
│  │  ├─ graphql-requests.ts                # gql documents (queries/mutations)
│  │  ├─ codegen.ts                         # GraphQL Codegen config
│  │  └─ generated/graphql.ts               # Generated types + client
│  ├─ prisma.ts                             # Prisma client
│  ├─ session.ts                            # iron-session wrappers
│  └─ validation.ts                         # zod helpers
│
├─ models/
│  └─ auth-token/                           # Token store via Prisma
│     ├─ index.ts                           # AuthToken interface
│     └─ manager.ts                         # CRUD with Prisma
│
└─ types/
   └─ subscription.ts                       # MerchantAppSubscription + webhook types
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
- `pnpm apply:ai-rules` — apply Ruler agent configs

## 🔐 OAuth Flow

- User starts at `/` which runs `use-base-home-page`:
  - If embedded (iFrame) and a valid token exists via `TokenHelpers.getTokenForIframeApp()`, redirect to `/dashboard`.
  - Otherwise, if `storeName` is present in query, redirect to `/api/oauth/authorize/ikas?storeName=...`.
  - Else route to `/authorize-store` where user enters store name.

- `GET /api/oauth/authorize/ikas` validates `storeName`, sets `state` in session, and redirects to ikas authorize URL.
- `GET /api/oauth/callback/ikas` validates the `signature` parameter using HMAC-SHA256 (via `TokenHelpers.validateCodeSignature`), optionally validates `state` for CSRF protection, exchanges `code` for tokens, fetches `getMerchant` and `getAuthorizedApp`, upserts token via `AuthTokenManager`, sets session, builds a short-lived JWT via `JwtHelpers.createToken`, and redirects to `/callback?...`.
- `/callback` (client) reads `token`, `redirectUrl`, `authorizedAppId`, stores token in `sessionStorage`, then redirects back to Admin.

### OAuth Callback Security
The OAuth callback endpoint requires a `signature` query parameter to validate the authorization code:
- **Signature Generation**: `HMAC-SHA256(code, clientSecret)` in hex format
- **Validation**: `TokenHelpers.validateCodeSignature(code, signature, clientSecret)`
- **State Parameter**: Optional but recommended for additional CSRF protection

## 💳 Subscription / Licence Gating

This starter demonstrates how to require an active paid subscription before granting access to the app's features.

### Flow

1. After OAuth succeeds the user lands on `/dashboard`.
2. On mount, the dashboard calls `ApiRequests.ikas.getMerchantLicence(token)` which hits `GET /api/ikas/get-merchant-licence`.
3. The API route runs `ikasClient.queries.getMerchantLicence()` and returns the merchant's licence including `appSubscriptions`.
4. The client searches for an active (non-deleted) `appSubscription`:
   - **Found** → render the dashboard with plan name, status, price, period, and last payment date.
   - **Not found** → redirect to `/subscription`, which prompts the merchant to purchase a licence via the **Manage** button in the ikas admin.

### Relevant files

- `src/app/api/ikas/get-merchant-licence/route.ts` — JWT-gated endpoint that calls `getMerchantLicence`.
- `src/app/dashboard/page.tsx` — performs the `checkSubscription` gate.
- `src/app/subscription/page.tsx` — "No Active Licence" fallback UI.
- `src/components/home-page/index.tsx` — renders the active subscription card.
- `src/types/subscription.ts` — `MerchantAppSubscription` type derived from generated GraphQL.

## 📬 Payment Webhook

ikas sends payment lifecycle events to `POST /api/webhooks/payment`. The endpoint is **public** (no JWT) because it is invoked by ikas, not the browser.

Payload shape (`IkasWebhook`):

```ts
{
  scope: string;        // e.g. "store/appPayment/update"
  merchantId: string;
  data: string;         // JSON string — parse to WebhookPaymentData
}
```

`WebhookPaymentData` fields: `paymentStatus`, `subscriptionKey`, `merchantId`, `paymentId?`, `paymentDate?`.

Handled statuses: `PAID`, `PAYMENT_FAILED`, `WAITING_FOR_PAYMENT`. The default handler logs the event; extend the `switch` in `src/app/api/webhooks/payment/route.ts` to persist state, notify users, or toggle feature access in your own data model.

## 🔑 Auth and API Calls

- Browser obtains JWT via AppBridge or OAuth callback and stores it in `sessionStorage`.
- Frontend calls backend routes with `Authorization: JWT <token>`.
- Backend routes use `getUserFromRequest()` to extract `merchantId` and `authorizedAppId`, load the OAuth token via `AuthTokenManager`, create a GraphQL client with `getIkas()`, and run ikas queries/mutations.

Frontend bridge (`src/lib/api-requests.ts`):

```ts
ApiRequests.ikas.getMerchant(token)          // -> GET /api/ikas/get-merchant
ApiRequests.ikas.getMerchantLicence(token)   // -> GET /api/ikas/get-merchant-licence
```

## 🧠 GraphQL Workflow (ikas Admin)

- Define documents in `src/lib/ikas-client/graphql-requests.ts` using `gql`. This starter ships with:
  - `getMerchant`
  - `getAuthorizedApp`
  - `getMerchantLicence` (with nested `appSubscriptions`)
- Run `pnpm codegen` to regenerate `src/lib/ikas-client/generated/graphql.ts`.
- Create client via `getIkas(token)` which auto-refreshes tokens in `onCheckToken`.
- Use: `ikasClient.queries.getMerchantLicence()` or `ikasClient.mutations.someMutation(vars)`.

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
- The payment webhook endpoint is intentionally public; if you extend it to mutate business state, validate the payload origin (e.g. via shared secret / signature) before trusting it.

## 📝 License

MIT

## 🤝 Contributing

- Use Conventional Commits. Example: `feat(auth): add token refresh on client`
- Ensure type-safety and linter cleanliness.

## 📞 Support

- ikas Admin GraphQL: `https://api.myikas.com/api/v2/admin/graphql`
- File issues or questions in this repo.
