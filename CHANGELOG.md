# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - YYYY-MM-DD

### Added

- @imtbl/blockchain-data: Added Deposit and Withdrawal activity types

### Fixed

- @imtbl/immutablex_client: Updated to use core-sdk v2.0.2 with grind key fixes.
- Fixed an issue where the API version was appended to the header twice in every API call

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
