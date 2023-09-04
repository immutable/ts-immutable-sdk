import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  Action,
  ActionType,
  ERC20Item,
  NativeItem,
  TransactionPurpose,
  constants,
} from '@imtbl/orderbook';
import {
  BuyResult,
} from '../../types/buy';
import * as instance from '../../instance';
import { CheckoutConfiguration } from '../../config';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import {
  ItemType, ItemRequirement, GasTokenType, TransactionOrGasType, GasAmount, FulfilmentTransaction, UnsignedTransactions,
} from '../../types/smartCheckout';
import { smartCheckout } from '..';
import { executeTransactions } from '../transactions/executeTransactions';

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

export const getUnsignedTransactions = async (
  actions: Action[],
): Promise<UnsignedTransactions> => {
  let approvalTransactions = [];
  let fulfilmentTransactions = [];

  const approvalPromises: Promise<TransactionRequest>[] = [];
  const fulfilmentPromises: Promise<TransactionRequest>[] = [];
  for (const action of actions) {
    if (action.type !== ActionType.TRANSACTION) continue;
    if (action.purpose === TransactionPurpose.APPROVAL) {
      approvalPromises.push(action.buildTransaction());
    }
    if (action.purpose === TransactionPurpose.FULFILL_ORDER) {
      fulfilmentPromises.push(action.buildTransaction());
    }
  }

  approvalTransactions = await Promise.all(approvalPromises);
  fulfilmentTransactions = await Promise.all(fulfilmentPromises);

  return {
    approvalTransactions,
    fulfilmentTransactions,
  };
};

export const getTransactionOrGas = (
  gasLimit: number,
  unsignedTransactions: UnsignedTransactions,
): FulfilmentTransaction | GasAmount => {
  if (unsignedTransactions.fulfilmentTransactions.length > 0) {
    return {
      type: TransactionOrGasType.TRANSACTION,
      transaction: unsignedTransactions.fulfilmentTransactions[0],
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

  let unsignedTransactions: UnsignedTransactions = {
    approvalTransactions: [],
    fulfilmentTransactions: [],
  };
  try {
    const fulfillerAddress = await provider.getSigner().getAddress();
    const { actions } = await orderbook.fulfillOrder(orderId, fulfillerAddress);
    unsignedTransactions = await getUnsignedTransactions(actions);
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
    getTransactionOrGas(gasLimit, unsignedTransactions),
  );

  if (smartCheckoutResult.sufficient && shouldExecuteTransactions) {
    await executeTransactions(provider, unsignedTransactions);
    return {
      smartCheckoutResult,
    };
  }

  return {
    smartCheckoutResult,
    transactions: unsignedTransactions,
  };
};
