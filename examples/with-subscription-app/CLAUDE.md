

<!-- Source: AGENTS.md -->

# Project Rules for Ikas App Starter App (Next.js)

## Core Principles
- Prefer simplicity, readability, explicitness. Keep logic in small, testable functions.
- TypeScript strict; avoid any. Use precise types from generated GraphQL.
- Treat API tokens and secrets as sensitive; never log them.

## Stack Overview
- Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind CSS v4 + ikas App UI (shadcn registry `@ikas`).
- Prisma 7 (`prisma-client` generator, output in `src/generated/prisma`, SQLite via `@prisma/adapter-better-sqlite3`).
- ikas Admin GraphQL via `@ikas/admin-api-client` with codegen.
- Session via `iron-session`.

## MCP Usage
- When generating new UI, use the "shadcn" MCP against the `@ikas` registry (see "UI (ikas App UI)" below). Do not pull plain shadcn components when an `@ikas` one exists.
- When generating or exploring ikas GraphQL operations, use the "ikas" MCP list and introspect tools to discover available queries/mutations and their shapes before implementation.
  - For ikas GraphQL specifically, follow this order before any implementation:
    1) Use the "ikas" MCP list tool to find the correct query/mutation name.
    2) Use the "ikas" MCP introspect tool to get the operation's full shape (variables, return fields, enums).
    3) Only after confirming via list + introspect, add the document to `graphql-requests.ts` and run codegen.

## GraphQL and API Workflow
- Define queries/mutations in `src/lib/ikas-client/graphql-requests.ts` using `gql`.
- Run `pnpm codegen` to regenerate `src/lib/ikas-client/generated/graphql.ts` types and client wrappers.
- Acquire a client with `getIkas(token)` from `src/helpers/api-helpers.ts`.
- Execute queries via `ikasClient.queries.<name>()` and mutations via `ikasClient.mutations.<name>(variables)`.

## Enforcement
- Do NOT write inline GraphQL strings inside API routes or components.
- Always import documents from `graphql-requests.ts` and run `pnpm codegen` before usage.
- Always call ikas operations through `ikasClient.queries|mutations.<operation>()` to keep type-safety.
- Before adding a new operation, first run the ikas MCP list tool, then introspect to confirm details.

## Adding New API Requests (Procedure)
1) Discover operation via MCP: run ikas list to locate the operation, then ikas introspect to confirm its schema.
2) Add your GraphQL query/mutation to `src/lib/ikas-client/graphql-requests.ts` using the `gql` tag.
3) Run `pnpm codegen` to generate types and update the generated client.
4) Use `getIkas` to create the ikas client inside API routes or server actions.
5) For a query, call `ikasClient.queries.<YourQuery>()`; for a mutation, call `ikasClient.mutations.<YourMutation>(variables)`.

## Project Conventions
- API routes under `src/app/api/*` must validate session and fetch the token via `getUserFromRequest` and `AuthTokenManager`.
- Do not call ikas APIs from the browser; always go through server routes.
- Keep UI logic in components under `src/components/*`; avoid business logic in pages.

## UI (ikas App UI)
The app is rendered inside the ikas admin panel and must look like part of it. UI is built from the ikas App UI kit,
a shadcn registry registered in `components.json` as `@ikas` (`https://builders.ikas.com/r/{name}.json`).

### Discover components dynamically (do not guess)
1. Read `ikas-ui.md` (project root) before writing or changing any UI. It maps every need to a component and holds the visual, text and state rules.
2. Look up what exists: shadcn MCP (`search_items_in_registries` / `view_items_in_registries` on `@ikas`) or `https://builders.ikas.com/r/registry.json`.
   Each item's docs live under `https://builders.ikas.com/docs/app-development/ui-kit/components/<name>`.
3. Build screens from `@/components/ikas/*` (screen patterns) and `@/components/ui/*` (primitives).
4. If a component is missing, install it with `npx shadcn@latest add @ikas/<name>`. Never hand-write a component the registry already has.
5. Do not edit `ikas-ui.md` or files installed from the registry; re-running `shadcn add` overwrites them. Project-specific rules go in this file.

