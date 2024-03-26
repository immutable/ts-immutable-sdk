import { Environment, ImmutableConfiguration } from '@imtbl/config';

const immutableTestnetChainID = 13473; // You can optionally retrieve the chain ID from the users wallet, or prompt the user to change networks
const immutableMainnetChainID = 13371

const baseConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const configuration = {
  chainId: immutableTestnetChainID,
  baseConfig,
};
