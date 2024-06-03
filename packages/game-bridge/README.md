<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Immutable Game Bridge</h1>
</div>

## How to Create Index Files for Immutable Unity and Unreal SDK

1. In the root directory of this repository, run:
```bash
yarn install
```
2. Navigate to the game-bridge directory:
```bash
`cd packages/game-bridge`
```
3. Build the files:
```bash
yarn build
```

The bundled index files will be generated in the following locations:
- Unity: `game-bridge/dist/unity/index.html`
- Unreal: `game-bridge/dist/unreal/index.js`
