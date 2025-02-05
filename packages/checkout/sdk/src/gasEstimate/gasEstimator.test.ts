import { Contract, JsonRpcProvider } from 'ethers';
import { Environment } from '@imtbl/config';
import { Exchange, TransactionResponse } from '@imtbl/dex-sdk';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { gasEstimator } from './gasEstimator';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateSwapParams,
  GasEstimateSwapResult,
  GasEstimateType,
  ChainId,
} from '../types';
import { createBridgeInstance, createExchangeInstance } from '../instance';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { HttpClient } from '../api/http';

jest.mock('../instance');

jest.mock('../config/remoteConfigFetcher');

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('gasServiceEstimator', () => {
  let readOnlyProviders: Map<ChainId, JsonRpcProvider>;
  let config: CheckoutConfiguration;
  let decimalsMock: jest.Mock;
  let nameMock: jest.Mock;
  let symbolMock: jest.Mock;

  beforeEach(() => {
    decimalsMock = jest.fn().mockResolvedValue(18);
    nameMock = jest.fn().mockResolvedValue('Ethereum');
    symbolMock = jest.fn().mockResolvedValue('ETH');
    (Contract as unknown as jest.Mock).mockReturnValue({
      decimals: decimalsMock,
      name: nameMock,
      symbol: symbolMock,
    });

    readOnlyProviders = new Map<ChainId, JsonRpcProvider>([
      [
        ChainId.SEPOLIA,
        {
          getFeeData: jest.fn().mockResolvedValue({
            maxFeePerGas: '0x1',
            maxPriorityFeePerGas: '0x1',
            gasPrice: null,
          }),
        } as unknown as JsonRpcProvider,
      ],
    ]);

    (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
      getConfig: jest.fn().mockResolvedValue({
        [ChainId.IMTBL_ZKEVM_TESTNET]: {
          swapAddresses: {
            inAddress: '0x1',
            outAddress: '0x2',
          },
        },
        [ChainId.SEPOLIA]: {
          bridgeToL2Addresses: {
            gasTokenAddress: 'NATIVE',
            fromAddress: '0x4',
          },
        },
      }),
    });

    const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);
  });

  describe('swap', () => {
    it('should return gas estimate for swap', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn<Promise<TransactionResponse>, any[]>().mockResolvedValue({
          swap: {
            transaction: {} as any,
            gasFeeEstimate: {
              value: BigInt(1),
              token: {
                address: '0x1',
                symbol: 'TEST',
                name: 'TEST',
                decimals: 18,
                chainId: 1,
              },
            },
          },
          approval: {} as any,
          quote: {} as any,
        }),
      });

      const result = (await gasEstimator(
        { gasEstimateType: GasEstimateType.SWAP },
        readOnlyProviders,
        config,
      )) as GasEstimateSwapResult;

      expect(result.gasEstimateType).toEqual(GasEstimateType.SWAP);
      expect(result.fees.totalFees).toEqual(BigInt(1));
      expect(result.fees.token?.address).toEqual('0x1');
      expect(result.fees.token?.symbol).toEqual('TEST');
      expect(result.fees.token?.name).toEqual('TEST');
      expect(result.fees.token?.decimals).toEqual(18);
    });

    it('should handle null gasFeeEstimate returned from the exchange', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn<Promise<TransactionResponse>, any[]>().mockResolvedValue({
          swap: {
            transaction: {} as any,
            gasFeeEstimate: null,
          },
          approval: {} as any,
          quote: {} as any,
        }),
      });

      const result = (await gasEstimator(
        { gasEstimateType: GasEstimateType.SWAP },
        readOnlyProviders,
        config,
      )) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        fees: {},
      });
    });

    it('should handle undefined amount returned from the exchange', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn<Promise<TransactionResponse>, any[]>().mockResolvedValue({
          swap: {
            transaction: {} as any,
            gasFeeEstimate: {
              value: undefined as any, // undefined is not allowed by the types need to use `as any` to override
              token: {
                address: '0x1',
                symbol: 'TEST',
                name: 'TEST',
                decimals: 18,
                chainId: 1,
              },
            },
          },
          approval: {} as any,
          quote: {} as any,
        }),
      } as unknown as Exchange);

      const result = (await gasEstimator(
        { gasEstimateType: GasEstimateType.SWAP },
        readOnlyProviders,
        config,
      )) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        fees: {
          totalFees: undefined,
          token: {
            address: '0x1',
            symbol: 'TEST',
            name: 'TEST',
            decimals: 18,
          },
        },
      });
    });

    it('should handle error when calling dex', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn().mockRejectedValue({}),
      } as unknown as Exchange);

      const result = (await gasEstimator(
        { gasEstimateType: GasEstimateType.SWAP },
        readOnlyProviders,
        config,
      )) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        fees: {},
      });
    });
  });

  describe('bridge to L2', () => {
    it('should estimate gas for bridging L1 to L2', async () => {
      (createBridgeInstance as jest.Mock).mockReturnValue({
        getFee: jest.fn().mockResolvedValue({
          sourceChainGas: BigInt('100000000000000'),
          imtblFee: BigInt('0'),
          bridgeFee: BigInt('2000000000000000'),
          totalFees: BigInt('2100000000000000'),
        }),
      } as unknown as TokenBridge);

      const result = (await gasEstimator(
        {
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        },
        readOnlyProviders,
        config,
      )) as GasEstimateBridgeToL2Result;

      expect(result.gasEstimateType).toEqual(GasEstimateType.BRIDGE_TO_L2);
      expect(result.fees.totalFees).toEqual(BigInt('2100000000000000'));
      expect(result.token?.symbol).toEqual('ETH');
    });

    it('should estimate gas for bridging L1 to L2 with approval transaction included in estimate', async () => {
      (createBridgeInstance as jest.Mock).mockReturnValue({
        getFee: jest.fn().mockResolvedValue({
          sourceChainGas: BigInt('100000000000000'),
          imtblFee: BigInt('0'),
          bridgeFee: BigInt('2000000000000000'),
          totalFees: BigInt('2100000000000000'),
        }),
      } as unknown as TokenBridge);

      const result = (await gasEstimator(
        {
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        },
        readOnlyProviders,
        config,
      )) as GasEstimateBridgeToL2Result;

      expect(result.gasEstimateType).toEqual(GasEstimateType.BRIDGE_TO_L2);
      expect(result.fees.totalFees).toEqual(BigInt('2100000000000000'));
      expect(result.token?.symbol).toEqual('ETH');
    });

    it('should handle non-supported EIP-1559 chain', async () => {
      (createBridgeInstance as jest.Mock).mockReturnValue({
        getFee: jest.fn().mockResolvedValue({
          sourceChainGas: BigInt('100000000000000'),
          imtblFee: BigInt('0'),
          bridgeFee: BigInt('2000000000000000'),
          totalFees: BigInt('2100000000000000'),
        }),
      } as unknown as TokenBridge);

      const readOnlyProvidersUndefinedFees = new Map<
      ChainId,
      JsonRpcProvider
      >([
        [
          ChainId.SEPOLIA,
          {
            getFeeData: jest.fn().mockResolvedValue({
              // Missing maxFeePerGas and maxPriorityFeePerGas indicates the chain does not support EIP-1559
              maxFeePerGas: null,
              maxPriorityFeePerGas: null,
              gasPrice: '0x1',
            }),
          } as unknown as JsonRpcProvider,
        ],
      ]);
      const result = (await gasEstimator(
        {
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        },
        readOnlyProvidersUndefinedFees,
        config,
      )) as GasEstimateBridgeToL2Result;

      expect(result.fees.totalFees).toEqual(BigInt('2100000000000000'));
    });

    it('should handle error when calling bridge', async () => {
      (createBridgeInstance as jest.Mock).mockReturnValue({});

      const result = (await gasEstimator(
        {
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        },
        readOnlyProviders,
        config,
      )) as GasEstimateBridgeToL2Result;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          sourceChainGas: BigInt(0),
          approvalFee: BigInt(0),
          bridgeFee: BigInt(0),
          imtblFee: BigInt(0),
          totalFees: BigInt(0),
        },
        token: {
          decimals: 18,
          name: 'Sep Eth',
          symbol: 'ETH',
        },
      });
    });
  });

  it('should throw error for invalid gasEstimateType', async () => {
    await expect(
      gasEstimator(
        {
          gasEstimateType: 'INVALID' as GasEstimateType,
        } as GasEstimateSwapParams,
        readOnlyProviders,
        config,
      ),
    ).rejects.toThrow(
      new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      ),
    );
  });
});
