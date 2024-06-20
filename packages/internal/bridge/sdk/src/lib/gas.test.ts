import { BigNumber } from 'ethers';
import { calculateGasFee, getGasPriceInWei } from './gas';

describe('gas', () => {
  describe('gasPriceInWei', () => {
    it('should return gas price in wei using lastBaseFeePerGas and maxPriorityFeePerGas', () => {
      const fee = getGasPriceInWei({
        lastBaseFeePerGas: BigNumber.from(1),
        maxFeePerGas: BigNumber.from(22),
        maxPriorityFeePerGas: BigNumber.from(2),
        gasPrice: BigNumber.from(11),
      });
      expect(fee).toEqual(BigNumber.from(3));
    });

    it('should return gas price in wei using gasPrice', () => {
      const fee = getGasPriceInWei({
        lastBaseFeePerGas: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: BigNumber.from(11),
      });
      expect(fee).toEqual(BigNumber.from(11));
    });

    it('should return gas price in wei when lastBaseFeePerGas missing', () => {
      const fee = getGasPriceInWei({
        lastBaseFeePerGas: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: BigNumber.from(2),
        gasPrice: BigNumber.from(11),
      });
      expect(fee).toEqual(BigNumber.from(11));
    });

    it('should return gas price in wei when maxPriorityFeePerGas missing', () => {
      const fee = getGasPriceInWei({
        lastBaseFeePerGas: BigNumber.from(2),
        maxFeePerGas: BigNumber.from(22),
        maxPriorityFeePerGas: null,
        gasPrice: BigNumber.from(11),
      });
      expect(fee).toEqual(BigNumber.from(11));
    });

    it('should return undefined if missing gas fields', () => {
      const fee = getGasPriceInWei({
        lastBaseFeePerGas: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: null,
      });
      expect(fee).toBeNull();
    });
  });

  describe('calculateGasFee', () => {
    it('should return gas fee in wei', () => {
      const fee = calculateGasFee({
        lastBaseFeePerGas: BigNumber.from(2),
        maxFeePerGas: BigNumber.from(22),
        maxPriorityFeePerGas: BigNumber.from(2),
        gasPrice: BigNumber.from(11),
      }, 100);
      // (2 + 2) * 100 = 400
      expect(fee.toString()).toEqual('400');
    });

    it('uses gasPrice when 1559 data is not valid', () => {
      const fee = calculateGasFee({
        lastBaseFeePerGas: null,
        maxFeePerGas: BigNumber.from(22),
        maxPriorityFeePerGas: BigNumber.from(2),
        gasPrice: BigNumber.from(11),
      }, 100);
      // (11) * 100 = 400
      expect(fee.toString()).toEqual('1100');
    });

    it('returns 0 when input is null', () => {
      const fee = calculateGasFee({
        lastBaseFeePerGas: null,
        maxFeePerGas: BigNumber.from(22),
        maxPriorityFeePerGas: null,
        gasPrice: null,
      }, 100);
      expect(fee.toString()).toEqual('0');
    });
  });
});
