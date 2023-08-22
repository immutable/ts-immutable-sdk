# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.0] - 2023-08-22

### Added

- @imtbl/passport: Improved silent logout functionality - zkEvm provider will now emit `accountsChanged` and IMXProvider will throw an error if workflows are called after logout.
- @imtbl/passport: Added SDK bridge support for native applications.
- @imtbl/orderbook: Added optional fee parameter in create and fulfill order flows
- @imtbl/orderbook: Changed the way we fulfill orders under the hood to make a call to fulfillment-data
- @imtbl/erc721-hybrid-permissioned-mintable: Add support for hybrid preset contract.

### Changed

- @imtbl/passport: Removed `zkEvmChainId` from Passport configuration. Passport will now automatically resolve the chain ID.

## [0.9.0] - 2023-08-15
### Changed

- @imtbl/orderbook: Changed how transactions and signable messages are returned from `prepareListing` and `prepareFulfillment` to ensure transactions gas limits can be estimated in order.
- @imtbl/orderbook: Updated sandbox config to reference testnet contract addresses.

## [0.7.0] - 2023-08-14

### Added

- @imtbl/erc721-permissioned-mintable: Preset contract changes: Added `safeMintBatch` and `burnBatch` to support batch operations.

### Fixed

- @imtbl/passport: Fixed a bug where the guardian popup was not closing if pre-requisite API calls failed.

### Changed

- @imtbl/erc721-permissioned-mintable: Preset contract changes: Modified mint method to specify token IDs instead of number of tokens to mint.
- Modules are now exported under their own namespaces instead of being flattened
- @imtbl/passport: Updated testnet (sandbox) zkEvmChainId

### Removed

### Deprecated

## [0.4.4] - 2023-08-04

### Added

- @imtbl/passport: Added `isPassport` property to Passport zkEVM provider

## [0.4.3] - 2023-08-04

### Added

- @imtbl/passport: Added zkEVM Support, see the [zkEVM Passport documentation](https://docs.immutable.com/docs/zkevm/products/passport/) for more information.
- Fixed an issue where the API version was appended to the header twice in every API call

## [0.4.2] - 2023-07-31

### Added

- @imtbl/blockchain-data: Added Deposit and Withdrawal activity types

### Fixed

- @imtbl/immutablex_client: Updated to use core-sdk v2.0.2 with grind key fixes.

### Changed

### Removed

### Deprecated

## [0.3.1] - 2023-07-26

### Added

- @imtbl/blockchain-data: Added ListTokens and GetToken methods
- @imtbl/passport: Exposes Networks, UserProfile & PassportOverrides types
- @imtbl/blockchain-data: Expose ActivityType type

### Fixed

### Changed
- @imtbl/blockchain-data: Improved naming for Activity types

- @imtbl/immutablex-client: Order requests now pointing to the V3 endpoints

### Removed

### Deprecated


## [0.3.0] - 2023-07-18

### Added

- @imtbl/passport: Silent logout feature

## [0.1.9] - 2023-07-05

### Fixed

- @imtbl/passport: Fixed the confirmation popup being blocked by browser issue

### Changed
- @imtbl/passport: Changed all the other Passport starkEx Provider functions to call the confirmation screen with guardian check

## [0.1.8] - 2023-06-05

### Added

- @imtbl/blockchain-data: Package for exposing blockchain data information.
- @imtbl/passport: guardian domain in configuration

### Fixed

- @imtbl/passport: Fixed a bug on Passport Provider getAddress.

### Changed

- @imtbl/passport: Changed `transfer` function to call the confirmation screen with guardian check

### Removed

### Deprecated
Foo
