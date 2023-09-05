import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  ERC20Item,
  NativeItem,
  constants,
} from '@imtbl/orderbook';
import {
  BuyResult,
} from '../../types/buy';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  ItemType, ItemRequirement, GasTokenType, TransactionOrGasType, GasAmount, FulfilmentTransaction, UnsignedActions,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import { executeTransactions, getUnsignedActions } from '../actions';

export const getItemRequirement = (
  type: ItemType,
  contractAddress: string,
  amount: BigNumber,
  spenderAddress: string,
): ItemRequirement => {
  switch (type) {
    case ItemType.ERC20:
      return {
        type,
        amount,
        contractAddress,
        spenderAddress,
      };
    case ItemType.NATIVE:
    default:
      return {
        type: ItemType.NATIVE,
        amount,
      };
  }
};

export const getTransactionOrGas = (
  gasLimit: number,
  unsignedActions: UnsignedActions,
): FulfilmentTransaction | GasAmount => {
  if (unsignedActions.fulfilmentTransactions.length > 0) {
    return {
      type: TransactionOrGasType.TRANSACTION,
      transaction: unsignedActions.fulfilmentTransactions[0],
    };
  }

  return {
    type: TransactionOrGasType.GAS,
    gasToken: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(gasLimit),
    },
  };
};

export const buy = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  orderId: string,
  shouldExecuteTransactions?: boolean,
): Promise<BuyResult> => {
  let orderbook;
  let order;
  let spenderAddress = '';
  const gasLimit = constants.estimatedFulfillmentGasGwei;

  try {
    orderbook = await instance.createOrderbookInstance(config);
    order = await orderbook.getListing(orderId);
    const { seaportContractAddress } = orderbook.config();
    spenderAddress = seaportContractAddress;
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

  let unsignedActions: UnsignedActions = {
    approvalTransactions: [],
    fulfilmentTransactions: [],
    signableMessages: [],
  };
  try {
    const fulfillerAddress = await provider.getSigner().getAddress();
    const { actions } = await orderbook.fulfillOrder(orderId, fulfillerAddress);
    unsignedActions = await getUnsignedActions(actions);
  } catch {
    // Error usually thrown when fulfiller does not have enough balance to fulfil the order
    // Silently catch & continue to run smart checkout to return the diffs
  }

  let amount = BigNumber.from('0');
  let type: ItemType = ItemType.NATIVE;
  let contractAddress = '';

  const buyArray = order.result.buy;
  if (buyArray.length > 0) {
    switch (buyArray[0].type) {
      case 'NATIVE':
        type = ItemType.NATIVE;
        break;
      case 'ERC20':
        type = ItemType.ERC20;
        contractAddress = buyArray[0].contractAddress;
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

  buyArray.forEach((item: (ERC20Item | NativeItem)) => {
    if (item.type !== ItemType.ERC721 as string) {
      amount = amount.add(BigNumber.from(item.amount));
    }
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => {
    amount = amount.add(BigNumber.from(item.amount));
  });

  const itemRequirements = [
    getItemRequirement(type, contractAddress, amount, spenderAddress),
  ];

  const smartCheckoutResult = await smartCheckout(
    config,
    provider,
    itemRequirements,
    getTransactionOrGas(gasLimit, unsignedActions),
  );

  if (smartCheckoutResult.sufficient && shouldExecuteTransactions) {
    await executeTransactions(provider, unsignedActions);
    return {
      smartCheckoutResult,
    };
  }

  if (smartCheckoutResult.sufficient) {
    return {
      smartCheckoutResult,
      unsignedActions,
    };
  }

  return {
    smartCheckoutResult,
  };
};
