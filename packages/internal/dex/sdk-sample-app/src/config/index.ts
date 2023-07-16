import { Environment, ImmutableConfiguration } from '@imtbl/sdk';

const chainId = 13392; // You can optionally retrieve the chain ID from the users wallet, or prompt the user to change networks

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const configuration = {
  chainId,
  baseConfig: immutableConfig,
};
