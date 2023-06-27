# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - YYYY-MM-DD

### Added

- @imtbl/blockchain-data: Added ListTokens and GetToken methods
- @imtbl/passport: Exposes Networks, UserProfile & PassportOverrides types

### Fixed

- @imtbl/passport: Fixed the confirmation popup being blocked by browser issue

### Changed
- @imtbl/passport: Changed `createOrder` function to call the confirmation screen with guardian check

- @imtbl/blockchain-data: Improved naming for Activity types

### Removed

### Deprecated

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
