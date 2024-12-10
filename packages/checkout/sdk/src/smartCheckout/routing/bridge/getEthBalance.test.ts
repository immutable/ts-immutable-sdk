import { TokenBalanceResult } from '../types';
import { getEthBalance } from './getEthBalance';

describe('getEthBalance', () => {
  it('should return the balance when the token address is empty', () => {
    const balances: TokenBalanceResult = {
      success: true,
      balances: [
        {
          token: {
            address: '', name: 'ETH', symbol: 'ETH', decimals: 18,
          },
          balance: BigInt(100),
          formattedBalance: '100',
        },
        {
          token: {
            address: '0x123', name: 'IMX', symbol: 'IMX', decimals: 18,
          },
          balance: BigInt(200),
          formattedBalance: '200',
        },
      ],
    };
    const result = getEthBalance(balances);
    expect(result).toEqual(BigInt(100));
  });

  it('should return the balance when the token address is undefined', () => {
    const balances: TokenBalanceResult = {
      success: true,
      balances: [
        {
          token: {
            name: 'ETH', symbol: 'ETH', decimals: 18,
          },
          balance: BigInt(100),
          formattedBalance: '100',
        },
        {
          token: {
            address: '0x123', name: 'IMX', symbol: 'IMX', decimals: 18,
          },
          balance: BigInt(200),
          formattedBalance: '200',
        },
      ],
    };
    const result = getEthBalance(balances);
    expect(result).toEqual(BigInt(100));
  });

  it('should return 0 when no balance with empty token address is found', () => {
    const balances: TokenBalanceResult = {
      success: true,
      balances: [
        {
          token: {
            address: '0x123', name: 'IMX', symbol: 'IMX', decimals: 0,
          },
          balance: BigInt(200),
          formattedBalance: '200',
        },
        {
          token: {
            address: '0x456', name: 'GODS', symbol: 'GODS', decimals: 0,
          },
          balance: BigInt(300),
          formattedBalance: '300',
        },
      ],
    };
    const result = getEthBalance(balances);
    expect(result).toEqual(BigInt(0));
  });

  it('should return 0 when the balances array is empty', () => {
    const balances: TokenBalanceResult = {
      success: true,
      balances: [],
    };
    const result = getEthBalance(balances);
    expect(result).toEqual(BigInt(0));
  });
});
