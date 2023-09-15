import { calculateFees } from './fees';
import { BuyToken, ItemType } from '../../types';

jest.mock('../../instance');
jest.mock('../actions');

describe('orderbook fees', () => {
  describe('orderbook fees', () => {
    it('should calculate the fees as a percentageDecimal', async () => {
      const decimals = 18;
      const buyToken = {
        type: ItemType.ERC20,
        amount: '10',
        contractAddress: '0x111',
      } as BuyToken;
      const makerFees = [{
        amount: { percentageDecimal: 0.025 },
        recipient: '0x222',
      }];

      const result = calculateFees(makerFees, buyToken, decimals);

      expect(result).toEqual([{
        amount: '250000000000000000',
        recipient: '0x222',
      }]);
    });
  });
});
