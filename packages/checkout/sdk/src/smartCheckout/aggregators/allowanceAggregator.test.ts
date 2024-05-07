import { BigNumber } from 'ethers';
import { ItemType } from '../../types';
import { ItemAllowance } from '../allowance/types';
import { allowanceAggregator } from './allowanceAggregator';

describe('allowanceAggregator', () => {
  it('should return an array with the insufficient ERC20 allowance', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: false,
      allowances: [
        {
          sufficient: false,
          type: ItemType.ERC20,
          delta: BigNumber.from(1),
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20_1',
            amount: BigNumber.from(1),
            spenderAddress: '0xSEAPORT',
          },
          approvalTransaction: undefined,
        },
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20_2',
            amount: BigNumber.from(1),
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const erc721Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [{
        sufficient: true,
        itemRequirement: {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '0xID',
          spenderAddress: '0xSEAPORT',
        },
      }],
    };
    const erc1155Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual([{
      sufficient: false,
      type: ItemType.ERC20,
      delta: BigNumber.from(1),
      itemRequirement: {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20_1',
        amount: BigNumber.from(1),
        spenderAddress: '0xSEAPORT',
      },
      approvalTransaction: undefined,
    }]);
  });

  it('should return an array with the insufficient ERC721 allowance', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [{
        sufficient: true,
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigNumber.from(1),
          spenderAddress: '0xSEAPORT',
        },
      }],
    };
    const erc721Allowances: ItemAllowance = {
      sufficient: false,
      allowances: [
        {
          sufficient: false,
          type: ItemType.ERC721,
          itemRequirement: {
            type: ItemType.ERC721,
            contractAddress: '0xERC721',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
          approvalTransaction: undefined,
        },
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC721,
            contractAddress: '0xERC721',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const erc1155Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual([{
      sufficient: false,
      type: ItemType.ERC721,
      itemRequirement: {
        type: ItemType.ERC721,
        contractAddress: '0xERC721',
        id: '0xID',
        spenderAddress: '0xSEAPORT',
      },
      approvalTransaction: undefined,
    }]);
  });

  it('should return an array with both allowances if they are not sufficient', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: false,
      allowances: [{
        sufficient: false,
        type: ItemType.ERC20,
        delta: BigNumber.from(1),
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigNumber.from(1),
          spenderAddress: '0xSEAPORT',
        },
        approvalTransaction: undefined,
      }],
    };
    const erc721Allowances: ItemAllowance = {
      sufficient: false,
      allowances: [{
        sufficient: false,
        type: ItemType.ERC721,
        itemRequirement: {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '0xID',
          spenderAddress: '0xSEAPORT',
        },
        approvalTransaction: undefined,
      }],
    };
    const erc1155Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual(expect.arrayContaining([
      {
        sufficient: false,
        type: ItemType.ERC20,
        delta: BigNumber.from(1),
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigNumber.from(1),
          spenderAddress: '0xSEAPORT',
        },
        approvalTransaction: undefined,
      },
      {
        sufficient: false,
        type: ItemType.ERC721,
        itemRequirement: {
          type: ItemType.ERC721,
          contractAddress: '0xERC721',
          id: '0xID',
          spenderAddress: '0xSEAPORT',
        },
        approvalTransaction: undefined,
      },
    ]));
  });

  it('should return an empty array if both allowances are sufficient', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20',
            amount: BigNumber.from(1),
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const erc721Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC721,
            contractAddress: '0xERC721',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const erc1155Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual([]);
  });
});
