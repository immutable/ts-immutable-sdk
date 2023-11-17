import { Environment, ImmutableConfiguration } from '@imtbl/config';

const chainId = 13473; // You can optionally retrieve the chain ID from the users wallet, or prompt the user to change networks

const baseConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const configuration = {
  chainId,
  baseConfig,
};
