import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  BuyItem, BuyResponse, GasTokenType, ItemType,
} from '../types/buy';
import * as instance from '../instance';
import { CheckoutConfiguration } from '../config';
import { CheckoutError, CheckoutErrorType } from '../errors';

export const GAS_LIMIT = 300000;
export const SEAPORT_CONTRACT_ADDRESS = '0x474989C4D25DD41B0B9b1ECb4643B9Fe25f83B19';

export const getBuyItem = (type: ItemType, amount: BigNumber, contractAddress: string): BuyItem => {
  switch (type) {
    case ItemType.ERC20:
    case ItemType.ERC721:
      return {
        type,
        amount,
        contractAddress,
        approvalContractAddress: SEAPORT_CONTRACT_ADDRESS,
      };
    case ItemType.NATIVE:
    default:
      return {
        type: ItemType.NATIVE,
        amount,
      };
  }
};

export const buy = async (
  config: CheckoutConfiguration,
  provider: Web3Provider, // will be used by smart checkout
  orderId: string,
): Promise<BuyResponse> => {
  let order;
  try {
    const orderbook = await instance.createOrderbookInstance(config);
    order = await orderbook.getListing(orderId);
  } catch (err: any) {
    throw new CheckoutError(
      'An error occurred while getting the order listing',
      CheckoutErrorType.GET_ORDER_LISTING_ERROR,
      {
        orderId,
        message: err.message,
      },
    );
  }

  let amount = BigNumber.from('0');
  let type: ItemType = ItemType.NATIVE;
  let contractAddress = '';

  const buyArray = order.result.buy;
  if (buyArray.length > 0) {
    switch (buyArray[0].item_type) {
      case 'NATIVE':
        type = ItemType.NATIVE;
        break;
      case 'ERC20':
        type = ItemType.ERC20;
        contractAddress = buyArray[0].contract_address;
        break;
      case 'ERC721':
        type = ItemType.ERC721;
        contractAddress = buyArray[0].contract_address;
        break;
      default:
        throw new CheckoutError(
          'Purchasing token type is unsupported',
          CheckoutErrorType.UNSUPPORTED_TOKEN_TYPE_ERROR,
          {
            orderId,
          },
        );
    }
  }

  buyArray.forEach((item: any) => {
    amount = amount.add(BigNumber.from(item.start_amount));
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => {
    amount = amount.add(BigNumber.from(item.amount));
  });

  const requirements: BuyItem[] = [
    getBuyItem(type, amount, contractAddress),
  ];

  return {
    requirements,
    gas: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(GAS_LIMIT),
    },
  };
};
