import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  Action, ActionType, TransactionPurpose, constants,
} from '@imtbl/orderbook';
import {
  BuyResult,
} from '../../types/buy';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  ItemType, ItemRequirement, GasTokenType, TransactionOrGasType, GasAmount, FulfilmentTransaction,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';

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

export const getUnsignedFulfilmentTransaction = async (
  actions: Action[],
): Promise<TransactionRequest | undefined> => {
  for (const action of actions) {
    if (action.type === ActionType.TRANSACTION && action.purpose === TransactionPurpose.FULFILL_ORDER) {
      // eslint-disable-next-line no-await-in-loop
      return await action.buildTransaction();
    }
  }
  return undefined;
};

export const getTransactionOrGas = (
  gasLimit: number,
  transaction: TransactionRequest | undefined,
): FulfilmentTransaction | GasAmount => {
  if (transaction) {
    return {
      type: TransactionOrGasType.TRANSACTION,
      transaction,
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

  let unsignedTransaction;
  try {
    const fulfillerAddress = await provider.getSigner().getAddress();
    const { actions } = await orderbook.fulfillOrder(orderId, fulfillerAddress);
    unsignedTransaction = await getUnsignedFulfilmentTransaction(actions);
  } catch { /* Use the gas limit when the fulfil order request errors */ }

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

  buyArray.forEach((item: any) => {
    if (item.item_type !== ItemType.ERC721) {
      amount = amount.add(BigNumber.from(item.start_amount));
    }
  });

  const feeArray = order.result.fees;
  feeArray.forEach((item: any) => {
    amount = amount.add(BigNumber.from(item.amount));
  });

  const itemRequirements = [
    getItemRequirement(type, contractAddress, amount, spenderAddress),
  ];

  await smartCheckout(
    provider,
    itemRequirements,
    getTransactionOrGas(gasLimit, unsignedTransaction),
  );

  return {
    itemRequirements,
    gasToken: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(gasLimit),
    },
  };
};
