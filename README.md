# Chekin Host SDK

A modern, framework-agnostic SDK for integrating Chekin's host management platform into your applications. Built with TypeScript and designed for security, performance, and developer experience.

> **Migrating from ChekinHousingsSDK?** See the [Migration Guide](./MIGRATION_GUIDE.md) for step-by-step instructions.

## Features

- 🚀 **Framework Agnostic** - Works with vanilla JavaScript, React, Vue, Angular, and more
- 🔒 **Secure by Default** - Proper iframe sandboxing and CSP compliance
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🎨 **Customizable** - Flexible styling and configuration options
- 🌍 **CDN Distributed** - Fast global delivery with version management
- 📦 **Tree Shakeable** - Import only what you need
- 🔧 **TypeScript First** - Full type safety and IntelliSense support

## Quick Start

### Installation

```bash
# For vanilla JavaScript/TypeScript
npm install @chekinapp/inbox-sdk

# For React applications (In development and not available on npm yet)
# npm install @chekinapp/host-sdk-react
```

### Basic Usage

#### Vanilla JavaScript

```javascript
import {ChekinHostSDK} from '@chekinapp/inbox-sdk';

const sdk = new ChekinHostSDK({
  apiKey: 'your-api-key',
  housingId: 'reservation-123',
});

sdk.render('chekin-container').then(() => {
  console.log('SDK loaded successfully');
});
```

#### React

> **Note**: React components are currently in development and not yet available on npm.

```jsx
import {ChekinHostSDKView} from '@chekinapp/host-sdk-react';

function MyComponent() {
  return (
    <ChekinHostSDKView
      apiKey="your-api-key"
      features={['IV', 'LIVENESS_DETECTION']}
      onHeightChanged={height => console.log(height)}
    />
  );
}
```

#### React with Event Handling

```jsx
import {useHostSDKEventListener, ChekinHostSDKView} from '@chekinapp/host-sdk-react';

function MyComponent() {
  useHostSDKEventListener({
    onHeightChanged: height => console.log('Height:', height),
    onError: error => console.error('SDK Error:', error),
  });

  return <ChekinHostSDKView apiKey="your-api-key" features={['IV']} />;
}
```

## Package Structure

This repository contains multiple packages:

- **[`@chekinapp/inbox-sdk`](./packages/core/README.md)** - Core framework-agnostic SDK
- **[`@chekinapp/host-sdk-react`](./packages/react/README.md)** - React components and hooks (IN DEVELOPMENT)
- **`apps/inbox-sdk`** - Iframe application (deployed to CDN)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │    │   NPM Package    │    │  Iframe App     │
│                 │    │                  │    │                 │
│  ┌───────────┐  │    │  ┌────────────┐  │    │  ┌───────────┐  │
│  │Integration│  │◄──►│  │ChekinHost  │  │◄──►│  │ Host UI   │  │
│  │Component  │  │    │  │    SDK     │  │    │  │ (React)   │  │
│  └───────────┘  │    │  └────────────┘  │    │  └───────────┘  │
│                 │    │        │         │    │                 │
└─────────────────┘    │  ┌────────────┐  │    └─────────────────┘
                       │  │postMessage │  │            ▲
                       │  │Communication│  │            │
                       │  └────────────┘  │            │
                       └──────────────────┘            │
                                                       │
                          CDN: https://cdn.chekin.com/
