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
          delta: BigInt(1),
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20_1',
            amount: BigInt(1),
            spenderAddress: '0xSEAPORT',
            isFee: false,
          },
          approvalTransaction: undefined,
        },
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20_2',
            amount: BigInt(1),
            spenderAddress: '0xSEAPORT',
            isFee: false,
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
      delta: BigInt(1),
      itemRequirement: {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20_1',
        amount: BigInt(1),
        spenderAddress: '0xSEAPORT',
        isFee: false,
      },
      approvalTransaction: undefined,
    }]);
  });

  it('should return an array with the insufficient ERC1155 allowance', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [{
        sufficient: true,
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(1),
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      }],
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
      sufficient: false,
      allowances: [
        {
          sufficient: false,
          approvalTransaction: undefined,
          type: ItemType.ERC1155,
          itemRequirement: {
            amount: BigInt(10),
            type: ItemType.ERC1155,
            contractAddress: '0xERC1155',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual([{
      sufficient: false,
      type: ItemType.ERC1155,
      itemRequirement: {
        amount: BigInt(10),
        type: ItemType.ERC1155,
        contractAddress: '0xERC1155',
        id: '0xID',
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
          amount: BigInt(1),
          spenderAddress: '0xSEAPORT',
          isFee: false,
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

  it('should return an array with all allowances if they are not sufficient', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: false,
      allowances: [{
        sufficient: false,
        type: ItemType.ERC20,
        delta: BigInt(1),
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(1),
          spenderAddress: '0xSEAPORT',
          isFee: false,
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
      sufficient: false,
      allowances: [
        {
          sufficient: false,
          approvalTransaction: undefined,
          type: ItemType.ERC1155,
          itemRequirement: {
            amount: BigInt(10),
            type: ItemType.ERC1155,
            contractAddress: '0xERC1155',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual(expect.arrayContaining([
      {
        sufficient: false,
        type: ItemType.ERC20,
        delta: BigInt(1),
        itemRequirement: {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(1),
          spenderAddress: '0xSEAPORT',
          isFee: false,
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
      {
        sufficient: false,
        type: ItemType.ERC1155,
        itemRequirement: {
          amount: BigInt(10),
          type: ItemType.ERC1155,
          contractAddress: '0xERC1155',
          id: '0xID',
          spenderAddress: '0xSEAPORT',
        },
        approvalTransaction: undefined,
      },
    ]));
  });

  it('should return an empty array if all allowances are sufficient', () => {
    const erc20Allowances: ItemAllowance = {
      sufficient: true,
      allowances: [
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC20,
            tokenAddress: '0xERC20',
            amount: BigInt(1),
            spenderAddress: '0xSEAPORT',
            isFee: false,
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
      allowances: [
        {
          sufficient: true,
          itemRequirement: {
            type: ItemType.ERC1155,
            amount: BigInt(5),
            contractAddress: '0xERC1155',
            id: '0xID',
            spenderAddress: '0xSEAPORT',
          },
        },
      ],
    };
    const result = allowanceAggregator(erc20Allowances, erc721Allowances, erc1155Allowances);
    expect(result).toEqual([]);
  });
});
