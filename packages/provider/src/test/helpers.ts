import { Signer } from '@ethersproject/abstract-signer';
import { ImmutableXConfiguration, StarkSigner } from '@imtbl/core-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Signers } from '../signable-actions/types';
import { ProviderConfiguration } from '../config';

export const privateKey1 =
  'd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36';
export const privateKey2 =
  '013fe4a5265bc6deb3f3b524b987sdf987f8c7a8ec2a998ae0512f493d763c8f';
const testChainId = 5;
export const transactionResponse = {
  hash: 'some-hash',
};

const imxConfig: ImmutableXConfiguration = {
  ethConfiguration: {
    chainID: testChainId,
    coreContractAddress: '0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623',
    registrationContractAddress: '0x1C97Ada273C9A52253f463042f29117090Cd7D83',
  },
  apiConfiguration: {
    accessToken: undefined,
    apiKey: undefined,
    baseOptions: {
      headers: {
        'x-sdk-version': 'imx-core-sdk-ts-1.0.1',
      },
    },
    basePath: 'https://api.sandbox.x.immutable.com',
    formDataCtor: undefined,
    password: undefined,
    username: undefined,
    isJsonMime(): boolean {
      return true;
    },
  },
};
export const testConfig = new ProviderConfiguration({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  overrides: {
    immutableXConfig: {
      ...imxConfig,
    },
  },
});

export const getTokenAddress = (symbol: string): string => {
  const tokenAddresses = [
    {
      symbol: 'ETH',
      tokenAddress: 'ETH',
    },
    {
      symbol: 'FCT',
      tokenAddress: '0x73f99ca65b1a0aef2d4591b1b543d789860851bf',
    },
    {
      symbol: 'IMX',
      tokenAddress: '0x1facdd0165489f373255a90304650e15481b2c85', // IMX address in goerli
    },
  ];
  const token = tokenAddresses.find((token) => token.symbol === symbol);
  return token?.tokenAddress || '';
};

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export const generateSigners = async (privateKey: string): Promise<Signers> => {
  if (!privateKey) {
    throw new Error('PrivateKey required!');
  }

  const ethKey = 'ETH' + privateKey;
  const starkKey = 'STX' + privateKey;

  // L1 credentials
  const ethSigner = {
    signMessage: async (message: string) => {
      return message + ethKey;
    },
    getAddress: async () => ethKey,
    getChainId: async () => testChainId,
    sendTransaction: async () => transactionResponse,
  } as unknown as Signer;

  // L2 credentials
  const starkExSigner = {
    signMessage: async (message: string) => {
      return message + starkKey;
    },
    getAddress: () => starkKey,
  } as StarkSigner;

  return {
    ethSigner,
    starkExSigner,
  } as Signers;
};
