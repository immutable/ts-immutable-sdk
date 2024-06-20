# Generated API Clients

Internal package containing generated clients for Immutable APIs.

This package only contains mostly generated code, and is intended to provide the building blocks for the public interfaces that live within other external packages in this monorepo.

> ❗ DO NOTE EXPOSE GENERATED API CLIENTS DIRECTLY TO THE PUBLIC

## Usage

The generated clients are exposed via the `ImxApiClients` and `MultiRollupApiClients` classes. These classes inject the SDK version into the request headers, and provide a single point of configuration for the API clients.

It's recommended to use the `ImxApiClients` and `MultiRollupApiClients` classes instead of the generated clients directly.

### Immutable X

```typescript
import { ImxApiClients, imxApiConfig } from '@imtbl/generated-clients';

const imxApiClients = new ImxApiClients(imxApiConfig.getSandbox());
```

### Immutable Multi-Rollup

```typescript
import {
  MultiRollupApiClients,
  multiRollupConfig,
} from '@imtbl/generated-clients';

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

## Regenerate Clients

The following commands should be run from the root of the `packages/internal/generated-clients` directory.

Run the following command to regenerate the StarkEx clients:

```bash
make generate-imx-openapi
```

Run the following command to regenerate the Immutable multi-rollup clients:

```bash
make generate-mr-openapi
```

## Regenerate Blockchain Data Types

The following commands should be run from the root of the `packages/internal/generated-clients` directory.

Run the following command to pull in the latest OpenApi spec:

```bash
make get-mr-openapi
make generate-blockchain-data-types
```

Note - You will need to manually remove the models and domain files not relevant to the Blockchain Data package from the `blockchain-data` folder, in order
for other teams types not to bleed into our Blockchain Data Types namespace.

## View generators

To inspect underlying generator files, run:

```bash
openapi-generator author template -g typescript-axios -o src/templates
```
