# @chekinapp/inbox-sdk (Core Package)

The core framework-agnostic SDK package for integrating Chekin's inbox platform into web applications through secure iframe embedding.

## Overview

This package provides the foundational `ChekinInboxSDK` class that can be used in any JavaScript/TypeScript environment, regardless of framework. It handles iframe creation, secure communication via postMessage, configuration validation, and comprehensive logging.

## Key Features

- **Framework Agnostic** - Works with vanilla JS, React, Vue, Angular, Svelte, or any web framework
- **Secure Iframe Embedding** - Proper sandboxing and CSP compliance
- **Smart URL Management** - Handles query parameter limits with postMessage fallback
- **Type-Safe Configuration** - Full TypeScript support with runtime validation
- **Event System** - Comprehensive event handling for iframe communication
- **Logging & Debugging** - Built-in logger with remote log shipping capabilities
- **Route Synchronization** - Optional URL sync between parent and iframe

## Installation

```bash
yarn add @chekinapp/inbox-sdk
```

## Quick Start

```javascript
import {ChekinInboxSDK} from '@chekinapp/inbox-sdk';

const sdk = new ChekinInboxSDK({
  apiKey: 'your-api-key',
  autoHeight: true,
  onHeightChanged: height => console.log(`Height: ${height}px`),
});

// Render into a DOM element
await sdk.render('container-element-id');
// or
await sdk.render(document.getElementById('container'));
```

## Core Architecture

### ChekinInboxSDK Class (`src/ChekinInboxSDK.ts`)

Main SDK class providing:

- Iframe lifecycle management (creation, loading, destruction)
- Configuration validation and error handling
- Event system with type-safe callbacks
- Route synchronization capabilities
- Logger integration

### Communication Layer (`src/communication/`)

- **ChekinCommunicator** - Handles bidirectional postMessage communication
- Message validation and origin checking
- Event dispatching and listener management

### Utilities (`src/utils/`)

- **formatChekinUrl.ts** - Smart URL building with parameter limit handling
- **validation.ts** - Configuration validation with detailed error reporting
- **ChekinLogger.ts** - Comprehensive logging system with levels and remote shipping
- **packageInfo.ts** - Package metadata utilities

### Types (`src/types/`)

- Complete TypeScript definitions for all SDK interfaces
- Event type definitions and callback signatures
- Configuration interfaces with JSDoc documentation

## API Reference

### Constructor

```typescript
new ChekinInboxSDK(config: ChekinInboxSDKConfig & { logger?: ChekinLoggerConfig })
```

### Methods

#### Complete Methods Reference

| Method           | Parameters                                     | Returns                      | Description                                                                                               |
| ---------------- | ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| **render**       | `container: string \| HTMLElement`             | `Promise<HTMLIFrameElement>` | Renders the SDK iframe into the specified container. Accepts element ID (string) or HTMLElement reference |
| **destroy**      | -                                              | `void`                       | Destroys the SDK instance, removes iframe from DOM, and cleans up event listeners                         |
| **updateConfig** | `newConfig: Partial<ChekinInboxSDKConfig>`     | `void`                       | Updates SDK configuration and sends changes to iframe. Validates new config before applying               |
| **on**           | `event: string, callback: ChekinEventCallback` | `void`                       | Adds event listener for SDK events. Supports all SDK event types with type-safe callbacks                 |
| **off**          | `event: string, callback: ChekinEventCallback` | `void`                       | Removes specific event listener. Must pass same callback reference used in `on()`                         |

#### Method Categories

**Core Methods**

- `render(container: string | HTMLElement): Promise<HTMLIFrameElement>`
- `destroy(): void`
- `updateConfig(newConfig: Partial<ChekinInboxSDKConfig>): void`

**Event Management**

- `on(event: string, callback: ChekinEventCallback): void`
- `off(event: string, callback: ChekinEventCallback): void`

### Configuration

#### Complete Parameters Table

