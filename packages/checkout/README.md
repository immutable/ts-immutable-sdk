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
└───packages -> packages handled by [Lerna](https://github.com/lerna/lerna)
│   │
│   └───imx-wallet --> source code of the StarkEx Wallet implementation (Coming Soon TM).
│   │
│   └───sample-app --> sample app where the Checkout SDK is consumed.
│   │
│   └───sdk --> source code of the Checkout SDK.
│       │
│       └───core --> source code of the Checkout SDK.
│       │
│       └───ui --> source code of the Checkout UI widgets.
│
└───package.json
│
└───README.md
```

# Running locally

## Dependencies

CheckoutSDK has been built with and tested using the following dependencies. 

| Dependency | Version |
|------------|---------|
| Node       | v19.6.1 |
| NPM        | v9.4.0  |


## SDK Development

To run the sample app with the SDK hot reloading, just run the following commands;

```
npm i
npm run bootstrap
npm start
```

The SDK will hot reload into the sample app when its run from the top level package with `npm start` which will run the sample app on `localhost:3000`. Since this hot reload works great, the easiest thing to do is to create a new component in the sample app for the sdk function you're wokring for example `components/sdk/connect`.

Then add that component to the SDK renderer in `SDK.tsx` e.g. `<ConnectSDK></ConnectSDK>`

```
function SDK () {
    return (
      <BiomeThemeProvider>
        <main className="checkout-sdk-app">
          <Heading as="h1">Sample SDK</Heading>
          <p>This is a react app which implements the Checkout SDK as a marketplace would.</p>
          <ConnectSDK></ConnectSDK>
        </main>
      </BiomeThemeProvider>
    )
}

export default SDK;
```

This page renders on `localhost:3000/sdk`

From there you can build buttons that calls your SDK function and parses in whatever data you want to test and check the responses.

Because it hot reloads, any time you modify the SDK the sample app will reload and you can test your changes.

This currently will break the ui widgets, so they will need to be tested seperately.

### Jest tests in the SDK

All jest tests within the SDK are run in the jsdom environment. To configure this so that it works in our CI pipeline, please add the following comment to the top of your test file.

```
/*
 * @jest-environment jsdom
 */
```

## Widget Development

```
cd packages/sdk
npm i 
npm run build
npm pack

cd ../ui
npm i
npm run start:react
```

This will start up the connect widget on `localhost:3001`. this is the best place to devleop your app. if you want to test the input and output (events) of your widget, you will need to package the widgets app and install it into the sample app.

```
cd packages/ui
rm -rf node_modules .parcel-cache package-lock.json
npm i
npm run build
npm pack

cd ../sample-app
rm -rf node_modules package-lock.json
npm i
npm start
```

now your widget should be running in the sample app on port 3000. for the moment if you run `npm bootstrap && npm start` from the top level to test the SDK in the sample app, it will wipe out this widget install and the widget wont work until reinstalled into the sample app.

not ideal, but we'll fix it.

# Running tests

- Coming Soon &trade;

# Release process

## Staging

- Coming Soon &trade;

## Production

- Coming Soon &trade;