### Rule 1: the ikas panel owns the app header
The panel draws a fixed header above the iframe: back button, app icon, app name and the plan button ("Planı Yönet").
Developers cannot change it.
- NEVER render the app logo, app icon or app name again inside the iframe (no "logo + app name" row, no brand bar).
  Repeating it stacks two brand rows on top of each other.
- The first row of an app screen is navigation or the screen's own `PageHeader` (screen title such as "Şablonlar", not the app name).
- A top navigation row holds the section tabs on the left and, optionally, small status such as a plan `Badge` on the right.
- Plan or billing actions belong to the panel's "Planı Yönet" button; do not add another "upgrade" button to the header row.

```tsx
// Wrong: duplicates the panel header
<header><img src="/logo.png" /> LabelKit <Tabs>...</Tabs></header>

// Right: tabs first, no brand
<Tabs defaultValue="templates">
  <div className="flex items-center justify-between">
    <TabsList>{/* Şablonlar, Editör, Yazıcı ... */}</TabsList>
    <Badge status="success" dot>Pro</Badge>
  </div>
  <TabsContent value="templates">...</TabsContent>
</Tabs>
```

### Rule 2: solid outside, outline inside (nested tabs)
Two nested tab rows must never share a style; the user has to see which level they are on.
- Level 1, page navigation: solid tabs, `<TabsList>` (default variant, filled track with a raised active pill).
- Level 2, sub views inside a section: outline tabs, `<TabsList variant="line">` (underline, no fill).
- Inside a card header or toolbar: `SegmentedControl size="sm"` (or `mode="radio"` when it picks a value instead of a view).
- Never nest more than two tab levels; use a `Select`, a side menu or a separate page instead.
- Never put solid tabs inside solid tabs, or line tabs inside line tabs.
- Same idea as buttons: one solid action per section, everything else `outline` / `soft` / `ghost`.

```tsx
<Tabs defaultValue="editor">
  <TabsList>                          {/* level 1: solid */}
    <TabsTrigger value="editor">Editör</TabsTrigger>
    <TabsTrigger value="printer">Yazıcı</TabsTrigger>
  </TabsList>
  <TabsContent value="editor">
    <Tabs defaultValue="layout">
      <TabsList variant="line">        {/* level 2: outline */}
        <TabsTrigger value="layout">Yerleşim</TabsTrigger>
        <TabsTrigger value="fields">Alanlar</TabsTrigger>
      </TabsList>
    </Tabs>
  </TabsContent>
</Tabs>
```

## Iframe Pages and Authentication Pattern
When building pages that will be loaded in iframes within the ikas dashboard (e.g., app actions, dashboard widgets):

### Client-Side Pattern (Frontend)
1. **Always call `AppBridgeHelper.closeLoader()`** in a separate `useEffect` with empty dependency array on page mount to close the ikas platform loading indicator.
2. **Always use `TokenHelpers.getTokenForIframeApp()`** to retrieve the JWT authentication token from the ikas app bridge.
3. **Never make direct API calls** to ikas from the frontend. Always go through backend API routes.
4. **Use `ApiRequests` helper** to call backend endpoints with the token.
5. **Follow the dashboard page pattern**: Initialize token on mount, fetch data with token, handle loading/error states.

### Example Pattern:
```typescript
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { AppBridgeHelper } from '@ikas/app-helpers';

function MyIframePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (token: string) => {
    const res = await ApiRequests.ikas.getData(token);
    if (res.status === 200 && res.data?.data) {
      setData(res.data.data);
    }
    setLoading(false);
  }, []);

  // Close the loader shown by ikas platform when opening the iframe
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  // Set state only from promise callbacks (react-hooks/set-state-in-effect)
  useEffect(() => {
    let cancelled = false;
    TokenHelpers.getTokenForIframeApp().then(async (token) => {
      if (!cancelled && token) await fetchData(token);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  // ... render UI
}
```

