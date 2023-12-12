import {
  GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType, OnRampProviderFees,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  formatFiatDecimals, getBridgeFeeEstimation, getOnRampFeeEstimation, getSwapFeeEstimation,
} from './feeEstimation';

describe('feeEstimation', () => {
  describe('getOnRampFeeEstimation', () => {
    it('should get the onramp fee estimation', () => {
      const onRampFee = {
        minPercentage: '3.5',
        maxPercentage: '5.5',
      } as OnRampProviderFees;

      expect(getOnRampFeeEstimation(onRampFee)).toEqual('3.5% to 5.5');
    });

    it('should return -.-- if no minPercentage', () => {
      const onRampFee = {
        minPercentage: undefined,
        maxPercentage: '5.5',
      } as OnRampProviderFees;

      expect(getOnRampFeeEstimation(onRampFee)).toEqual('-.--');
    });

    it('should return -.-- if no maxPercentage', () => {
      const onRampFee = {
        minPercentage: '3.5',
        maxPercentage: undefined,
      } as OnRampProviderFees;

      expect(getOnRampFeeEstimation(onRampFee)).toEqual('-.--');
    });
  });

  describe('getSwapFeeEstimation', () => {
    it('should get the swap fee estimation', () => {
      const swapFee = {
        gasEstimateType: GasEstimateType.SWAP,
        fees: {
          totalFees: BigNumber.from(100000000000000),
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      } as GasEstimateSwapResult;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getSwapFeeEstimation(swapFee, conversions)).toEqual('0.18');
    });

    it('should return -.-- if no gasFeeAmount', () => {
      const swapFee = {
        gasEstimateType: GasEstimateType.SWAP,
        fees: {
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      } as GasEstimateSwapResult;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getSwapFeeEstimation(swapFee, conversions)).toEqual('-.--');
    });

    it('should return -.-- if no gasFeeToken', () => {
      const swapFee = {
        gasEstimateType: GasEstimateType.SWAP,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
      } as GasEstimateSwapResult;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getSwapFeeEstimation(swapFee, conversions)).toEqual('-.--');
    });

    it('should return -.-- if no conversion for token available', () => {
      const swapFee = {
        gasEstimateType: GasEstimateType.SWAP,
        fees: {
          totalFees: BigNumber.from(100000000000000),
          token: {
            name: 'Immutable X',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      } as GasEstimateSwapResult;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getSwapFeeEstimation(swapFee, conversions)).toEqual('-.--');
    });
  });

  describe('getBridgeFeeEstimation', () => {
    it('should get the swap fee estimation', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('0.18');
    });

    it('should return -.-- if no gasFee', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {},
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('-.--');
    });

    it('should return -.-- if no gasFeeToken', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('-.--');
    });

    it('should return -.-- if no conversion for token', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 0]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('-.--');
    });

    // Currently bridge always returns 0
    // so we do not want to format the fee to -.-- if related to bridge fee
    it('should return fee using gas fee when bridge fee is zero', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('0.18');
    });

    it('should return fee using gas fee when bridge fee missing', () => {
      const bridgeFees = {
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        fees: {
          totalFees: BigNumber.from(100000000000000),
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      } as GasEstimateBridgeToL2Result;
      const conversions: Map<string, number> = new Map([['eth', 1800]]);

      expect(getBridgeFeeEstimation(bridgeFees, conversions)).toEqual('0.18');
    });
  });

  describe('formatFiatDecimals', () => {
    it('should return 0.00 when value is 0', () => {
      expect(formatFiatDecimals(0)).toEqual('0.00');
    });
    it('should return -.-- when value is less than 0', () => {
      expect(formatFiatDecimals(-1)).toEqual('-.--');
    });
    it('should return more than 2 decimal places when value is less than 0.01', () => {
      expect(formatFiatDecimals(0.001)).toEqual('0.001');
    });

    it('should ignore decimal places after first non-zero', () => {
      expect(formatFiatDecimals(0.0012)).toEqual('0.001');
    });

    it('should return 0.01 when value is 0.01', () => {
      expect(formatFiatDecimals(0.01)).toEqual('0.01');
    });

    it('should return 2 decimal places', () => {
      expect(formatFiatDecimals(1.234)).toEqual('1.23');
    });

    it('should return same value as input', () => {
      expect(formatFiatDecimals(1.23)).toEqual('1.23');
    });

    it('should format exponent values as 0.00', () => {
      expect(formatFiatDecimals(1.8e-7)).toEqual('0.00');
    });
  });
});
