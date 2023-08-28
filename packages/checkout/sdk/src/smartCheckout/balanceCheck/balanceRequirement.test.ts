import { BigNumber } from 'ethers';
import { ERC20Item, ItemBalance, ItemType } from '../../types';
import { getTokenBalanceRequirement } from './balanceRequirement';

describe('balanceRequirement', () => {
  describe('getTokensFromRequirements', () => {
    it('should..', () => {

    });
  });

  describe('getERC721BalanceRequirement', () => {
    it('should..', () => {

    });
  });

  describe('getTokenBalanceRequirement', () => {
    it('should..', () => {
      const itemRequirement: ERC20Item = {
        type: ItemType.ERC20,
        contractAddress: '0xERC20',
        amount: BigNumber.from(100000000),
        spenderAddress: '0xSEAPORT',
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.ERC20,
          balance: BigNumber.from(100000000),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const result = getTokenBalanceRequirement(itemRequirement, balances);
      console.log(result);
      // expect(result).toEqual({
      //   sufficient: true,
      //   type: ItemType.ERC20,
      //   delta: {
      //     balance: BigNumber.from(0),
      //     formattedBalance: '0',
      //   },
      //   required: {
      //     type: ItemType.ERC20,
      //     balance: BigNumber.from(100000),
      //     formattedBalance: '1',
      //     token: {
      //       name: 'ERC20',
      //       symbol: 'ERC20',
      //       decimals: 18,
      //       address: '0xERC20',
      //     },
      //   },
      //   current: {
      //     type: ItemType.ERC20,
      //     balance: BigNumber.from(100000),
      //     formattedBalance: '1',
      //     token: {
      //       name: 'ERC20',
      //       symbol: 'ERC20',
      //       decimals: 18,
      //       address: '0xERC20',
      //     },
      //   },
      // });
    });
  });
});
