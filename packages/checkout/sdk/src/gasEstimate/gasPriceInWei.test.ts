import { BigNumber } from 'ethers';
import { getGasPriceInWei } from './gasPriceInWei';

describe('gasPriceInWei', () => {
  it('should return gas price in wei using maxFeePerGas and maxPriorityFeePerGas', () => {
    const fee = getGasPriceInWei({
      lastBaseFeePerGas: null,
      maxFeePerGas: BigNumber.from(1),
      maxPriorityFeePerGas: BigNumber.from(1),
      gasPrice: BigNumber.from(1),
    });
    expect(fee).toEqual(BigNumber.from(2));
  });

  it('should return gas price in wei using gasPrice', () => {
    const fee = getGasPriceInWei({
      lastBaseFeePerGas: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: BigNumber.from(1),
    });
    expect(fee).toEqual(BigNumber.from(1));
  });

  it('should return gas price in wei when maxFeePerGas missing', () => {
    const fee = getGasPriceInWei({
      lastBaseFeePerGas: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: BigNumber.from(2),
      gasPrice: BigNumber.from(1),
    });
    expect(fee).toEqual(BigNumber.from(1));
  });

  it('should return gas price in wei when maxPriorityFeePerGas missing', () => {
    const fee = getGasPriceInWei({
      lastBaseFeePerGas: null,
      maxFeePerGas: BigNumber.from(2),
      maxPriorityFeePerGas: null,
      gasPrice: BigNumber.from(1),
    });
    expect(fee).toEqual(BigNumber.from(1));
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
