# @chekinapp/inbox-sdk (Core Package)

The core framework-agnostic SDK package for integrating Chekin's host management platform into web applications through secure iframe embedding.

> **Migrating from ChekinHousingsSDK?** See the [Migration Guide](https://github.com/invibeme/chekin-inbox-sdk/blob/main/MIGRATION_GUIDE.md) for step-by-step instructions.

## Overview

This package provides the foundational `ChekinHostSDK` class that can be used in any JavaScript/TypeScript environment, regardless of framework. It handles iframe creation, secure communication via postMessage, configuration validation, and comprehensive logging.

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
import {ChekinHostSDK} from '@chekinapp/inbox-sdk';

const sdk = new ChekinHostSDK({
  apiKey: 'your-api-key',
  features: ['IV', 'LIVENESS_DETECTION'],
  autoHeight: true,
  onHeightChanged: height => console.log(`Height: ${height}px`),
});

// Render into a DOM element
await sdk.render('container-element-id');
// or
await sdk.render(document.getElementById('container'));
```

## Core Architecture

### ChekinHostSDK Class (`src/ChekinHostSDK.ts`)

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
new ChekinHostSDK(config: ChekinHostSDKConfig & { logger?: ChekinLoggerConfig })
```

### Methods

#### Complete Methods Reference

| Method           | Parameters                                     | Returns                      | Description                                                                                               |
| ---------------- | ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| **render**       | `container: string \| HTMLElement`             | `Promise<HTMLIFrameElement>` | Renders the SDK iframe into the specified container. Accepts element ID (string) or HTMLElement reference |
| **destroy**      | -                                              | `void`                       | Destroys the SDK instance, removes iframe from DOM, and cleans up event listeners                         |
| **updateConfig** | `newConfig: Partial<ChekinHostSDKConfig>`      | `void`                       | Updates SDK configuration and sends changes to iframe. Validates new config before applying               |
| **on**           | `event: string, callback: ChekinEventCallback` | `void`                       | Adds event listener for SDK events. Supports all SDK event types with type-safe callbacks                 |
| **off**          | `event: string, callback: ChekinEventCallback` | `void`                       | Removes specific event listener. Must pass same callback reference used in `on()`                         |

#### Method Categories

**Core Methods**

- `render(container: string | HTMLElement): Promise<HTMLIFrameElement>`
- `destroy(): void`
- `updateConfig(newConfig: Partial<ChekinHostSDKConfig>): void`

**Event Management**

- `on(event: string, callback: ChekinEventCallback): void`
- `off(event: string, callback: ChekinEventCallback): void`

### Configuration

#### Complete Parameters Table

| Parameter                                | Type                                                                               | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **apiKey**                               | `string`                                                                           | ✅       | -       | API key created in the Chekin dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **features**                             | `string[]`                                                                         | ❌       | `[]`    | Enable specific SDK features: `['reservations', 'guests', 'documents', 'payments', 'messaging']`                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **housingId**                            | `string`                                                                           | ❌       | -       | ID of the particular housing/property to pre-select. If this param or externalHousingId is passed then the properties list will be unavailable. You will get directly to the property setting view. Make sure that you have generated a correct apiKey for your usage                                                                                                                                                                                                                                                        |
| **externalHousingId**                    | `string`                                                                           | ❌       | -       | External housing ID for PMS integrations and third-party systems. Note, if you pass externalHousingId and housingId then the housingId will have more priority and externalHousingId will be ignored. Make sure that you have generated a correct apiKey for your usage                                                                                                                                                                                                                                                      |
| **reservationId**                        | `string`                                                                           | ❌       | -       | ID of specific reservation to pre-load in the SDK                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **defaultLanguage**                      | `string`                                                                           | ❌       | `'en'`  | Default interface language. Supported: `'en', 'es', 'it', 'pt', 'de', 'fr'`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **styles**                               | `string`                                                                           | ❌       | -       | CSS styles injected into the SDK iframe for custom theming                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **stylesLink**                           | `string`                                                                           | ❌       | -       | URL to external CSS stylesheet for advanced customization                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **autoHeight**                           | `boolean`                                                                          | ❌       | `true`  | Automatically adjust iframe height based on content                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **enableLogging**                        | `boolean`                                                                          | ❌       | `false` | Enable SDK internal logging (logs are disabled by default)                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **routeSync**                            | `boolean`                                                                          | ❌       | `true`  | Enable route synchronization between parent and iframe URL states                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **hiddenSections**                       | `'housing_police', 'housing_stat', 'housing_documents', 'identity_verification'[]` | ❌       | `[]`    | Hide entire sections by name (e.g., `['housing_police', 'housing_stat', 'housing_documents', 'identity_verification']`)                                                                                                                                                                                                                                                                                                                                                                                                      |
| **hiddenFormFields**                     | `object`                                                                           | ❌       | `{}`    | Hide specific form fields by section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **hiddenFormFields.housingInfo**         | `string[]`                                                                         | ❌       | `[]`    | Hide housing information form fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **hiddenFormFields.housingPolice**       | `string[]`                                                                         | ❌       | `[]`    | Hide police registration form fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **hiddenFormFields.housingStat**         | `string[]`                                                                         | ❌       | `[]`    | Hide statistics form fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **hiddenFormFields.guestbookGeneration** | `string[]`                                                                         | ❌       | `[]`    | Hide guestbook generation form fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **payServicesConfig**                    | `object`                                                                           | ❌       | `{}`    | Payment services configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **payServicesConfig.currency**           | `string`                                                                           | ❌       | -       | Currency code for payment services (e.g., 'EUR', 'USD')                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **payServicesConfig.liveness**           | `object`                                                                           | ❌       | `{}`    | Liveness detection configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **payServicesConfig.liveness.price**     | `number`                                                                           | ❌       | -       | Price for liveness detection service                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **onHeightChanged**                      | `function`                                                                         | ❌       | -       | Callback when iframe height changes. Receives `(height: number)`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **onError**                              | `function`                                                                         | ❌       | -       | Error callback. Receives `(error: { message: string; code?: string })`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **onConnectionError**                    | `function`                                                                         | ❌       | -       | Connection/network error callback. Receives `(error: any)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **onPoliceAccountConnection**            | `function`                                                                         | ❌       | -       | This callback will be called with the following arguments: 1. state, possible values: - CONNECTED - If the police feature is activated/connected. Also it will be called if police type is changed. It’s like reconnection to a new police account. - DISCONNECTED - if the police feature is deactivated/disconnected. - CONNECTION_ERROR - if there is an error with the connection. - DISCONNECTION_ERROR - if there is an error with the disconnection. - CONNECTION_VALIDATION_FAILED - if there is a validation error. |
| **onStatAccountConnection**              | `function`                                                                         | ❌       | -       | This callback will be called with the following arguments: 1. state, possible values: - CONNECTED - If the stat feature is activated/connected. Also it will be called if stat type is changed. It’s like reconnection to a new stat account. - DISCONNECTED - if the stat feature is deactivated/disconnected. - CONNECTION_ERROR - if there is an error with the connection. - DISCONNECTION_ERROR - if there is an error with the disconnection. - CONNECTION_VALIDATION_FAILED - if there is a validation error.         |

#### Configuration Interface

```typescript
interface ChekinHostSDKConfig {
  // Required
  apiKey: string;

  // Optional Core Settings
  baseUrl?: string;
  version?: string;
  features?: string[];

  // Context
  housingId?: string;
  externalHousingId?: string;
  reservationId?: string;
  defaultLanguage?: string;

  // UI Customization
  styles?: string;
  stylesLink?: string;
  autoHeight?: boolean;
  hiddenSections?: string[];
  hiddenFormFields?: {
    housingInfo?: string[];
    housingPolice?: string[];
    housingStat?: string[];
    guestbookGeneration?: string[];
  };

  // Advanced
  enableLogging?: boolean;
  routeSync?: boolean;
  payServicesConfig?: {
    currency?: string;
    liveness?: {price?: number};
  };

  // Event Callbacks
  onHeightChanged?: (height: number) => void;
  onError?: (error: {message: string; code?: string}) => void;
  onConnectionError?: (error: any) => void;
  onPoliceAccountConnection?: (data: any) => void;
  onStatAccountConnection?: (data: any) => void;
}
```

#### Configuration Examples

**Basic Configuration:**

```javascript
{
  apiKey: 'pk_live_your_api_key',
  features: ['IV', 'LIVENESS_DETECTION'],
  housingId: 'housing-123',
  defaultLanguage: 'en'
}
```

**Advanced Configuration:**

```javascript
{
  apiKey: 'pk_live_your_api_key',
  version: '1.6.2',
  features: ['IV', 'LIVENESS_DETECTION'],
  housingId: 'housing-123',
  externalHousingId: 'pms-property-456',
  defaultLanguage: 'es',
  styles: `
    .primary-button { background: #007cba; }
    .container { max-width: 800px; }
  `,
  autoHeight: true,
  hiddenSections: ['housing_police'],
  hiddenFormFields: {
    housingInfo: ['optional-field-1'],
    housingPolice: ['non-required-field']
  },
  payServicesConfig: {
    currency: 'EUR',
    liveness: { price: 5.00 }
  },
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
  features: ['IV', 'LIVENESS_DETECTION'],
  styles: 'body { background: #f5f5f5; }',
});
```

## Framework Integration Examples

### Vanilla JavaScript

```html
<div id="chekin-container"></div>
<script>
  const sdk = new ChekinHostSDK({apiKey: 'your-key'});
  sdk.render('chekin-container');
</script>
```

### Vue.js

```vue
<template>
  <div ref="container" class="chekin-container"></div>
</template>

<script>
import {ChekinHostSDK} from '@chekinapp/inbox-sdk';

export default {
  mounted() {
    this.sdk = new ChekinHostSDK({apiKey: 'your-key'});
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
import {ChekinHostSDK} from '@chekinapp/inbox-sdk';

@Component({
  template: '<div #container class="chekin-container"></div>',
})
export class ChekinComponent implements OnInit, OnDestroy {
  @ViewChild('container', {static: true}) container!: ElementRef;
  private sdk!: ChekinHostSDK;

  ngOnInit() {
    this.sdk = new ChekinHostSDK({apiKey: 'your-key'});
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
