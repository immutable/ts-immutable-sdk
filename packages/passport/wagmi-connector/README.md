
# wagmi-connector

Wagmi connector for Immutable Passport. 

## Install

```shell
  npm install @imtbl/passport-wagmi-connector @imtbl/sdk
```
or
```shell
  yarn add @imtbl/passport-wagmi-connector @imtbl/sdk
```

## Example of usage

```ts
  import { PassportConnector } from '@imtbl/passport-wagmi-connector';

  const connectors = [
    new PassportConnector({
      chains,
      options: {
        defaultNetwork: 137,
        connect: {
          app: 'Demo-app'
        }
      }
    }),
    ...otherConnectors
  ]
  
  const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider
  });
```