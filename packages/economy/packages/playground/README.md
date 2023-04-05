<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Playground for Economy Building Blocks</h1>
</div>

# Overview

This is a single page website that can be use to preview and test the SDK functionality. The setup uses Lit Element web components to bundle the JS and HTML used to consume the SDK.

## Running

Run the following to serve the playground application on `http://127.0.0.1:4200/`
```bash
  cd packages/economy
  npx nx serve playground
```

# Contributing
- Create atomic web components: split the functionality into multiple components.
- Abstract the UI: provide unstyled element that can be used to wrap the games UI. This wrapper should help abstract SDK configurations and behavour.