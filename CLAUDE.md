# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Chekin Inbox SDK** repository - a framework-agnostic monorepo for integrating Chekin's inbox platform into web applications through secure iframe embedding.

### Architecture

The project is a **Nx-based monorepo** with the following structure:

```
@chekinapp/inbox-sdk/
├── packages/
│   ├── core/                    # @chekinapp/inbox-sdk (vanilla JS/TS, framework-agnostic)
│   │   ├── src/
│   │   │   ├── ChekinInboxSDK.ts        # Main SDK class
│   │   │   ├── communication/          # postMessage handling
│   │   │   ├── utils/                  # Utilities (URL formatting, logging, validation)
│   │   │   └── types/                  # TypeScript definitions
│   │   └── sandbox.html               # Development sandbox
│   └── eslint-config/           # Shared ESLint configuration
├── docs/                        # API documentation
├── dist/                        # Build outputs
└── nx.json                     # Nx workspace configuration
```

### Key Implemented Features

- **ChekinInboxSDK**: Main vanilla JS/TS class with iframe management, validation, logging
- **Communication Layer**: postMessage-based parent-iframe communication with event handling
- **URL Management**: Smart URL formatting with length limits and postMessage fallback
- **Security**: Proper iframe sandboxing with CSP compliance
- **Logging & Validation**: Comprehensive error handling and configuration validation

## Development Commands

**Setup:**

- `yarn install` - Install dependencies
- `nx reset` - Reset Nx cache

**Build Commands:**

- `yarn build` - Build all packages (uses Nx)
- `yarn build:core` - Build core SDK only

**Development:**

- `yarn dev` - Start all development servers in parallel
- `nx dev core` - Start core package development

**Quality Assurance:**

- `yarn test` - Run all tests
- `yarn lint` - Lint all packages
- `yarn typecheck` - TypeScript type checking across all packages

**Single Package Testing:**

- `cd packages/core && yarn test` - Run core package tests
- `cd packages/core && yarn test:watch` - Run tests in watch mode
- `cd packages/core && yarn test:coverage` - Run tests with coverage

## Core SDK Architecture

### ChekinInboxSDK Class (`packages/core/src/ChekinInboxSDK.ts`)

Main SDK class providing:

- **Iframe Management**: Creation, sandboxing, lifecycle management
- **Configuration Validation**: Runtime validation with detailed error reporting
- **Event System**: postMessage-based communication with type-safe event handling
- **Route Synchronization**: URL sync between parent and iframe
- **Logging**: Comprehensive logging system with remote log shipping

### Communication Layer (`packages/core/src/communication/`)

- **ChekinCommunicator**: Handles postMessage protocol between parent and iframe
- **Event Types**: Defined in constants (HEIGHT_CHANGED, ERROR, CONFIG_UPDATE, etc.)
- **Security**: Origin validation and message sanitization

### URL Management (`packages/core/src/utils/formatChekinUrl.ts`)

- **Smart URL Building**: Handles query parameter limits (2048 chars)
- **PostMessage Fallback**: Large configs sent via postMessage after iframe load
- **Version Support**: Optional version pinning or latest deployment

## SDK Usage Patterns

```typescript
import {ChekinInboxSDK} from '@chekinapp/inbox-sdk';

const sdk = new ChekinInboxSDK({
  apiKey: 'your-api-key',
  autoHeight: true,
  onHeightChanged: height => console.log(`Height: ${height}px`),
});

await sdk.render('container-element');
```

## Testing & Development

### Sandbox Environment

- `packages/core/sandbox.html` - Development sandbox for testing core SDK
- Accessible via local development server for rapid testing

### Test Structure

- Tests use **Vitest** with jsdom environment
- Test files located in `packages/core/src/__tests__/`
- Setup file: `packages/core/src/__tests__/setup.ts`
- Coverage configured with v8 provider

### Build System

- **Nx**: Monorepo orchestration with caching and parallel builds
- **TSUP**: Fast TypeScript bundling for packages
- **ESLint**: Consistent code style across packages
- **Prettier**: Code formatting with lint-staged
- **Husky**: Pre-commit hooks for code quality

## Security Considerations

### Iframe Sandboxing

```html
<iframe
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
```

### CSP Requirements

```
frame-src https://sdk.chekin.com;
connect-src https://api.chekin.com;
```

### API Key Management

- Validate keys before iframe creation
- Never log actual API keys (use redacted placeholders)
- Support both test and production key formats

## Important Notes

### Package Names

- **Core Package**: `@chekinapp/inbox-sdk` (published to npm)

### Migration from Legacy SDK

- See `MIGRATION_GUIDE.md` for detailed migration instructions from `ChekinHousingsSDK`
- Key changes: Class name, method names (`renderApp` → `render`, `unmount` → `destroy`)
- CDN-based loading → NPM package installation

### Event System

Events use a prefixed naming convention (`chekin:*`) defined in `packages/core/src/constants/index.ts`:

- `chekin:handshake` - Initial connection
- `chekin:height-changed` - Iframe height updates
- `chekin:error` - SDK errors
- `chekin:connection-error` - Network errors
- `chekin:config-update` - Configuration updates
- `chekin:route-changed` - Route changes in iframe
- `chekin:ready` - SDK ready state