```

## Configuration

For a complete list of all configuration parameters with detailed descriptions, see the [Complete Parameters Table](./packages/core/README.md#complete-parameters-table) in the core SDK documentation.

### Basic Configuration

```javascript
{
  apiKey: 'your-api-key',          // Required: Your Chekin API key
  features: ['IV'],                // Optional: Enabled features
  mode: 'ALL',                // Optional: Enabled features
  housingId: 'housing-123',        // Optional: Pre-select housing
  defaultLanguage: 'en'            // Optional: Default language
}
```

### Advanced Configuration

```javascript
{
  version: '1.6.2',                // Pin to specific version of the SDK (default: latest)
  baseUrl: 'https://custom.com/',  // Custom hosting URL of the iframe app
  styles: 'body { font-family: Arial, sans-serif; } .primary-color { color: #007cba; }',  // Custom CSS styles as string
  stylesLink: 'https://yoursite.com/custom.css',  // External stylesheet
  autoHeight: true,                // Auto-adjust iframe height
  enableLogging: false,            // Disable SDK logging (default). It is needed for debugging.
  hiddenSections: ['housing_police'],    // Hide specific sections
  hiddenFormFields: {              // Hide specific form fields
    housingInfo: ['field1', 'field2']
  },
  onHeightChanged: height => {
    console.log('Height changed:', height);
  },
  onError: error => {
    console.error('SDK Error:', error.message);
  },
  onConnectionError: error => {
    console.error('Connection Error:', error);
  },
  onPoliceAccountConnection: data => {
    console.log('Police account connected:', data);
  },
  onStatAccountConnection: data => {
    console.log('Stat account connected:', data);
  }
}
```

## Event Handling

Listen to SDK events for better integration (If you don't want to pass callbacks in config):

```javascript
sdk.on('height-changed', height => {
  console.log(`SDK height: ${height}px`);
});

sdk.on('error', error => {
  console.error('SDK Error:', error.message);
});

sdk.on('ready', () => {
  console.log('SDK is ready');
});
```

## React Components

> **Note**: React components and hooks are currently in development and not yet available on npm. Use the vanilla JS SDK for now.

### ChekinHostSDKView

The main React component that embeds the SDK directly in your application:

```jsx
import { useRef } from 'react';
import { ChekinHostSDKView } from '@chekinapp/host-sdk-react';
import type { ChekinHostSDKViewHandle } from '@chekinapp/host-sdk-react';

function MyComponent() {
  const sdkRef = useRef<ChekinHostSDKViewHandle>(null);

  return (
    <ChekinHostSDKView
      ref={sdkRef}
      apiKey="your-api-key"
      features={['IV', 'LIVENESS_DETECTION']}
      autoHeight={true}
      onHeightChanged={(height) => console.log(height)}
      onError={(error) => console.error(error)}
      className="my-sdk-container"
      style={{ minHeight: '400px' }}
    />
  );
}
```

## React Hooks

### useHostSDKEventListener

Listen to SDK events with automatic cleanup:

```jsx
import {useHostSDKEventListener} from '@chekinapp/host-sdk-react';

function MyComponent() {
  useHostSDKEventListener({
    onHeightChanged: height => {
      console.log('Height changed:', height);
    },
    onError: error => {
      console.error('SDK Error:', error.message);
    },
    onConnectionError: error => {
      console.error('Connection Error:', error);
    },
    onPoliceAccountConnection: data => {
      console.log('Police account connected:', data);
    },
    onStatAccountConnection: data => {
      console.log('Stat account connected:', data);
    },
  });

  return <ChekinHostSDKView apiKey="your-api-key" />;
}
```

## Security

### Content Security Policy

Add to your CSP headers:

```
frame-src https://sdk.chekin.com;
connect-src https://api.chekin.com;
```

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
git clone https://github.com/chekin/chekin-inbox-sdk.git
cd chekin-inbox-sdk
npm install
```

### Build

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:react
npm run build:inbox-sdk
```

### Development

```bash
# Start all dev servers
npm run dev

# Start specific package
nx dev core
nx dev react
nx serve inbox-sdk
```

### Testing

```bash
npm run test
npm run lint
npm run typecheck
```

## Documentation

For detailed API documentation and examples:

- **[Migration Guide](./MIGRATION_GUIDE.md)** - Step-by-step migration from ChekinHousingsSDK
- **[Core SDK Documentation](./packages/core/README.md)** - Complete guide to the framework-agnostic SDK
- **[React Documentation](./packages/react/README.md)** - React components, hooks, and examples
- **[Project Architecture](./CLAUDE.md)** - Developer guide and architecture overview

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- 📧 Email: support@chekin.com
- 🐛 Issues: https://github.com/invibeme/chekin-inbox-sdk/issues
