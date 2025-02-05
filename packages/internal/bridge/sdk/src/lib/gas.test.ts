import { calculateGasFee, getGasPriceInWei } from './gas';

describe('gas', () => {
  describe('gasPriceInWei', () => {
    it('should return gas price in wei using lastBaseFeePerGas and maxPriorityFeePerGas', () => {
      const fee = getGasPriceInWei({
        maxFeePerGas: BigInt(22),
        maxPriorityFeePerGas: BigInt(2),
        gasPrice: BigInt(11),
        toJSON: jest.fn(),
      });
      expect(fee).toEqual(BigInt(12));
    });

    it('should return gas price in wei using gasPrice', () => {
      const fee = getGasPriceInWei({
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: BigInt(11),
        toJSON: jest.fn(),
      });
      expect(fee).toEqual(BigInt(11));
    });

    it('should return gas price in wei when lastBaseFeePerGas missing', () => {
      const fee = getGasPriceInWei({
        maxFeePerGas: null,
        maxPriorityFeePerGas: BigInt(2),
        gasPrice: BigInt(11),
        toJSON: jest.fn(),
      });
      expect(fee).toEqual(BigInt(11));
    });

    it('should return gas price in wei when maxPriorityFeePerGas missing', () => {
      const fee = getGasPriceInWei({
        maxFeePerGas: BigInt(22),
        maxPriorityFeePerGas: null,
        gasPrice: BigInt(11),
        toJSON: jest.fn(),
      });
      expect(fee).toEqual(BigInt(11));
    });

    it('should return undefined if missing gas fields', () => {
      const fee = getGasPriceInWei({
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        gasPrice: null,
        toJSON: jest.fn(),
      });
      expect(fee).toBeNull();
    });
  });

  describe('calculateGasFee', () => {
    it('should return gas fee in wei', () => {
      const fee = calculateGasFee({
        maxFeePerGas: BigInt(22),
        maxPriorityFeePerGas: BigInt(2),
        gasPrice: BigInt(11),
        toJSON: jest.fn(),
      }, 100);
      // (22 - 2)/2 + 2 * 100 = 1200
      expect(fee.toString()).toEqual('1200');
    });

    it('returns 0 when input is null', () => {
      const fee = calculateGasFee({
        maxFeePerGas: BigInt(22),
        maxPriorityFeePerGas: null,
        gasPrice: null,
        toJSON: jest.fn(),
      }, 100);
      expect(fee.toString()).toEqual('0');
    });
  });
});
