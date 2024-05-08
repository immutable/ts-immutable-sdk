# func-tests

Functional tests using Cucumber and Gherkin

## Prerequisites

1. Open the repository root folder in VS Code
2. Install dependencies: `yarn` (husky needs `node_modules` at the repo root to run)
3. Build the SDK: `yarn build`
4. cd into `tests/func-tests/zkevm` 
5. Install dependencies: `yarn` (this also configures husky)

### Required ENV values

ZKEVM_ORDERBOOK_BANKER=0x // banker private key used to fund accounts for listings and trades
ZKEVM_ORDERBOOK_ERC721=0x // Address of the ERC721 contract that the bank can mint (can be redeployed with `npx ts-node utils/orderbook/deploy-erc721.ts`)
ZKEVM_ORDERBOOK_ERC1155=0x // Address of the ERC1155 contract that the bank can mint (can be redeployed with `npx ts-node utils/orderbook/deploy-erc1155.ts`)
SEAPORT_CONTRACT_ADDRESS=0x
ZONE_CONTRACT_ADDRESS=0x
// The following are devnet values, if running against testnet need to modify
ZKEVM_RPC_ENDPOINT=https://rpc.dev.immutable.com
ORDERBOOK_MR_API_URL=https://order-book-mr.dev.imtbl.com
ZKEVM_CHAIN_NAME=imtbl-zkevm-devnet

## Running the tests

1. Run the tests: `yarn test`

**Note:** Certain tests are skipped on CI because of the time they take to run. To run only these, use `yarn test:ci`

## Filtering tests

By default, all tests that do not have the `@skip` tag are run. In other words, the tag filter is set to `not @skip`. 

You can change the tag filter on the command line: `TAGS="<tag-expression>" yarn test`, or more permanently, by editing your .env file directly.

Examples of `<tag-expression>`:

* `@registration` - only run tests with the `@registration` tag
* `not @registration` - run all tests except those with the `@registration` tag

**Tip:** To focus on a single test, add the `@only` tag to the relevant scenario, and set the tag expression to match.

## Tests that take long

Please add the `@slow` tag to any tests that take longer than a few minutes to run. These tests will be skipped on CI.
