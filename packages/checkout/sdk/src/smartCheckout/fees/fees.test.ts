import { calculateFees } from './fees';
import { BuyToken, ItemType } from '../../types';
import { CheckoutErrorType } from '../../errors';
import { parseUnits } from 'ethers';

jest.mock('../../instance');
jest.mock('../actions');

describe('orderbook fees', () => {
  it('should calculate the fees as a percentageDecimal', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.025 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '250000000000000000',
      recipientAddress: '0x222',
    }]);
  });

  it('should return empty array when fee is zero', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([]);
  });

  it('should return empty array when fee is smaller than 6 decimal places', async () => {
    const decimals = 6;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.0000001 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([]);
  });

  it('should return the fee when the amount and fee is small', async () => {
    const decimals = 18;
    const amount = parseUnits('0.000001', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.000001 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '1000000',
      recipientAddress: '0x222',
    }]);
  });

  it('should return empty array when the amount and fee are small enough to go below 1 wei', async () => {
    const decimals = 18;
    const amount = parseUnits('0.0000000000001', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.000001 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([]);
  });

  it('should work when the amount is a decimal', async () => {
    const decimals = 18;
    const amount = parseUnits('0.5', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.025 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '12500000000000000',
      recipientAddress: '0x222',
    }]);
  });

  it('TD-1453 sell token quantity > 1 and non divisible fee amount', async () => {
    const decimals = 18;
    const amount = parseUnits('40.32258064516129033', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.01 },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals, BigInt(10));

    expect(result).toEqual([{
      amount: '403225806451612900',
      recipientAddress: '0x222',
    }]);
  });

  it('should calculate the fees with multiple percentageDecimals', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.025 },
      recipient: '0x222',
    }, {
      amount: { percentageDecimal: 0.05 },
      recipient: '0x333',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '250000000000000000',
      recipientAddress: '0x222',
    }, {
      amount: '500000000000000000',
      recipientAddress: '0x333',
    }]);
  });

  it('should calculate the fees with multiple percentageDecimals that add to the max fee amount', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.7 },
      recipient: '0x222',
    }, {
      amount: { percentageDecimal: 0.3 },
      recipient: '0x333',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '7000000000000000000',
      recipientAddress: '0x222',
    }, {
      amount: '3000000000000000000',
      recipientAddress: '0x333',
    }]);
  });

  it('should fail to calculate the fees as a percentageDecimal because the fee is too high', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 1.000001 },
      recipient: '0x222',
    }];

    let message;
    let type;
    let result;

    try {
      result = calculateFees(makerFees, amount, decimals);
    } catch (err: any) {
      message = err.message;
      type = err.type;
    }
    expect(message).toEqual('The combined fees are above the allowed maximum of 100%');
    expect(type).toEqual(CheckoutErrorType.ORDER_FEE_ERROR);
    expect(result).toBeUndefined();
  });

  it('should calculate the fees as a token amount', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { token: '1' },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '1000000000000000000',
      recipientAddress: '0x222',
    }]);
  });

  it('should work when the amount is a decimal', async () => {
    const decimals = 18;
    const amount = parseUnits('0.5', 18).toString();
    const makerFees = [{
      amount: { token: '0.1' },
      recipient: '0x222',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '100000000000000000',
      recipientAddress: '0x222',
    }]);
  });

  it('should calculate the fees with multiple token amounts', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { token: '1' },
      recipient: '0x222',
    }, {
      amount: { token: '0.5' },
      recipient: '0x333',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '1000000000000000000',
      recipientAddress: '0x222',
    }, {
      amount: '500000000000000000',
      recipientAddress: '0x333',
    }]);
  });

  it('should fail to calculate the fees as a token value because the fee is too high', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { token: '11' },
      recipient: '0x222',
    }];

    let message;
    let type;
    let result;

    try {
      result = calculateFees(makerFees, amount, decimals);
    } catch (err: any) {
      message = err.message;
      type = err.type;
    }
    expect(message).toEqual('The combined fees are above the allowed maximum of 100%');
    expect(type).toEqual(CheckoutErrorType.ORDER_FEE_ERROR);
    expect(result).toBeUndefined();
  });

  it('should calculate the fees with a combination of percentageDecimals and token amounts', async () => {
    const decimals = 18;
    const amount = parseUnits('10', 18).toString();
    const makerFees = [{
      amount: { percentageDecimal: 0.025 },
      recipient: '0x222',
    }, {
      amount: { token: '0.5' },
      recipient: '0x333',
    }];

    const result = calculateFees(makerFees, amount, decimals);

    expect(result).toEqual([{
      amount: '250000000000000000',
      recipientAddress: '0x222',
    }, {
      amount: '500000000000000000',
      recipientAddress: '0x333',
    }]);
  });

  it('should calculate the fees with a combination of percentageDecimals and token amounts', async () => {
    const decimals = 18;
    const amount = {
      type: ItemType.ERC20,
      amount: '10',
      tokenAddress: '0x111',
    } as BuyToken;
    const makerFees = [{
      amount: { percentageDecimal: 0.025 },
      recipient: '0x222',
    }, {
      amount: { token: '10' },
      recipient: '0x333',
    }];

    let message;
    let type;
    let result;

    try {
      result = calculateFees(makerFees, amount.amount, decimals);
    } catch (err: any) {
      message = err.message;
      type = err.type;
    }
    expect(message).toEqual('The combined fees are above the allowed maximum of 100%');
    expect(type).toEqual(CheckoutErrorType.ORDER_FEE_ERROR);
    expect(result).toBeUndefined();
  });
});
