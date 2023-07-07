import { ethers, providers } from 'ethers';
import { Environment } from '@imtbl/config';
import { ChainId, GetNetworkAllowListResult } from '../types';
import { createReadOnlyProviders } from './readOnlyProvider';
import { CheckoutConfiguration } from '../config';
import * as network from '../network';

jest.mock('../network');

const baseConfig = new CheckoutConfiguration({
  baseConfig: { environment: Environment.SANDBOX },
});

describe.skip('read only providers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    const getNetworkAllListMock = jest.fn().mockResolvedValue({
      networks: [
        {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          isSupported: true,
          nativeCurrency: {},
        },
        {
          chainId: ChainId.SEPOLIA,
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
    const result = await createReadOnlyProviders(baseConfig);

    expect(result.size).toEqual(2);
    expect(result.get(ChainId.IMTBL_ZKEVM_TESTNET)).toBeDefined();
    expect(result.get(ChainId.SEPOLIA)).toBeDefined();
    expect(result.get(ChainId.ETHEREUM)).not.toBeDefined();
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
      baseConfig,
      existingReadOnlyProviders,
    );

    expect(result.size).toEqual(2);
    expect(result.get(ChainId.IMTBL_ZKEVM_TESTNET)).toBeDefined();
    expect(result.get(ChainId.SEPOLIA)).toBeDefined();
    expect(result.get(ChainId.ETHEREUM)).not.toBeDefined();
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
      baseConfig,
      existingReadOnlyProviders,
    );

    expect(result.size).toEqual(1);
    expect(result.get(ChainId.SEPOLIA)).toBeDefined();
    expect(result.get(ChainId.IMTBL_ZKEVM_TESTNET)).not.toBeDefined();
  });
});
