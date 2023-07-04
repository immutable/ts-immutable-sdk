import { Environment } from '@imtbl/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainId, ChainName, GetNetworkAllowListResult } from '../types';
import { createReadOnlyProviders } from './readOnlyProvider';
import { CheckoutConfiguration } from '../config';
import * as network from '../network';

jest.mock('../network');
jest.mock('@ethersproject/providers', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  JsonRpcProvider: jest.fn(),
}));

const baseConfig = new CheckoutConfiguration({
  baseConfig: { environment: Environment.SANDBOX },
});

describe('read only providers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    const getNetworkAllListMock = jest.fn().mockResolvedValue({
      networks: [
        {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: ChainName.IMTBL_ZKEVM_TESTNET,
          isSupported: true,
          nativeCurrency: {},
        },
        {
          chainId: ChainId.SEPOLIA,
          name: ChainName.SEPOLIA,
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
    const existingReadOnlyProviders = new Map<ChainId, JsonRpcProvider>();
    existingReadOnlyProviders.set(
      ChainId.ETHEREUM,
      new JsonRpcProvider('mainnet-url'),
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
    const existingReadOnlyProviders = new Map<ChainId, JsonRpcProvider>();
    existingReadOnlyProviders.set(
      ChainId.SEPOLIA,
      new JsonRpcProvider('sepolia-url'),
    );

    const result = await createReadOnlyProviders(
      baseConfig,
      existingReadOnlyProviders,
    );

    expect(result.size).toEqual(1);
    expect(result.get(ChainId.SEPOLIA)).toBeDefined();
  });
});
