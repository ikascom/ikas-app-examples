# ikas App Starter (Next.js 16)

Modern Next.js 16 App Router starter app for building ikas Admin apps with OAuth, Prisma, GraphQL (codegen), Tailwind + ikas App UI, and secure server routes.

> [!CAUTION]
> Apps created from versions of this template with `next@15.3.0` are vulnerable to [CVE-2025-55182 / CVE-2025-66478](https://nextjs.org/cve-2025-66478) (unauthenticated RCE). Upgrade `next`, `react` and `react-dom`, redeploy, and rotate `CLIENT_SECRET` and `SECRET_COOKIE_PASSWORD`.

## 🚀 Features

- **Next.js 16 + App Router** (Turbopack) with React 19 and TypeScript
- **OAuth for ikas**: end-to-end flow (authorize → callback → session/JWT)
- **Admin GraphQL client**: `@ikas/admin-api-client` with codegen
- **Prisma 7**: local SQLite DB to store tokens (via `AuthTokenManager`)
- **Tailwind CSS v4 + [ikas App UI](https://builders.ikas.com/docs/app-development/ui-kit/installation)** components from the `@ikas` shadcn registry
- **Iron Session** server-side session management
- **Frontend ↔ Backend bridge** via typed API helpers

## 📁 Project Structure

```
src/
├─ app/
│  ├─ api/
│  │  ├─ ikas/
│  │  │  └─ get-merchant/route.ts       # Example secure API route (JWT required)
│  │  └─ oauth/
│  │     ├─ authorize/ikas/route.ts     # Starts OAuth authorization (GET)
│  │     └─ callback/ikas/route.ts      # Handles OAuth callback, saves token
│  ├─ authorize-store/page.tsx           # Manual store authorization page
│  ├─ callback/page.tsx                  # Client handler for OAuth callback redirect
│  ├─ dashboard/page.tsx                 # Authenticated page using JWT + API bridge
│  ├─ page.tsx                           # Entry, decides auth flow
│  └─ hooks/use-base-home-page.ts        # Auth/bootstrap logic
│
├─ components/
│  ├─ home-page/index.tsx                # Simple authenticated UI
│  ├─ ikas/*                             # ikas App UI screen patterns (Page, Layout, EmptyState...)
│  └─ ui/*                               # ikas App UI primitives (Button, Card, Tabs...)
│
├─ globals/
│  ├─ config.ts                          # Env + OAuth config
│  └─ constants.ts                       # Common constants/types
│
├─ helpers/
│  ├─ api-helpers.ts                     # getIkas(), onCheckToken(), getRedirectUri()
│  ├─ jwt-helpers.ts                     # JWT create/verify
│  ├─ signature-helpers.ts               # OAuth code signature validation (server-only)
│  └─ token-helpers.ts                   # Browser token utilities (AppBridge, sessionStorage)
│
├─ generated/prisma/                    # Generated Prisma Client (gitignored, `pnpm prisma:generate`)
│
├─ lib/
│  ├─ api-requests.ts                    # Frontend → backend bridge (axios)
│  ├─ auth-helpers.ts                    # getUserFromRequest() (JWT)
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
- `SECRET_COOKIE_PASSWORD` — long random string for iron-session (at least 32 characters)
- `DATABASE_URL` — optional, defaults to `file:./prisma/dev.db`

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
- `pnpm lint` — run ESLint (`eslint .`; `next lint` was removed in Next.js 16)
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
- `GET /api/oauth/callback/ikas` validates the `signature` parameter using HMAC-SHA256 (via `TokenHelpers.validateCodeSignature`), optionally validates `state` for CSRF protection, exchanges `code` for tokens, fetches `getMerchant` and `getAuthorizedApp`, upserts token via `AuthTokenManager`, sets session, builds a short-lived JWT via `JwtHelpers.createToken`, and redirects to `/callback?...`.
- `/callback` (client) reads `token`, `redirectUrl`, `authorizedAppId`, stores token in `sessionStorage`, then redirects back to Admin.

### OAuth Callback Security
The OAuth callback endpoint requires a `signature` query parameter to validate the authorization code:
- **Signature Generation**: `HMAC-SHA256(code, clientSecret)` in hex format
- **Validation**: `TokenHelpers.validateCodeSignature(code, signature, clientSecret)`
- **State Parameter**: Optional but recommended for additional CSRF protection

## 🔑 Auth and API Calls

- Browser obtains JWT via AppBridge or OAuth callback and stores it in `sessionStorage`.
- Frontend calls backend routes with `Authorization: JWT <token>`.
- Example backend route: `GET /api/ikas/get-merchant` uses `getUserFromRequest()` to extract `merchantId` and `authorizedAppId`, loads the stored token via `AuthTokenManager`, creates GraphQL client with `getIkas()`, then calls `ikasClient.queries.getMerchant()`.

Frontend bridge (`src/lib/api-requests.ts`):

```ts
ApiRequests.ikas.getMerchant(token) // -> GET /api/ikas/get-merchant
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

- Local SQLite DB located under `prisma/dev.db` (override with `DATABASE_URL`) with schema managed by `schema.prisma`.
- Prisma 7 setup: CLI config in `prisma.config.ts`, client generated into `src/generated/prisma`, SQLite accessed through `@prisma/adapter-better-sqlite3` in `src/lib/prisma.ts`.
- `AuthTokenManager` persists tokens (`models/auth-token/*`).
- Use Prisma Studio to inspect tokens:

```bash
pnpm prisma:studio
```

## 🧩 UI and Styling

- Tailwind v4 with CSS file at `src/app/globals.css`; ikas tokens come from `npx shadcn@latest add @ikas/theme`.
- ikas App UI components under `src/components/ikas/*` and `src/components/ui/*`, installed from the `@ikas` registry in `components.json`.
- Add a component: `npx shadcn@latest add @ikas/<name>` (list: `https://builders.ikas.com/r/registry.json`).
- Design rules for humans and AI agents: `ikas-ui.md` and the "UI (ikas App UI)" section of `AGENTS.md`.
- The ikas panel already shows the app icon, name and plan button above the iframe; do not repeat them inside the app.

## 🧰 MCP Helpers

- UI scaffolding: the shadcn MCP sees the `@ikas` registry through `components.json`; search and install ikas components with it.
- ikas GraphQL: use ikas MCP list + introspect before adding operations.

## 🔒 Security

- Never log secrets or tokens. Do not expose access/refresh tokens to the client.
- Use the short-lived JWT for browser → server auth; server uses stored OAuth tokens.
- `onCheckToken` auto-refreshes tokens server-side.
- OAuth callback uses HMAC-SHA256 signature validation (constant-time compare) to verify authorization code authenticity before token exchange.
- Keep `next`, `react` and `react-dom` patched and run `pnpm audit --prod` before releases.

## 📝 License

MIT

## 🤝 Contributing

- Use Conventional Commits. Example: `feat(auth): add token refresh on client`
- Ensure type-safety and linter cleanliness.

## 📞 Support

- ikas Admin GraphQL: `https://api.myikas.com/api/v2/admin/graphql`
- File issues or questions in this repo.
