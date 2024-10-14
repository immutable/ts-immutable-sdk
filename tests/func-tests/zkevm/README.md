# func-tests

Functional tests using Cucumber and Gherkin

## Prerequisites

1. Open the repository root folder in VS Code
2. Install dependencies: `pnpm` (husky needs `node_modules` at the repo root to run)
3. Build the SDK: `pnpm build`

### Required ENV values

```
# Example
# ZKEVM_RPC_ENDPOINT=         // Chain RPC endpoint
# ORDERBOOK_MR_API_URL=       // Immutable zkEVM API endpoint
# ZKEVM_CHAIN_NAME=           // Immutable zkEVM chain name
# ZKEVM_ORDERBOOK_BANKER=     // Banker private key used to fund accounts
# ZKEVM_ORDERBOOK_ERC20=      // Address of the ERC20 contract that the banker can mint from (can be redeployed with `pnpm ts-node utils/orderbook/deploy-erc20.ts`)
# ZKEVM_ORDERBOOK_ERC721=     // Address of the ERC721 contract that the banker can mint from (can be redeployed with `pnpm ts-node utils/orderbook/deploy-erc721.ts`)
# ZKEVM_ORDERBOOK_ERC1155=    // Address of the ERC1155 contract that the banker can mint from (can be redeployed with `pnpm ts-node utils/orderbook/deploy-erc1155.ts`)
# SEAPORT_CONTRACT_ADDRESS=   // Seaport contract
# ZONE_CONTRACT_ADDRESS=      // Seaport zone contract
# OPERATOR_ALLOWLIST_ADDRESS= // Operator allow list contract

# Devnet
# ZKEVM_RPC_ENDPOINT=https://rpc.dev.immutable.com
# ORDERBOOK_MR_API_URL=https://api.dev.immutable.com
# ZKEVM_CHAIN_NAME=imtbl-zkevm-devnet
# ZKEVM_ORDERBOOK_BANKER=
# ZKEVM_ORDERBOOK_ERC20=0x37ad85c4c4091a05c4cf70D4c07AA13085bfc465
# ZKEVM_ORDERBOOK_ERC721=0xb13469072875a98dF256D3A309cF06e09c020294
# ZKEVM_ORDERBOOK_ERC1155=0xD984dB6E4Ed6539323BcF9A91aE0C4326d89e6D5
# SEAPORT_CONTRACT_ADDRESS=0xbA22c310787e9a3D74343B17AB0Ab946c28DFB52
# ZONE_CONTRACT_ADDRESS=0xb71EB38e6B51Ee7A45A632d46f17062e249580bE
# OPERATOR_ALLOWLIST_ADDRESS=0x5A3461514af018c19A6F887d14840B05fED4c5b8

# Testnet
ZKEVM_RPC_ENDPOINT=https://rpc.testnet.immutable.com
ORDERBOOK_MR_API_URL=https://api.sandbox.immutable.com
ZKEVM_CHAIN_NAME=imtbl-zkevm-testnet
ZKEVM_ORDERBOOK_BANKER=
ZKEVM_ORDERBOOK_ERC20=0x70dCEF6C22F50497eafc77D252E8E175af21bF75
ZKEVM_ORDERBOOK_ERC721=0xBE8B131f39825282Ace9eFf99C0Bb14972417b49
ZKEVM_ORDERBOOK_ERC1155=0x2efB9B7810B1d1520c0822aa20F1889ABd2c2146
SEAPORT_CONTRACT_ADDRESS=0x7d117aA8BD6D31c4fa91722f246388f38ab1942c
ZONE_CONTRACT_ADDRESS=0x1004f9615E79462c711Ff05a386BdbA91a7628C3
OPERATOR_ALLOWLIST_ADDRESS=0x6b969FD89dE634d8DE3271EbE97734FEFfcd58eE
```

## Running the tests

1. Run the tests: `pnpm func-test`

**Note:** Certain tests are skipped on CI because of the time they take to run. To run only these, use `pnpm func-test:ci`

## Filtering tests

By default, all tests that do not have the `@skip` tag are run. In other words, the tag filter is set to `not @skip`.

You can change the tag filter on the command line: `TAGS="<tag-expression>" pnpm test`, or more permanently, by editing your .env file directly.

Examples of `<tag-expression>`:

* `@registration` - only run tests with the `@registration` tag
* `not @registration` - run all tests except those with the `@registration` tag

**Tip:** To focus on a single test, add the `@only` tag to the relevant scenario, and set the tag expression to match.

## Tests that take long

Please add the `@slow` tag to any tests that take longer than a few minutes to run. These tests will be skipped on CI.
