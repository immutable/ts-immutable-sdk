import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  BuyResult,
} from '../types/buy';
import * as instance from '../instance';
import { CheckoutConfiguration } from '../config';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ItemType, ItemRequirement, GasTokenType } from '../types/smartCheckout';

export const GAS_LIMIT = 300000;
export const SEAPORT_CONTRACT_ADDRESS = '0x474989C4D25DD41B0B9b1ECb4643B9Fe25f83B19';

export const getItemRequirement = (
  type: ItemType,
  contractAddress: string,
  amount: BigNumber,
): ItemRequirement => {
  switch (type) {
    case ItemType.ERC20:
      return {
        type,
        amount,
        contractAddress,
        spenderAddress: SEAPORT_CONTRACT_ADDRESS,
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
): Promise<BuyResult> => {
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
    if (item.item_type !== ItemType.ERC721) {
      amount = amount.add(BigNumber.from(item.start_amount));
    }
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => { // If the buy array contains one ERC721 what will the fee token be in?
    amount = amount.add(BigNumber.from(item.amount));
  });

  const itemRequirements: ItemRequirement[] = [
    getItemRequirement(type, contractAddress, amount),
  ];

  return {
    itemRequirements,
    gasToken: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(GAS_LIMIT),
    },
  };
};
