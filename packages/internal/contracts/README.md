# Contracts
Smart Contract generated bindings as an internal package, for reference by other public packages

### Add a new contract

- Add the contract abi json file to the `/src/abi` folder
- install and build project - at the root level

```shell
yarn install
yarn build
```

- run the `generate-types` script - in the `/contracts` folder

```shell
cd packages/internal/contracts
yarn run generate-types
```
