import { BigNumber } from 'ethers';
import { getGasPriceInWei } from './gasPriceInWei';

describe('gasPriceInWei', () => {
  it('should return gas price in wei using maxFeePerGas and maxPriorityFeePerGas', () => {
    const fee = getGasPriceInWei({
      lastBaseFeePerGas: BigNumber.from(1),
      maxFeePerGas: null,
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

  it('should return gas price in wei when maxFeePerGas missing', () => {
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
      maxFeePerGas: null,
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
