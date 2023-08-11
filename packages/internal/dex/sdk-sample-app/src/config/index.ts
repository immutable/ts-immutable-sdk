import { Environment, ImmutableConfiguration } from '@imtbl/config';

const chainId = 13472; // You can optionally retrieve the chain ID from the users wallet, or prompt the user to change networks

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const configuration = {
  chainId,
  baseConfig: immutableConfig,
};
