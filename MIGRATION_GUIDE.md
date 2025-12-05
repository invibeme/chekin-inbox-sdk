# Migration Guide: From ChekinHousingsSDK to ChekinHostSDK

This guide will help you migrate from the legacy ChekinHousingsSDK to the new ChekinHostSDK.

## Overview of Changes

The new **ChekinHostSDK** is a complete rewrite that offers:

- **Framework-agnostic core** with dedicated React components
- **Unified API** for both vanilla JS and React
- **Enhanced validation** and error handling
- **Built-in logging** with remote log shipping
- **Route synchronization** support
- **Better TypeScript** support throughout

## Installation

### Legacy (ChekinHousingsSDK)

```html
<!-- UMD -->
<script src="https://cdn.chekin.com/housings-sdk/v{VERSION}/index.umd.js"></script>

<!-- ESM -->
<script type="module">
  import ChekinHousingsSDK from 'https://cdn.chekin.com/housings-sdk/v{VERSION}/index.es.js';
</script>
```

### New (ChekinHostSDK)

```bash
# NPM/Yarn
npm install @chekinapp/inbox-sdk
# Or for React (in development - not yet available)
npm install @chekinapp/inbox-sdk-react
```

## API Changes

### Class Names

| Legacy              | New             |
| ------------------- | --------------- |
| `ChekinHousingsSDK` | `ChekinHostSDK` |

### Method Names

| Legacy Method  | New Method     | Notes                             |
| -------------- | -------------- | --------------------------------- |
| `initialize()` | `initialize()` | ✅ Same API                       |
| `renderApp()`  | `render()`     | Changed method name and signature |
| `unmount()`    | `destroy()`    | Changed method name               |

### Constructor & Initialization

#### Legacy Pattern

```javascript
const sdk = new ChekinHousingsSDK();
sdk.initialize({
  apiKey: 'your-api-key',
  housingId: 'housing-123',
  autoHeight: true,
  onHeightChanged: height => console.log(height),
});
sdk.renderApp({targetNode: 'root'});
```

#### New Pattern

```javascript
import {ChekinHostSDK} from '@chekinapp/inbox-sdk';

// Option 1: Constructor + render
const sdk = new ChekinHostSDK({
  apiKey: 'your-api-key',
  housingId: 'housing-123',
  autoHeight: true,
  onHeightChanged: height => console.log(height),
});
await sdk.render('root');

// Option 2: Constructor + initialize + render
const sdk = new ChekinHostSDK();
sdk.initialize({
  apiKey: 'your-api-key',
  housingId: 'housing-123',
  autoHeight: true,
  onHeightChanged: height => console.log(height),
});
await sdk.render('root');
```

### Render Method Changes

#### Legacy

```javascript
sdk.renderApp({targetNode: 'root'}); // String ID only
```

#### New

```javascript
// Both string ID and HTMLElement supported
await sdk.render('root');
await sdk.render(document.getElementById('root'));
```

### Configuration Options

Most configuration options remain the same, with these additions:

#### New Options in ChekinHostSDK

```typescript
interface ChekinHostSDKConfig {
  // ... all legacy options supported ...

  // New options:
  baseUrl?: string; // Custom base URL
  version?: string; // SDK version pinning
  features?: string[]; // Feature flags
  reservationId?: string; // Reservation targeting
  enableLogging?: boolean; // Enhanced logging
  routeSync?: boolean; // Route synchronization
  payServicesConfig?: {
    // Payment services
    currency?: string;
    liveness?: {price?: number};
  };
}
```

## React Migration

> **Note**: The React package (`@chekinapp/inbox-sdk-react`) is currently in development and not yet available. For now, continue using the vanilla JS SDK with React as shown in the legacy pattern below.

### Legacy Pattern (Vanilla JS in React)

```jsx
import {useEffect, useRef} from 'react';

function MyComponent() {
  const containerRef = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.chekin.com/housings-sdk/latest/index.umd.js';
    script.onload = () => {
      const sdk = new window.ChekinHousingsSDK();
      sdk.initialize({
        apiKey: 'your-api-key',
        housingId: 'housing-123',
      });
      sdk.renderApp({targetNode: containerRef.current.id});
    };
    document.body.appendChild(script);
  }, []);

  return <div ref={containerRef} id="chekin-container" />;
}
```

### New Pattern (React Components)

```jsx
import {ChekinHostSDKView} from '@chekinapp/inbox-sdk-react';

function MyComponent() {
  return (
    <ChekinHostSDKView
      apiKey="your-api-key"
      housingId="housing-123"
      onHeightChanged={height => console.log(height)}
      className="my-chekin-container"
    />
  );
}
```

### Advanced React Usage with Ref

```jsx
import {useRef} from 'react';
import {ChekinHostSDKView} from '@chekinapp/inbox-sdk-react';

function MyComponent() {
  const sdkRef = useRef();

  const handleNavigate = () => {
    sdkRef.current?.sdk?.navigate('/settings');
  };

  return (
    <>
      <button onClick={handleNavigate}>Go to Settings</button>
      <ChekinHostSDKView ref={sdkRef} apiKey="your-api-key" housingId="housing-123" />
    </>
  );
}
```

## Unmounting/Cleanup

### Legacy

```javascript
sdk.unmount(); // Remove from DOM
```

### New

```javascript
sdk.destroy(); // Complete cleanup + remove from DOM
```

## Error Handling

### Legacy

```javascript
const sdk = new ChekinHousingsSDK();
sdk.initialize({
  apiKey: 'your-api-key',
  onError: error => console.error('SDK Error:', error),
  onConnectionError: error => console.error('Connection Error:', error),
});
```

### New (Enhanced)

```javascript
const sdk = new ChekinHostSDK({
  apiKey: 'your-api-key',
  enableLogging: true, // New: Enhanced logging
  onError: error => console.error('SDK Error:', error),
  onConnectionError: error => console.error('Connection Error:', error),
});

// New: Validation before usage
try {
  const validationResult = ChekinHostSDK.validateConfig(config);
  if (!validationResult.isValid) {
    console.error('Config validation failed:', validationResult.errors);
  }
} catch (error) {
  console.error('Invalid configuration:', error);
}
```

## Breaking Changes Summary

1. **Class name**: `ChekinHousingsSDK` → `ChekinHostSDK`
2. **Method names**: `renderApp()` → `render()`, `unmount()` → `destroy()`
3. **Render method**: Now accepts element directly, returns Promise
4. **Import method**: CDN links → NPM packages
5. **Bundle loading**: Script tags → ES modules/NPM imports
6. **React integration**: Manual setup → Dedicated components

## Migration Checklist

- [ ] Update class name from `ChekinHousingsSDK` to `ChekinHostSDK`
- [ ] Change installation method from CDN to NPM
- [ ] Update method calls: `renderApp()` → `render()`, `unmount()` → `destroy()`
- [ ] Handle async `render()` method with `await` or `.then()`
- [ ] For React: Replace manual integration with `ChekinHostSDKView` component
- [ ] Update error handling for enhanced validation
- [ ] Consider enabling new features (logging, route sync)
- [ ] Test the migration thoroughly

## Need Help?

- **GitHub Issues**: Report bugs or ask questions
- **Support**: Contact the Chekin development team

The new ChekinHostSDK provides a much more robust, type-safe, and developer-friendly experience while maintaining backward compatibility for most configuration options.
