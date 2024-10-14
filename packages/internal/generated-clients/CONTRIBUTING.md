# Generated API Clients

## Table of Contents

- [About](#about)
- [Usage](#usage)
  - [Immutable X](#immutable-x)
  - [Immutable Multi-Rollup](#immutable-multi-rollup)
  - [Regenerate Clients](#regenerate-clients)
  - [Regenerate Blockchain Data Types](#regenerate-blockchain-data-types)
  - [View generators](#view-generators)

### About

Generated-clients is an internal package containing generated clients for Immutable APIs. This package contains mostly generated code, and is intended to provide the building blocks for the public interfaces that live within other external packages in this monorepo.

### Usage

The generated clients are exposed via the `ImxApiClients` and `MultiRollupApiClients` classes. These classes inject the SDK version into the request headers, and provide a single point of configuration for the API clients.

It's recommended to use the `ImxApiClients` and `MultiRollupApiClients` classes instead of the generated clients directly.

#### Immutable X

```typescript
import { ImxApiClients, imxApiConfig } from '@imtbl/generated-clients';

const imxApiClients = new ImxApiClients(imxApiConfig.getSandbox());
```

#### Immutable Multi-Rollup

```typescript
import { MultiRollupApiClients, multiRollupConfig } from '@imtbl/generated-clients';

const mrApiClients = new MultiRollupApiClients(multiRollupConfig.sandbox);
```

If you do need access to the generated API clients directly for whatever reason, they are exposed via the `imx` and `mr` namespaces:

> Note: this won't inject the SDK version into the request headers, and we won't get user metrics for these requests.

```typescript
import { imx, mr, createConfig } from '@imtbl/generated-clients';

const config = createConfig({
  basePath: 'https://api.dev.x.immutable.com',
});

const assetsApi = new imx.AssetsApi(config);
```

#### Regenerate Clients

All commands below need to be run in the `generated-clients` package folder where this README is located.

Regenerate the StarkEx clients:

```bash
make generate-imx-openapi
```

Regenerate the Immutable multi-rollup clients:

```bash
make generate-mr-openapi
```

#### Regenerate Blockchain Data Types

All commands below need to be run in the `generated-clients` package folder where this README is located.

Pull in the latest OpenApi spec:

```bash
make get-mr-openapi
make generate-blockchain-data-types
```

Note - You will need to manually remove the models and domain files not relevant to the Blockchain Data package from the `blockchain-data` folder, in order
for other teams types not to bleed into our Blockchain Data Types namespace.

Note - You will also need to replace exports with typed exports:
```ts
// Replace
export { APIError400 } from '../models';
// With
export type { APIError400 } from '../models';
```

#### View generators

To run the `view-generators` pnpm command, you will need to have the java runtime installed. The pnpm command will need to be run in the `generated-clients` package folder where this README is located.

```bash
# Install java runtime on Mac
brew install java
```

Note that version 7.0.1 for the openapi-generator-cli should be used to match the version used for the commands in the `Makefile`. This is set by default in the `openapitools.json` file.

Inspect the underlying generator files:

```bash
pnpm view-generators
```
