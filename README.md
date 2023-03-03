<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Immutable TypeScript SDK

## Usage

Install:

```sh
yarn add @imtbl/sdk
```

Use:

```ts
import { Configuration, Environment } from '@imtbl/sdk';
import { StarkExClient } from '@imtbl/sdk/starkex';

const config = new Configuration(Environment.PRODUCTION);
const imxClient = new StarkExClient(config);
const main = async () => {
  console.log(await imxClient.listAssets());
};
main();
```

## Development Notes

How to get started:

```
# at the root, run yarn to install all dependencies
yarn
```

How to build:

```
yarn build

```