### Server-Side Pattern (Backend API)
1. **Create API endpoint under `/api/ikas/*`** for ikas-related operations.
2. **Validate JWT token** using `getUserFromRequest(request)` to extract `authorizedAppId` and `merchantId`.
3. **Fetch OAuth token** from `AuthTokenManager.get(authorizedAppId)`.
4. **Call ikas API** using `getIkas(authToken)` client.
5. **Return data in standard format**: `{ data: { ...yourData } }`.

### Example Pattern:
```typescript
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const authToken = await AuthTokenManager.get(user.authorizedAppId);
  if (!authToken) return NextResponse.json({ error: 'Auth token not found' }, { status: 404 });

  const ikasClient = getIkas(authToken);
  const response = await ikasClient.queries.someQuery();

  if (response.isSuccess && response.data) {
    return NextResponse.json({ data: { ...response.data } });
  }
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}
```

### Adding New Iframe Endpoints
1. **Create backend API** in `/api/ikas/<endpoint-name>/route.ts`.
2. **Add to ApiRequests** in `src/lib/api-requests.ts`:
   ```typescript
   yourEndpoint: (token: string, params?) => makeGetRequest<YourResponse>({ url: '/api/ikas/your-endpoint', token, data: params })
   ```
3. **Use in frontend** via `ApiRequests.ikas.yourEndpoint(token, params)`.

### Important Rules
- **ALWAYS** call `AppBridgeHelper.closeLoader()` in a `useEffect(() => { AppBridgeHelper.closeLoader(); }, [])` when the iframe page mounts to close the platform loading indicator.
- **NEVER** bypass the token flow by hardcoding tokens or using environment variables for user authentication.
- **ALWAYS** wrap `useSearchParams()` usage in a `<Suspense>` boundary (Next.js App Router requirement).
- **ALWAYS** follow the established pattern: AppBridgeHelper.closeLoader() → TokenHelpers → ApiRequests → Backend API → ikas Client.
- **ALWAYS** handle loading and error states gracefully in iframe pages.

## Security and Privacy
- Use `onCheckToken` in `getIkas` to auto-refresh tokens. Do not expose tokens in responses or logs.
- TokenHelpers automatically caches tokens in sessionStorage with expiration validation.
- JWT tokens contain `authorizedAppId` (aud) and `merchantId` (sub) for user identification.
- **OAuth Callback Signature Validation**: The OAuth callback endpoint validates authorization codes using HMAC-SHA256 signatures.
  - Use `validateCodeSignature(code, signature, clientSecret)` from `src/helpers/signature-helpers.ts` (server-only, constant-time compare) to verify code authenticity.
  - Never import server helpers (`signature-helpers`, `api-helpers`, Prisma) into client components; `TokenHelpers` is browser-only.
  - The callback route requires a `signature` query parameter and validates it before exchanging the code for tokens.
  - State parameter validation is optional but recommended for additional CSRF protection.

## Dependency Security
- Keep `next`, `react` and `react-dom` on the latest patch of a supported line. Next.js 15.3.0 / React 19.1.0 were affected by
  CVE-2025-55182 / CVE-2025-66478 (unauthenticated RCE via Server Actions); an app built from the old template was compromised this way.
- Run `pnpm audit --prod` before releasing and when bumping dependencies.

## Quality Gates
- Run `pnpm codegen` when `graphql-requests.ts` changes, and `pnpm prisma:generate` when `prisma/schema.prisma` changes.
- `pnpm lint` (ESLint CLI; `next lint` no longer exists) and `pnpm build` must pass.
- Ensure type-safety and linter cleanliness before committing.
- Reject PRs that introduce raw GraphQL usage outside `graphql-requests.ts`.
- Keep naming consistent with `ikas` brand and command patterns.

## Notes
- Prefer `ApiRequests` in `src/lib/api-requests.ts` to bridge frontend to backend endpoints.

## Commit Message Rule
Use **Conventional Commits** format:

- **Format**: `<type>(<scope>): <short summary>`
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Scope**: optional, lowercase, represents the module / package / area
- **Summary**: imperative mood, max 72 chars

### Examples
- feat(cart): add discount code validation  
- fix(auth): prevent token refresh loop  
- docs(readme): update installation guide  

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
