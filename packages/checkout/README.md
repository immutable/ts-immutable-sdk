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
└───widgets --> Checkout Widgets
│
└───widgets-sample-app --> Sample app where the Checkout Widgets are consumed
│
└───widgets-types --> Types package for using Widgets in TypeScript
│
└───README.md
```

# Running locally

## Dependencies

CheckoutSDK has been built with and tested using the following dependencies.

| Dependency | Version  |
| ---------- | -------- |
| Node       | v16.19.1 |
| Yarn       | v3.5.0   |

Node Module dependencies are still added to the package.json of each checkout module, however each module installs it's dependencies to a shared node_modules directory at the root level of the Unified SDK. This requires dependency versions to be aligned across all SDK submodules.

Once you've added a new dependency, or if it's your first time, go to the root level of the Unified SDK and run `yarn install`.

## Checkout SDK Development

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

Now when you make changes in the SDK the parcel watcher will trigger a rebuild of the SDK and since the sample app is also being watched and one of it's dependencies has changed, it will also recompile and the change will automatically be pulled through.

The best way to work on the SDK is to run the sample app and the sdk, then create buttons for the endpoint you're developing and use them to trigger SDK calls.

### Jest tests in the SDK

All jest tests within the SDK are run in the jsdom environment. To configure this so that it works in our CI pipeline, please add the following comment to the top of your test file.

```
/*
 * @jest-environment jsdom
 */
```

## Widgets Development

The Widgets rely on the Checkout SDK and the WidgetTypes which will both hot reload into the Widgets App in the same way as the Checkout SDK hot reloads into the SDK Sample App

In one terminal run;

```
cd sdk
yarn start
```

In another terminal run;

```
cd widgets-types
yarn start
```

In yet another terminal run;

```
cd widgets
yarn start
```

This will start up the Widgets App on `localhost:3001`. The landing page is a menu of the available widgets. This is the best place to work on your widget.

If you want to test the input and output (events) of your widget, you will need to package the widgets app and install it into the sample app.

In your terminal run;

```
cd widgets
yarn run build:dist

cd ../widgets-sample-app
yarn start
```

If you want to test the WebViews in the Widgets Sample App, you will also need to have the widgets app running because they load through the iframe from there.

In another terminal run;

```
cd widgets
yarn run start
```

The WebViews will hot reload on change since they are being pulled from the Widgets App, but you will need to run the `build:dist` command in the widgets folder to get the widgets to compile and copy over to test the Web Components & Static versions. You shouldn't need to restart the Widgets Sample App, it should reload automatically when it detects the updated Widgets package being copied over.

# Linting

Linting gets run across the project when you try to commit to your banch and it wont let you push unless the linting passes.

# Running tests

- Coming Soon &trade;

# Release process

## Staging

- Coming Soon &trade;

## Production

- Coming Soon &trade;
