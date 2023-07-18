import { BigNumber } from 'ethers';
import { hasEnoughBalanceForGas, hasZeroBalance } from './gasBalanceChecks';

describe('gasBalanceChecks', () => {
  describe('hasZeroBalance', () => {
    it('should return true if there are no tokens', () => {
      expect(hasZeroBalance([], 'IMX')).toBeTruthy();
    });

    it('should return true if imx balance is 0', () => {
      expect(hasZeroBalance([
        {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
          },
          balance: BigNumber.from('0'),
          formattedBalance: '0',
        },
      ], 'IMX')).toBeTruthy();
    });

    it('should return false if imx balance greater than 0', () => {
      expect(hasZeroBalance([
        {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
          },
          balance: BigNumber.from('1'),
          formattedBalance: '1',
        },
      ], 'IMX')).toBeFalsy();
    });
  });

  describe('hasEnoughBalanceForGas', () => {
    it('should return false if token balances length is 0', () => {
      expect(hasEnoughBalanceForGas([], BigNumber.from('2'), 'IMX')).toBeFalsy();
    });

    it('should return false if gas fee greater than imx balance', () => {
      expect(hasEnoughBalanceForGas([
        {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
          },
          balance: BigNumber.from('1'),
          formattedBalance: '1',
        },
      ], BigNumber.from('2'), 'IMX')).toBeFalsy();
    });

    it('should return true if gas fee less than imx balance', () => {
      expect(hasEnoughBalanceForGas([
        {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
          },
          balance: BigNumber.from('2'),
          formattedBalance: '2',
        },
      ], BigNumber.from('1'), 'IMX')).toBeTruthy();
    });
  });
});
