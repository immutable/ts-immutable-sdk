import { Environment } from '@imtbl/config';
import { JsonRpcProvider } from 'ethers';
import { getAllTokenBalances } from './tokenBalances';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
import { ChainId } from '../../types';
import { getAllBalances } from '../../balances';
import { CheckoutErrorType } from '../../errors';
import { TokenBalanceResult } from './types';
import { HttpClient } from '../../api/http';

jest.mock('../../balances');
jest.mock('../../config');

describe('tokenBalances', () => {
  let mockConfig: CheckoutConfiguration;
  const ownerAddress = '0x123';

  beforeEach(() => {
    jest.resetAllMocks();

    (getL1ChainId as jest.Mock).mockReturnValue(ChainId.SEPOLIA);
    (getL2ChainId as jest.Mock).mockReturnValue(ChainId.IMTBL_ZKEVM_TESTNET);
    const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    mockConfig = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);
  });

  it('should return multiple chain balances', async () => {
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]);

    const getBalancesResult = {
      balances:
        [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
    };
    (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

    const tokenBalances = await getAllTokenBalances(
      mockConfig,
      readonlyProviders,
      ownerAddress,
      availableRoutingOptions,
    );
    expect(tokenBalances.size).toEqual(2);
    expect(tokenBalances.get(ChainId.SEPOLIA)).toEqual({ success: true, balances: getBalancesResult.balances });
    expect(tokenBalances.get(ChainId.IMTBL_ZKEVM_TESTNET)).toEqual({
      success: true,
      balances: getBalancesResult.balances,
    });
  });

  it('should return L2 balances only when bridge option is disabled', async () => {
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: false,
    };

    const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]);

    const getBalancesResult = {
      balances:
        [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
    };
    (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

    const tokenBalances = await getAllTokenBalances(
      mockConfig,
      readonlyProviders,
      ownerAddress,
      availableRoutingOptions,
    );

    expect(tokenBalances.size).toEqual(1);
    expect(tokenBalances.get(ChainId.IMTBL_ZKEVM_TESTNET)).toEqual({
      success: true,
      balances: getBalancesResult.balances,
    });
  });

  it('should return failed for both chains if no providers are available', async () => {
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    const readonlyProviders = new Map<ChainId, JsonRpcProvider>([]);

    const tokenBalances = await getAllTokenBalances(
      mockConfig,
      readonlyProviders,
      ownerAddress,
      availableRoutingOptions,
    );

    expect(tokenBalances.size).toEqual(2);
    const balanceResultL1 = tokenBalances.get(ChainId.SEPOLIA) as TokenBalanceResult;
    expect(balanceResultL1.success).toEqual(false);
    expect(balanceResultL1.balances).toEqual([]);
    expect(balanceResultL1.error?.type).toEqual(CheckoutErrorType.PROVIDER_ERROR);

    const balanceResultL2 = tokenBalances.get(ChainId.IMTBL_ZKEVM_TESTNET) as TokenBalanceResult;
    expect(balanceResultL2.success).toEqual(false);
    expect(balanceResultL2.balances).toEqual([]);
    expect(balanceResultL2.error?.type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
  });

  it('should return L1 failed when no L1 provider is available', async () => {
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]);

    const getBalancesResult = {
      balances:
        [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
    };
    (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

    const tokenBalances = await getAllTokenBalances(
      mockConfig,
      readonlyProviders,
      ownerAddress,
      availableRoutingOptions,
    );

    expect(tokenBalances.size).toEqual(2);
    const balanceResultL1 = tokenBalances.get(ChainId.SEPOLIA) as TokenBalanceResult;
    expect(balanceResultL1.success).toEqual(false);
    expect(balanceResultL1.balances).toEqual([]);
    expect(balanceResultL1.error?.type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
    expect(tokenBalances.get(ChainId.IMTBL_ZKEVM_TESTNET)).toEqual({
      success: true,
      balances: getBalancesResult.balances,
    });
  });

  it('should return L2 failed when no L2 provider is available', async () => {
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
    ]);

    const getBalancesResult = {
      balances:
        [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
    };
    (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

    const tokenBalances = await getAllTokenBalances(
      mockConfig,
      readonlyProviders,
      ownerAddress,
      availableRoutingOptions,
    );

    expect(tokenBalances.size).toEqual(2);
    expect(tokenBalances.get(ChainId.SEPOLIA)).toEqual({ success: true, balances: getBalancesResult.balances });
    const balanceResultL2 = tokenBalances.get(ChainId.IMTBL_ZKEVM_TESTNET) as TokenBalanceResult;
    expect(balanceResultL2.success).toEqual(false);
    expect(balanceResultL2.balances).toEqual([]);
    expect(balanceResultL2.error?.type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
  });
});
