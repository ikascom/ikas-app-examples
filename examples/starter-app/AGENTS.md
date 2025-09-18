# Project Rules for Ikas App Starter App (Next.js)

## Core Principles
- Prefer simplicity, readability, explicitness. Keep logic in small, testable functions.
- TypeScript strict; avoid any. Use precise types from generated GraphQL.
- Treat API tokens and secrets as sensitive; never log them.

## Stack Overview
- Next.js 15 App Router, React 19, TypeScript, Tailwind + shadcn/ui.
- ikas Admin GraphQL via `@ikas/admin-api-client` with codegen.
- Session via `iron-session`.

## MCP Usage
- When generating new UI components, use the "shadcn" MCP to fetch component boilerplates and demos. Align with existing `src/components/ui/*` structure.
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

## Security and Privacy
- Use `onCheckToken` in `getIkas` to auto-refresh tokens. Do not expose tokens in responses or logs.

## Quality Gates
- Run `pnpm codegen` when `graphql-requests.ts` changes.
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