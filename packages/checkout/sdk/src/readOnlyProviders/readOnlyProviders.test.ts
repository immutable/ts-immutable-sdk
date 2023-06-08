import { ethers, providers } from 'ethers';
import {
  ChainId,
  GetNetworkAllowListResult,
  SANDBOX_CONFIGURATION,
} from '../types';
import { createReadOnlyProviders } from './readOnlyProvider';
import { CheckoutConfiguration } from '../config';
import * as network from '../network';

jest.mock('../network');

describe('read only providers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    const getNetworkAllListMock = jest.fn().mockResolvedValue({
      networks: [
        {
          chainId: 13372,
          name: 'imtbl zkevm',
          isSupported: true,
          nativeCurrency: {},
        },
        {
          chainId: 11155111,
          name: 'Sepolia',
          isSupported: true,
          nativeCurrency: {},
        },
      ],
    } as GetNetworkAllowListResult);

    (network.getNetworkAllowList as jest.Mock).mockImplementation(
      getNetworkAllListMock,
    );
  });
  it('should return a map of read only providers', async () => {
    const result = await createReadOnlyProviders(
      new CheckoutConfiguration(SANDBOX_CONFIGURATION),
    );

    expect(result.size).toEqual(2);
    expect(result.get(13372)).toBeDefined();
    expect(result.get(11155111)).toBeDefined();
    expect(result.get(2)).not.toBeDefined();
  });

  it('should return new map of read only providers', async () => {
    const existingReadOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >();
    existingReadOnlyProviders.set(
      ChainId.ETHEREUM,
      new providers.JsonRpcProvider('mainnet-url'),
    );

    const result = await createReadOnlyProviders(
      new CheckoutConfiguration(SANDBOX_CONFIGURATION),
      existingReadOnlyProviders,
    );

    expect(result.size).toEqual(2);
    expect(result.get(13372)).toBeDefined();
    expect(result.get(11155111)).toBeDefined();
    expect(result.get(1)).not.toBeDefined();
  });

  it('should return existing map of read only providers', async () => {
    const existingReadOnlyProviders = new Map<
    ChainId,
    ethers.providers.JsonRpcProvider
    >();
    existingReadOnlyProviders.set(
      ChainId.SEPOLIA,
      new providers.JsonRpcProvider('sepolia-url'),
    );

    const result = await createReadOnlyProviders(
      new CheckoutConfiguration(SANDBOX_CONFIGURATION),
      existingReadOnlyProviders,
    );

    expect(result.size).toEqual(1);
    expect(result.get(11155111)).toBeDefined();
    expect(result.get(13372)).not.toBeDefined();
  });
});
