import { calculateFees } from './fees';
import { BuyToken, ItemType } from '../../types';

jest.mock('../../instance');
jest.mock('../actions');

describe('orderbook fees', () => {
  describe('orderbook fees', () => {
    it('should calculate the fees as a percentage', async () => {
      const decimals = 18;
      const buyToken = {
        type: ItemType.ERC20,
        amount: '10',
        contractAddress: '0x111',
      } as BuyToken;
      const makerFee = {
        amount: { percent: 0.025 },
        recipient: '0x222',
      };

      const result = calculateFees(makerFee, buyToken, decimals);

      console.log(result);
    });
  });
});
