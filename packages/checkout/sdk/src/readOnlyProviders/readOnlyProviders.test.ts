import { Environment } from '@imtbl/config';
import { JsonRpcProvider } from 'ethers';
import { ChainId, ChainName, GetNetworkAllowListResult } from '../types';
import { createReadOnlyProviders } from './readOnlyProvider';
import { CheckoutConfiguration } from '../config';
import * as network from '../network';
import { HttpClient } from '../api/http';

jest.mock('../network');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn(),
}));

const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
const baseConfig = new CheckoutConfiguration({
  baseConfig: { environment: Environment.SANDBOX },
}, mockedHttpClient);

describe('read only providers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    const getNetworkAllListMock = jest.fn().mockResolvedValue({
      networks: [
        {
          chainId: BigInt(ChainId.IMTBL_ZKEVM_TESTNET),
          name: ChainName.IMTBL_ZKEVM_TESTNET,
          isSupported: true,
          nativeCurrency: {},
        },
        {
          chainId: BigInt(ChainId.SEPOLIA),
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
