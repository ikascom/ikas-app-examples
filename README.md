# ikas App Examples

A collection of example applications and starter templates for building ikas Admin apps. These examples demonstrate best practices, common patterns, and integrations for developing apps within the ikas ecosystem.

> [!CAUTION]
> **Security notice: update apps created from older versions of these templates.**
> Earlier versions pinned `next@15.3.0` with `react@^19.0.0` (19.1.0 in the lockfile). These versions are affected by
> [CVE-2025-55182 / CVE-2025-66478](https://nextjs.org/cve-2025-66478), an unauthenticated remote code execution in
> React Server Components (CVSS 10.0), plus [CVE-2025-55183 / CVE-2025-55184](https://nextjs.org/blog/security-update-2025-12-11).
> An app built from this template has been compromised through this vulnerability.
>
> If your app was created from this repository:
> 1. Upgrade `next`, `react` and `react-dom` to a patched release (these examples now use `next@16.4.1` and `react@19.3.1`) and redeploy.
> 2. Rotate your app's `CLIENT_SECRET` and `SECRET_COOKIE_PASSWORD`, and treat stored OAuth tokens as exposed if the app was publicly reachable.
> 3. Check your server for unexpected processes or outbound connections.

## 🚀 Available Examples

### [Starter App](./examples/starter-app/) - Next.js 16 Full-Stack Template

**Modern Next.js 16 App Router starter for building ikas Admin apps**

**Features:**
- ⚛️ **Next.js 16 + App Router** with React 19 and TypeScript
- 🔐 **OAuth for ikas** - Complete end-to-end authorization flow
- 📡 **Admin GraphQL client** - `@ikas/admin-api-client` with code generation
- 🗃️ **Prisma 7** - Local SQLite database for token storage
- 🎨 **Tailwind CSS v4 + ikas App UI** - The ikas panel's component kit, installed through the `@ikas` shadcn registry
- 🔒 **Iron Session** - Secure server-side session management
- 🌉 **Frontend ↔ Backend bridge** - Typed API helpers and authentication

**Perfect for:** Full-stack ikas apps requiring authentication, database storage, and modern UI components.

**[Get Started →](./examples/starter-app/README.md)**

---

### [Dashboard Actions App](./examples/dashboard-actions-app/) - App Actions Implementation

**Complete implementation of ikas App Actions with API and IFRAME methods**

**Features:**
- 🎯 **App Actions** - Both API (server-to-server) and IFRAME (embedded UI) implementations
- 📦 **Order Management** - Single and bulk order actions with comprehensive details
- 🔐 **Dual Authentication** - HMAC-SHA256 signature validation (API) and JWT (IFRAME)
- 🌍 **Internationalization** - Multi-language support (EN/TR) with centralized i18n
- 📊 **Rich UI Components** - Responsive card-based layouts for order visualization
- 🔄 **Parallel Processing** - Efficient bulk order fetching with graceful failure handling
- 📝 **Comprehensive Docs** - Complete guides, API references, and troubleshooting

**Perfect for:** Building contextual actions within ikas Admin (order details, product lists, etc.) with custom business logic.

**Key Implementations:**
- ✅ Order Detail Action (single order)
- ✅ Order List Action (multiple orders)
- ✅ Signature validation for API actions
- ✅ App Bridge integration for IFRAME actions
- ✅ Audit logging and error handling

**[Get Started →](./examples/dashboard-actions-app/README.md)** | **[App Actions Guide →](./examples/dashboard-actions-app/APP_ACTIONS_GUIDE.md)**

## 🛠️ Quick Start

### Prerequisites

- **Node.js** 20.9+ (LTS recommended)
- **pnpm** (preferred) or npm/yarn
- **ikas Developer Account** with app credentials

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ikascom/ikas-app-examples.git
   cd ikas-app-examples
   ```

2. **Choose an example**
   ```bash
   cd examples/starter-app  # or any other example
   ```

3. **Follow the example's README**
   
   Each example includes detailed setup instructions, configuration guides, and usage examples.

## 📖 What You'll Learn

These examples cover essential patterns for ikas app development:

- **Authentication & OAuth** - Secure user authorization flows
- **App Actions** - Contextual actions within ikas Admin (API and IFRAME methods)
- **GraphQL Integration** - Type-safe API interactions with code generation
- **Token Management** - Secure storage and refresh patterns
- **Session Handling** - Server-side session management
- **Signature Validation** - HMAC-SHA256 webhook security for API actions
- **App Bridge Integration** - Embedded iframe pages with secure token exchange
- **UI Components** - Panel-consistent interfaces with ikas App UI (Tailwind + shadcn registry)
- **Database Integration** - Local development with Prisma
- **Internationalization** - Multi-language support with centralized translation management
- **Security Best Practices** - Token security, session management, and API protection

## 🏗️ Architecture Overview

All examples follow these core principles:

- **Type Safety First** - TypeScript throughout with strict configuration
- **Security by Default** - Never expose tokens, secure session management
- **Developer Experience** - Hot reload, code generation, modern tooling
- **Production Ready** - Optimized builds, proper error handling
- **ikas Standards** - Consistent with ikas platform conventions

## 🔧 Common Setup Requirements

Most examples require these environment variables:

```bash
# ikas Configuration
NEXT_PUBLIC_GRAPH_API_URL=https://api.myikas.com/api/v2/admin/graphql
NEXT_PUBLIC_ADMIN_URL=https://{storeName}.myikas.com/admin
NEXT_PUBLIC_CLIENT_ID=your_ikas_app_client_id
CLIENT_SECRET=your_ikas_app_client_secret
NEXT_PUBLIC_DEPLOY_URL=https://yourapp.example.com

# Session Security
SECRET_COOKIE_PASSWORD=your_long_random_string_for_session_encryption
```

## 🧠 Development Workflow

### GraphQL Operations
1. Use ikas MCP tools to discover available operations
2. Add queries/mutations to `graphql-requests.ts`
3. Run code generation: `pnpm codegen`
4. Use typed client in your app

### UI Components
1. Screens use [ikas App UI](https://builders.ikas.com/docs/app-development/ui-kit/installation), registered as `@ikas` in `components.json`
2. Find components with the shadcn MCP or `https://builders.ikas.com/r/registry.json`, install with `npx shadcn@latest add @ikas/<name>`
3. Follow `ikas-ui.md` and the UI section of each example's `AGENTS.md`

### Authentication Flow
1. OAuth authorization → token exchange → session storage
2. JWT for frontend ↔ backend communication
3. Automatic token refresh with `onCheckToken`

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Commit Message Format
Use **Conventional Commits** format:

```
<type>(<scope>): <short summary>

Examples:
feat(starter): add user profile component
fix(auth): prevent token refresh loop
docs(readme): update installation guide
```

### Code Standards
- **TypeScript strict mode** - No `any` types
- **ESLint + Prettier** - Consistent formatting
- **Type safety** - Prefer generated types over manual definitions
- **Security first** - Never log tokens or secrets

### Adding New Examples
1. Create new directory under `examples/`
2. Include comprehensive README with setup instructions
3. Follow existing patterns for configuration and structure
4. Update this main README with new example details

## 📚 Additional Resources

- **[ikas Developer Documentation](https://builders.ikas.com)**
- **[ikas Admin GraphQL API](https://api.myikas.com/api/v2/admin/graphql)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Prisma Documentation](https://www.prisma.io/docs)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**
- **[shadcn/ui](https://ui.shadcn.com)**

## 📝 License

MIT

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/ikascom/ikas-app-examples/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/ikascom/ikas-app-examples/discussions)
- **Questions**: [ikas Developer Community](https://join.slack.com/t/ikasbuilders/shared_invite/zt-3a64uh6zo-taCr2wiZC5WlvKfdDt3SvQ)

---

**Happy coding!** 🚀 Build amazing ikas apps with these examples as your foundation.
