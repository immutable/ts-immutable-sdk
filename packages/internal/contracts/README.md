# Contracts

Smart Contract generated bindings as an internal package, for reference by other public packages.

## Add a New Contract

Type bindings can be generated from Solidity contract files or from the contract ABI JSON files. Pick one of the following options (don't add both a contract and an ABI file for the same contract):

1. Add a new contract file to the `/contracts` folder

2. Add a new ABI file to the `/src/abi` folder

### Install and Build Project

```shell
# At the repo root level
yarn install
yarn build
```

### Generate Types

Run the `generate:types` script - in the `/contracts` package folder.

```shell
cd packages/internal/contracts
yarn generate:types
```

## Including Bytecode in ABI Files

- In order to generate all required methods to interface with the contracts, such as `attach`, the bytecode is required in the raw input files.

- Having the bytecode is also required for contract deployment functionality.