| Parameter             | Type       | Required | Default | Description                                                                 |
| --------------------- | ---------- | -------- | ------- | --------------------------------------------------------------------------- |
| **apiKey**            | `string`   | ✅       | -       | API key created in the Chekin dashboard.                                    |
| **defaultLanguage**   | `string`   | ❌       | `'en'`  | Default interface language. Supported: `'en', 'es', 'it', 'pt', 'de', 'fr'` |
| **styles**            | `string`   | ❌       | -       | CSS styles injected into the SDK iframe for custom theming                  |
| **stylesLink**        | `string`   | ❌       | -       | URL to external CSS stylesheet for advanced customization                   |
| **autoHeight**        | `boolean`  | ❌       | `true`  | Automatically adjust iframe height based on content                         |
| **enableLogging**     | `boolean`  | ❌       | `false` | Enable SDK internal logging (logs are disabled by default)                  |
| **routeSync**         | `boolean`  | ❌       | `true`  | Enable route synchronization between parent and iframe URL states           |
| **onHeightChanged**   | `function` | ❌       | -       | Callback when iframe height changes. Receives `(height: number)`            |
| **onError**           | `function` | ❌       | -       | Error callback. Receives `(error: { message: string; code?: string })`      |
| **onConnectionError** | `function` | ❌       | -       | Connection/network error callback. Receives `(error: any)`                  |

#### Configuration Interface

```typescript
interface ChekinInboxSDKConfig {
  // Required
  apiKey: string;

  // Optional Core Settings
  baseUrl?: string;
  version?: string;

  // Context
  defaultLanguage?: string;

  // UI Customization
  styles?: string;
  stylesLink?: string;
  autoHeight?: boolean;

  // Advanced
  enableLogging?: boolean;
  routeSync?: boolean;

  // Event Callbacks
  onHeightChanged?: (height: number) => void;
  onError?: (error: {message: string; code?: string}) => void;
  onConnectionError?: (error: any) => void;
}
```

#### Configuration Examples

**Basic Configuration:**

```javascript
{
  apiKey: 'pk_live_your_api_key',
  defaultLanguage: 'en'
}
```

**Advanced Configuration:**

```javascript
{
  apiKey: 'pk_live_your_api_key',
  version: '1.6.2',
  defaultLanguage: 'es',
  styles: `
    .primary-button { background: #007cba; }
    .container { max-width: 800px; }
  `,
  autoHeight: true,
  onHeightChanged: (height) => console.log(`Height: ${height}px`),
  onError: (error) => console.error('SDK Error:', error)
}
```

### Events

The SDK emits the following events:

- `height-changed` - Iframe content height changes
- `error` - Error occurs in SDK or iframe
- `connection-error` - Network or communication error
- `police-account-connection` - Police account status change
- `stat-account-connection` - Statistics account status change

## Advanced Usage

### Custom Event Handling

```javascript
sdk.on('height-changed', height => {
  document.getElementById('container').style.height = `${height}px`;
});

sdk.on('error', error => {
  console.error('SDK Error:', error.message);
  // Handle error appropriately
});
```

### Configuration Updates

```javascript
// Update configuration after initialization
sdk.updateConfig({
  styles: 'body { background: #f5f5f5; }',
});
```

## Framework Integration Examples

### Vanilla JavaScript

```html
<div id="chekin-container"></div>
<script>
  const sdk = new ChekinInboxSDK({apiKey: 'your-key'});
  sdk.render('chekin-container');
</script>
```

### Vue.js

```vue
<template>
  <div ref="container" class="chekin-container"></div>
</template>

<script>
import {ChekinInboxSDK} from '@chekinapp/inbox-sdk';

export default {
  mounted() {
    this.sdk = new ChekinInboxSDK({apiKey: 'your-key'});
    this.sdk.render(this.$refs.container);
  },
  beforeUnmount() {
    this.sdk?.destroy();
  },
};
</script>
```

### Angular

```typescript
import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {ChekinInboxSDK} from '@chekinapp/inbox-sdk';

@Component({
  template: '<div #container class="chekin-container"></div>',
})
export class ChekinComponent implements OnInit, OnDestroy {
  @ViewChild('container', {static: true}) container!: ElementRef;
  private sdk!: ChekinInboxSDK;

  ngOnInit() {
    this.sdk = new ChekinInboxSDK({apiKey: 'your-key'});
    this.sdk.render(this.container.nativeElement);
  }

  ngOnDestroy() {
    this.sdk?.destroy();
  }
}
```

## Development

### Building

```bash
# Build the package
yarn build

# Development mode with watching
yarn dev
```

### Testing

The core package includes comprehensive tests for all functionality. Use the sandbox.html file for manual testing during development.

## Security

- All iframe communication uses secure postMessage protocol
- Origin validation ensures communication only with trusted domains
- API keys are validated but never logged in plain text
- CSP-compliant iframe sandboxing prevents malicious code execution

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- No Internet Explorer support
