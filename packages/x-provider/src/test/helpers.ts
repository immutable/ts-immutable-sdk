import { ImmutableXConfiguration, StarkSigner } from '@imtbl/x-client';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Signers } from '../signable-actions/types';
import { ProviderConfiguration } from '../config';
import { Signer } from 'ethers';

export const privateKey1 = 'd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36';
export const privateKey2 = '013fe4a5265bc6deb3f3b524b987sdf987f8c7a8ec2a998ae0512f493d763c8f';
const testChainId = 11155111;
export const transactionResponse = {
  hash: 'some-hash',
};

const imxConfig: ImmutableXConfiguration = {
  ethConfiguration: {
    chainID: testChainId,
    coreContractAddress: '0x2d5C349fD8464DA06a3f90b4B0E9195F3d1b7F98',
    registrationContractAddress: '0xDbA6129C02E69405622fAdc3d5A7f8d23eac3b97',
  },
  apiConfiguration: {
    accessToken: undefined,
    apiKey: undefined,
    baseOptions: {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
      tokenAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a', // IMX address in sepolia
    },
  ];
  const token = tokenAddresses.find((tkn) => tkn.symbol === symbol);
  return token?.tokenAddress || '';
};

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export const generateSigners = async (privateKey: string): Promise<Signers> => {
  if (!privateKey) {
    throw new Error('PrivateKey required!');
  }

  const ethKey = `ETH${privateKey}`;
  const starkKey = `STX${privateKey}`;

  // L1 credentials
  const ethSigner = {
    signMessage: async (message: string) => message + ethKey,
    getAddress: async () => ethKey,
    getChainId: async () => testChainId,
    sendTransaction: async () => transactionResponse,
  } as unknown as Signer;

  // L2 credentials
  const starkSigner = {
    signMessage: async (message: string) => message + starkKey,
    getAddress: () => starkKey,
  } as StarkSigner;

  return {
    ethSigner,
    starkSigner,
  } as Signers;
};
