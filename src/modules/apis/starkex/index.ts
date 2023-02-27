import { ImmutableX, Config } from '@imtbl/core-sdk';

const imtblClient = new ImmutableX(Config.SANDBOX);

// Remove provider specific methods
const {
  ...StarkEx
} = imtblClient;

export { StarkEx };
