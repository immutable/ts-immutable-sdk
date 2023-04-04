<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>SDK for Economy Building Blocks</h1>
</div>

# Overview

This is the source code for the functionalities suported in the Economy Building Blocks SDK.

## Building

Run the following to build the library
```bash
  cd packages/economy
  npx nx build sdk
```

## Testing

Run the following to build the library
```bash
  cd packages/economy
  npx nx test sdk
```

# Contributing
- Create atomic web components: split the functionality into multiple components.
- Abstract the UI: provide unstyled element that can be used to wrap the games UI. This wrapper should help abstract SDK configurations and behavour.