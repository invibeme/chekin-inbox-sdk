# Chekin Inbox SDK

A modern, framework-agnostic SDK for integrating Chekin's inbox platform into your applications. Built with TypeScript and designed for security, performance, and developer experience.

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
yarn add @chekinapp/inbox-sdk
```

### Basic Usage

#### Vanilla JavaScript

```javascript
import {ChekinInboxSDK} from '@chekinapp/inbox-sdk';

const sdk = new ChekinInboxSDK({
  apiKey: 'your-api-key',
});

sdk.render('chekin-container').then(() => {
  console.log('SDK loaded successfully');
});
```

## Package Structure

This repository contains multiple packages:

- **[`@chekinapp/inbox-sdk`](./packages/core/README.md)** - Core framework-agnostic SDK

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │    │   NPM Package    │    │  Iframe App     │
│                 │    │                  │    │                 │
│  ┌───────────┐  │    │  ┌────────────┐  │    │  ┌───────────┐  │
│  │Integration│  │◄──►│  │ChekinInbox │  │◄──►│  │ Inbox UI  │  │
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
  onHeightChanged: height => {
    console.log('Height changed:', height);
  },
  onError: error => {
    console.error('SDK Error:', error.message);
  },
  onConnectionError: error => {
    console.error('Connection Error:', error);
  },
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
- yarn

### Setup

```bash
git clone https://github.com/chekin/chekin-inbox-sdk.git
cd chekin-inbox-sdk
yarn install
```

### Build

```bash
# Build all packages
yarn build

# Build specific package
yarn build:core
```

### Development

```bash
# Start all dev servers
yarn dev

# Start specific package
nx dev core
nx serve inbox-sdk
```

### Testing

```bash
yarn test
yarn lint
yarn typecheck
```

## Documentation

For detailed API documentation and examples:

- **[Core SDK Documentation](./packages/core/README.md)** - Complete guide to the framework-agnostic SDK
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
