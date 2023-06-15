import { BigNumber, ethers } from 'ethers';
import { Environment } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { gasServiceEstimator } from './gasServiceEstimator';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType } from '../types/gasEstimate';
import { ChainId } from '../types';
import { createBridgeInstance, createExchangeInstance } from '../instance';

jest.mock('../instance');

describe('gasServiceEstimator', () => {
  let readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>;

  beforeEach(() => {
    readOnlyProviders = new Map<ChainId, ethers.providers.JsonRpcProvider>([
      [ChainId.SEPOLIA, {
        getFeeData: jest.fn().mockResolvedValue({
          maxFeePerGas: '0x1',
          maxPriorityFeePerGas: '0x1',
          gasPrice: null,
        }),
      } as unknown as ethers.providers.JsonRpcProvider],
    ]);
  });

  describe('swap', () => {
    it('should return gas estimate for swap', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({
          info: {
            gasFeeEstimate: {
              amount: BigNumber.from(1),
              token: {
                address: '0x1',
                symbol: 'TEST',
                name: 'TEST',
                decimals: 18,
              },
            },
          },
        }),
      } as unknown as Exchange);

      const result = await gasServiceEstimator(
        GasEstimateType.SWAP,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateSwapResult;

      expect(result.gasEstimateType).toEqual(GasEstimateType.SWAP);
      expect(result.gasFee.estimatedAmount).toEqual(BigNumber.from(1));
      expect(result.gasFee.token?.address).toEqual('0x1');
      expect(result.gasFee.token?.symbol).toEqual('TEST');
      expect(result.gasFee.token?.name).toEqual('TEST');
      expect(result.gasFee.token?.decimals).toEqual(18);
    });

    it('should handle null gasFeeEstimate returned from the exchange', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({
          info: {
            gasFeeEstimate: null,
          },
        }),
      } as unknown as Exchange);

      const result = await gasServiceEstimator(
        GasEstimateType.SWAP,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {},
      });
    });

    it('should handle undefined amount returned from the exchange', async () => {
      (createExchangeInstance as jest.Mock).mockResolvedValue({
        getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({
          info: {
            gasFeeEstimate: {
              amount: undefined,
              token: {
                address: '0x1',
                symbol: 'TEST',
                name: 'TEST',
                decimals: 18,
              },
            },
          },
        }),
      } as unknown as Exchange);

      const result = await gasServiceEstimator(
        GasEstimateType.SWAP,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {
          estimatedAmount: undefined,
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

      const result = await gasServiceEstimator(
        GasEstimateType.SWAP,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateSwapResult;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {},
      });
    });
  });

  describe('bridge to L2', () => {
    it('should estimate gas for bridging L1 to L2', async () => {
      (createBridgeInstance as jest.Mock).mockResolvedValue({
        getFee: jest.fn().mockResolvedValue({
          feeAmount: BigNumber.from(1),
        }),
      } as unknown as TokenBridge);

      const result = await gasServiceEstimator(
        GasEstimateType.BRIDGE_TO_L2,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateBridgeToL2Result;

      expect(result.gasEstimateType).toEqual(GasEstimateType.BRIDGE_TO_L2);
      expect(result.gasFee.estimatedAmount).toEqual(BigNumber.from(560000));
      expect(result.gasFee.token?.symbol).toEqual('ETH');
      expect(result.bridgeFee.estimatedAmount).toEqual(BigNumber.from(1));
    });

    it('should handle non-supported EIP-1559 chain', async () => {
      (createBridgeInstance as jest.Mock).mockResolvedValue({
        getFee: jest.fn().mockResolvedValue({
          feeAmount: BigNumber.from(1),
        }),
      } as unknown as TokenBridge);

      const readOnlyProvidersUndefinedFees = new Map<ChainId, ethers.providers.JsonRpcProvider>([
        [ChainId.SEPOLIA, {
          getFeeData: jest.fn().mockResolvedValue({
            // Missing maxFeePerGas and maxPriorityFeePerGas indicates the chain does not support EIP-1559
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            gasPrice: '0x1',
          }),
        } as unknown as ethers.providers.JsonRpcProvider],
      ]);
      const result = await gasServiceEstimator(
        GasEstimateType.BRIDGE_TO_L2,
        readOnlyProvidersUndefinedFees,
        Environment.SANDBOX,
      ) as GasEstimateBridgeToL2Result;

      expect(result.gasFee.estimatedAmount).toEqual(BigNumber.from(280000));
    });

    it('should handle gas estimates being null', async () => {
      (createBridgeInstance as jest.Mock).mockResolvedValue({
        getFee: jest.fn().mockResolvedValue({
          feeAmount: BigNumber.from(1),
        }),
      } as unknown as TokenBridge);

      const readOnlyProvidersUndefinedFees = new Map<ChainId, ethers.providers.JsonRpcProvider>([
        [ChainId.SEPOLIA, {
          getFeeData: jest.fn().mockResolvedValue({
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            gasPrice: null,
          }),
        } as unknown as ethers.providers.JsonRpcProvider],
      ]);
      const result = await gasServiceEstimator(
        GasEstimateType.BRIDGE_TO_L2,
        readOnlyProvidersUndefinedFees,
        Environment.SANDBOX,
      ) as GasEstimateBridgeToL2Result;

      expect(result.gasFee.estimatedAmount).toBeUndefined();
    });

    it('should handle error when calling bridge', async () => {
      (createBridgeInstance as jest.Mock).mockRejectedValue({});

      const result = await gasServiceEstimator(
        GasEstimateType.BRIDGE_TO_L2,
        readOnlyProviders,
        Environment.SANDBOX,
      ) as GasEstimateBridgeToL2Result;

      expect(result).toEqual({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        gasFee: {},
        bridgeFee: {},
      });
    });
  });

  it('should throw error for invalid gasEstimateType', async () => {
    await expect(
      gasServiceEstimator(
        'INVALID' as GasEstimateType,
        readOnlyProviders,
        Environment.SANDBOX,
      ),
    ).rejects.toThrow(
      new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      ),
    );
  });
});
