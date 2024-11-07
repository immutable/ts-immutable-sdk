import { getGasPriceInWei } from './gasPriceInWei';

describe('gasPriceInWei', () => {
  it('should return gas price in wei using lastBaseFeePerGas and maxPriorityFeePerGas', () => {
    const fee = getGasPriceInWei({
      maxFeePerGas: BigInt(22),
      maxPriorityFeePerGas: BigInt(2),
      gasPrice: BigInt(11),
      toJSON: () => ({ }),
    });
    expect(fee).toEqual(BigInt(3));
  });

  it('should return gas price in wei using gasPrice', () => {
    const fee = getGasPriceInWei({
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: BigInt(11),
      toJSON: () => ({ }),
    });
    expect(fee).toEqual(BigInt(11));
  });

  it('should return gas price in wei when lastBaseFeePerGas missing', () => {
    const fee = getGasPriceInWei({
      maxFeePerGas: null,
      maxPriorityFeePerGas: BigInt(2),
      gasPrice: BigInt(11),
      toJSON: () => ({ }),
    });
    expect(fee).toEqual(BigInt(11));
  });

  it('should return gas price in wei when maxPriorityFeePerGas missing', () => {
    const fee = getGasPriceInWei({
      maxFeePerGas: BigInt(22),
      maxPriorityFeePerGas: null,
      gasPrice: BigInt(11),
      toJSON: () => ({ }),
    });
    expect(fee).toEqual(BigInt(11));
  });

  it('should return undefined if missing gas fields', () => {
    const fee = getGasPriceInWei({
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
      toJSON: () => ({ }),
    });
    expect(fee).toBeNull();
  });
});
