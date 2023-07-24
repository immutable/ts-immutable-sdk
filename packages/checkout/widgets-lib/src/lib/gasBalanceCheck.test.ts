import { BigNumber } from 'ethers';
import { hasZeroBalance } from './gasBalanceCheck';

describe('gasBalanceCheck', () => {
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
});
