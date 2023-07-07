// @ts-nocheck

import { Environment, ImmutableConfiguration } from '@imtbl/sdk';
import {
  ExchangeConfiguration,
} from '@imtbl/dex-sdk';

const chainId = 13392; // You can optionally retrieve the chain ID from the users wallet, or prompt the user to change networks

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});

export const configuration = new ExchangeConfiguration({
  chainId,
  baseConfig: immutableConfig,
});
