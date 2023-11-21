<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Immutable Checkout SDK</h1>
</div>

# Overview

> **Warning** **IMMUTABLE CHECKOUT SDK IS UNSTABLE** <br/>
> Since it has not hit the version 1.0 yet, its public interface should not be considered final. Future releases may include breaking changes without further notice. We will do our best to keep this documentation updated providing visibility on breaking changes planned.

The Immutable Checkout SDK provides both programatical and user interfaces for interacting with various wallets and L2 networks. It provides all the tools to enable transaction ready gamers including on ramping, dex swaps, bridging and more.

## Documentation

- Coming Soon &trade;

# Project structure

```
/
│
└───sdk -> Checkout SDK
│
└───sdk-sample-app --> Sample app where the Checkout SDK is consumed
│
└───widgets-lib --> Checkout widgets
│
└───widgets-sample-app --> Sample app where the Checkout Widgets are consumed
│
└───README.md
```

# Running locally

## Dependencies

CheckoutSDK has been built with and tested using the following dependencies.

| Dependency | Version |
| ---------- | ------- |
| Node       | v16+    |
| Yarn       | v3.5.0  |

Node Module dependencies are still added to the package.json of each checkout module, however each module installs it's dependencies to a shared node_modules directory at the root level of the Unified SDK. This requires dependency versions to be aligned across all SDK submodules.

Once you've added a new dependency, or if it's your first time, go to the root level of the Unified SDK and run `yarn install`.

## Checkout SDK Development

Running Checkout SDK in different modes:

For local/development mode (uses immutable-devnet):

```
cd sdk
yarn start:dev
```

For sandbox/production mode (uses immutable-testnet/mainnet based on config object):

```
cd sdk
yarn start
```

To run the SDK Sample App with the Checkout SDK hot reloading, you need to run both the Checkout SDK and the Checkout Sample App at the same time.

In one terminal run;

```
cd sdk
yarn start
```

In another terminal run;

```
cd sdk-sample-app
yarn start
```

Note: SDK sample app does not require mode settings.

Now when you make changes in the SDK, Rollup will trigger a rebuild of the SDK and since the sample app is also being watched and one of it's dependencies has changed, it will also recompile and the change will automatically be pulled through.

The best way to work on the SDK is to run the sample app and the sdk, then create buttons for the endpoint you're developing and use them to trigger SDK calls.

### Jest tests in the SDK

All jest tests within the SDK are run in the jsdom environment. To configure this so that it works in our CI pipeline, please add the following comment to the top of your test file.

```
/*
 * @jest-environment jsdom
 */
```

## Widgets Development

The widgets-sample-app depends upon the widgets-lib, which in turn depends upon the sdk. To get started you will need to run `yarn start` in all three directories. This will enable hot reloading for all areas.

```
cd sdk
yarn start
```

```
cd widgets-lib
yarn start
```

```
cd widgets-sample-app
yarn start
```

When you develop locally, the widgets-sample-app installs and imports the widgets as an es module. `import { WidgetsFactory} from '@imtbl/checkout-widgets'` This helps local development with hot reloading. (it takes a lot longer to rebuild and minify a browser bundle).

In production however, the widgets-lib package is built as a browser bundle and is dynamically included in the DOM when you call `await checkout.widgets()`.

To test this setup locally and force the widgets bundle to be loaded from `localhost` you will need to run

```
cd sdk
yarn start:local
```

```
cd widgets-lib
yarn build:local
```

```
cd widgets-sample-app
yarn start
```

You will then need to make sure that you replace your creation of a `new WidgetsFactory()` with a call to `await checkout.widgets()` within the sample app. This will pull in the built widgets.js bundle dynamically, but from your local filesystem.

In a production release, this script is loaded from a CDN. We are currently using `https://cdn.jsdelivr.net/npm/@imtbl/sdk/dist/browser/checkout/widgets.js`

# Linting

Linting gets run across the project when you try to commit to your banch and it wont let you push unless the linting passes.

# Running tests

Running jest tests

```
yarn test
```

Running cypress tests

```
yarn test:cypress:open
```

Running cypress tests (headless)

```
yarn test:cypress
```

# Release process

## Staging

- Coming Soon &trade;

## Production

- Coming Soon &trade;
