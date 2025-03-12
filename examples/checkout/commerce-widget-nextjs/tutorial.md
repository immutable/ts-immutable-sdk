# Commerce Widget with Next.js Tutorial

## Introduction

This example app demonstrates how to implement the Immutable Checkout SDK's Commerce Widget in a Next.js application. The Commerce Widget provides a pre-built UI component that enables users to connect wallets and interact with blockchain features in your application. This example focuses on mounting the widget, configuring it for wallet connection, and handling widget events.

The example is built using Next.js and Immutable's SDK to provide a clean, developer-friendly implementation of the Commerce Widget flow.

[GitHub Repository](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/commerce-widget-nextjs)

## Features Overview

- **Commerce Widget Integration**: Demonstrates how to mount and use the Commerce Widget from the Checkout SDK
- **Event Handling**: Shows how to listen for and respond to widget events (SUCCESS, FAILURE, CLOSE)
- **Wallet Connection Flow**: Implements the wallet connection flow using the Commerce Widget
- **UI Integration**: Integrates the widget into a responsive Next.js application with Biom3 design components

## SDK Integration Details

### Widget Initialization and Mounting

**Link**: [widgets/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/commerce-widget-nextjs/src/app/widgets/page.tsx)

**Feature Name**: Widget Initialization

**Implementation**:
```typescript
const checkoutSDK = new checkout.Checkout();

function Widgets() {
  const [widget, setWidget] = useState<Widget<WidgetType.IMMUTABLE_COMMERCE>>();

  useEffect(() => {
    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ config: {} });
      const widget = widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {})
      setWidget(widget);
    }

    loadWidgets();
  }, []);

  useEffect(() => {
    if (!widget) return;
    widget.mount("widget-root", {
      flow: CommerceFlowType.WALLET,
    });
    
    // Event listeners...
  }, [widget]);
}
```

**Explanation**: 
The code initializes the Checkout SDK and creates a Commerce Widget. Within a React useEffect hook, the widget is created using the `widgetsFactory.create()` method with the `WidgetType.IMMUTABLE_COMMERCE` type. Once the widget is created and stored in state, a second useEffect hook mounts the widget to a DOM element with the ID "widget-root" and configures it to use the WALLET flow type.

### Event Handling

**Link**: [widgets/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/commerce-widget-nextjs/src/app/widgets/page.tsx)

**Feature Name**: Widget Event Listeners

**Implementation**:
```typescript
// Success event handling
widget.addListener(
  checkout.CommerceEventType.SUCCESS,
  (payload: checkout.CommerceSuccessEvent) => {
    const { type, data } = payload;

    // capture provider after user connects their wallet
    if (type === checkout.CommerceSuccessEventType.CONNECT_SUCCESS) {
      const { walletProviderName } = data as ConnectionSuccess;
      console.log('connected to ', walletProviderName);
      // setProvider(data.provider);

      // optional, immediately close the widget
      // widget.unmount();
    }
  }
);

// Failure event handling
widget.addListener(
  checkout.CommerceEventType.FAILURE,
  (payload: checkout.CommerceFailureEvent) => {
    const { type, data } = payload;

    if (type === checkout.CommerceFailureEventType.CONNECT_FAILED) {
      console.log('failed to connect', data.reason);
    }
  }
);

// Close event handling
widget.addListener(checkout.CommerceEventType.CLOSE, () => {
  widget.unmount();
});

// Clean up event listeners
return () => {
  widget.removeListener(checkout.CommerceEventType.SUCCESS);
  widget.removeListener(checkout.CommerceEventType.DISCONNECTED);
  widget.removeListener(checkout.CommerceEventType.CLOSE);
};
```

**Explanation**:
The code adds event listeners to the Commerce Widget to handle different scenarios:
1. SUCCESS events: Captures successful connections, logging the wallet provider name and allowing for optional widget unmounting
2. FAILURE events: Handles connection failures and logs the reason
3. CLOSE events: Automatically unmounts the widget when closed

The code also includes proper cleanup of event listeners when the component unmounts.

### Custom Configuration Setup

**Link**: [utils/setupCustom.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/checkout/commerce-widget-nextjs/src/app/utils/setupCustom.ts)

**Feature Name**: Custom SDK Configuration

**Implementation**:
```typescript
import { checkout, config } from '@imtbl/sdk';

// Replace with your Publishable Key from the Immutable Hub
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '' 

// Set the environment to SANDBOX for testnet or PRODUCTION for mainnet
const baseConfig = {
  environment: config.Environment.SANDBOX,
  publishableKey: PUBLISHABLE_KEY,
};

// Instantiate the Checkout SDKs with the default configurations
export const checkoutSDK = new checkout.Checkout({
  baseConfig,
  bridge: { enable: true },
  onRamp: { enable: true },
  swap: { enable: true },
  // passport: <optionally add Passport instance>
});
```

**Explanation**:
This utility demonstrates how to create a custom configuration for the Checkout SDK. It sets up a base configuration with the environment (SANDBOX for testnet) and a publishable key from environment variables. It then initializes the Checkout SDK with additional features enabled, including bridge, onRamp, and swap functionalities.

## Running the App

[GitHub Repository](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/checkout/commerce-widget-nextjs)

### Prerequisites

* Node.js 18 or higher
* pnpm package manager
* An [Immutable Hub](https://hub.immutable.com/) account for generating your publishable API key

### Setup Instructions

1. Clone the repository and navigate to the example directory:
   ```
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/checkout/commerce-widget-nextjs
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create an environment variables file:
   ```
   cp .env.example .env
   ```

4. Add your Publishable API Key from Immutable Hub to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
   ```

5. Start the development server:
   ```
   pnpm dev
   ```

6. Open your browser and navigate to http://localhost:3000

### Testing

The app includes E2E tests for the Commerce Widget:

1. Build the app:
   ```
   pnpm build
   ```

2. Run tests using remote widgets:
   ```
   pnpm test:remotewidgets
   ```

## Summary

This example app demonstrates how to integrate the Immutable Checkout SDK's Commerce Widget into a Next.js application, focusing on:

- Initializing and mounting the Commerce Widget
- Configuring the widget for wallet connections
- Handling widget events (success, failure, close)
- Setting up custom SDK configurations

By following this example, developers can easily add wallet connection capabilities to their applications using Immutable's pre-built Commerce Widget, which provides a seamless user experience while reducing development effort. 