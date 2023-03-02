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
│       │   │
│       │   └───connect --> source code of the connect widget.
│       │   │
│       │   └───bridge --> source code of the bridge widget.
│       │   │
│       │   └───etc...
│       │
│       └───sample-app.html --> 
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

## First time setup

Bootstrap only needs to be run on first time setup and it will go thorugh and will go through and install all the dependencies for each package.

```
npm i
npm run bootstrap
```

## SDK Development

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

## Widget Development

Widget development is a little trickier since it runs multiple modules and the compiled javascript file for the widget so the hot reloading doesnt work as well.

You still want to run `npm start` from the top level of the project which will start up the sample app on `:3000` as well as the ui widgets e.g. the connect widget will run on `:3001`

If you modify the types, lib or sdk and want to get the changes into (for example) the connect widget, you need to run `npm run build` from the top level of the project. This will build all the modules in the right order and reinstall them into the connect widget. Once the build finishes this will hot reload the widget app on `:3001` so there is no need to stop and start that application.

If you want to test the widget in the sample app you need to run `npm run build:update` which will do everything above and also run webpack to compile the javascript and copy it into the sample app which will hot reload once the build is completed.

## Running the SDK in another application

If you want to build a new version and test it in another app, make sure to update the version number in the `pacakge.json` and run `npm i` before running the build and pack commands.
```
cd packages/sdk
npm i
npm run build
npm pack
```

Then link to the generated `.tgz` file in the `package.json` of the project you're wanting to use the new version. For example;
```
"@imtbl/checkout-sdk-web": "../sdk/imtbl-checkout-sdk-web-0.0.1.tgz",
```
You will probably need to uninstall the old module with `npm remove @imtbl/checkout-sdk-web` then add this line with the correct local path and version number, then run `npm install` to get the new version in your project.

### Using widgets in vanilla JavaScript & HTML

To implement widgets with vanilla javascript and html you need to simply include the built js and css files in your project e.g.

```
  <link rel="stylesheet" href="./ui/connect/dist/imx-connect-widget.css">
  <script src="lib/connect/imx-connect-widget.js"></script>
```

create the DOM element you want to inject the widget into 

```
  <div id="imx-checkout-connect"></div>
```

and run the mount command for the widget you want to load, parsing in the options object including the `elementId` with the id of hte DOM element the widget will render to.

```
  <script>
    IMXConnectWidget.mount({
      elementId: 'imx-checkout-connect'
    });
  </script>
```

### Using widgets in React

To implement widgets with React you need to add the built js and css files in your project's public directory and include them to the index.html file e.g. the template file located at `public/index.html`

```
  <link rel="stylesheet" href="./ui/connect/dist/imx-connect-widget.css">
  <script src="lib/connect/imx-connect-widget.js"></script>
```


In your src directory add a file called `global.d.ts` with the contents

```
interface Window {
    IMXConnectWidget: {
        mount: (ConnectParams) => void,
        unmount: () => void,
    };
}

interface ConnectParams {
    elementId: string,
}
```

In your React component you can add the html dom element where you want to render the widget

```
return (
    <div className="Connect">
      <span id="imx-checkout-connect"></span>
    </div>
  );
```


Then in the useEffect function add the widget and listener from the window object

```
useEffect( () => {
    window.IMXConnectWidget.mount({elementId:"imx-checkout-connect"})

    window.addEventListener("message", (event) => {
      if (event?.data?.type !== 'IMX_CHECKOUT') {
        return
      }
      console.log(event.data)
    }, false);
```

# Running tests

Test for the SDK can be run either against the whole repo or the sdk specifically
```
npm run test # whole repo including sample app
npm run test:sdk # sdk tests only
npm run test:coverage # runs the coverage report on the whole repo
```

# Release process

## Staging

- Coming Soon &trade;

## Production

- Coming Soon &trade;
