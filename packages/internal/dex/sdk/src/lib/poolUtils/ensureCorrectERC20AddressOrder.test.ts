import { IMX_TEST_TOKEN, WETH_TEST_TOKEN } from 'utils/testUtils';
import { ensureCorrectERC20AddressOrder } from './computePoolAddress';
import { ERC20Pair } from './generateERC20Pairs';

describe('ensureCorrectERC20AddressOrder', () => {
  describe('given a pair that is not ordered', () => {
    it('orders the pair correctly', () => {
      const unorderedERC20Pair: ERC20Pair = [IMX_TEST_TOKEN, WETH_TEST_TOKEN];
      const orderedERC20Pair = ensureCorrectERC20AddressOrder(unorderedERC20Pair);

      expect(orderedERC20Pair[0].address).toEqual(WETH_TEST_TOKEN.address);
      expect(orderedERC20Pair[1].address).toEqual(IMX_TEST_TOKEN.address);
    });
  });
});
