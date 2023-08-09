import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { Orderbook } from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import {
  BuyItem, BuyResponse, GasTokenType, ItemType,
} from '../types/buy';

const GAS_LIMIT = 300000;

// helper function to know EIP1559 support
// const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

// // helper function to know how to calculate the gasPrice from the fee data
// const getGasPriceInWei = (feeData: FeeData): BigNumber | null => {
//   if (doesChainSupportEIP1559(feeData)) {
//     return BigNumber.from(feeData.maxFeePerGas).add(
//       BigNumber.from(feeData.maxPriorityFeePerGas),
//     );
//   }
//   if (feeData.gasPrice) return BigNumber.from(feeData.gasPrice);
//   return null;
// };

const getBuyItem = (type: ItemType, amount: BigNumber, contractAddress?: string): BuyItem => {
  switch (type) {
    case ItemType.ERC20:
    case ItemType.ERC721:
      return {
        type,
        amount,
        contractAddress: contractAddress!,
      };
    case ItemType.NATIVE:
    default:
      return {
        type,
        amount,
      };
  }
};

export const buy = async (provider: Web3Provider, orderId: string): Promise<BuyResponse> => {
  const orderbook = new Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
  });

  const order = await orderbook.getListing(orderId);
  console.log('order', order);

  const buyerAddress = await provider.getSigner().getAddress();

  const {
    unsignedApprovalTransaction,
    unsignedFulfillmentTransaction,
  } = await orderbook.fulfillOrder(orderId, buyerAddress);
  console.log('unsigned transactions', unsignedApprovalTransaction, unsignedFulfillmentTransaction);

  let amount = BigNumber.from('0');
  let type: ItemType = ItemType.NATIVE;
  let contractAddress = '';

  const buyArray = order.result.buy;

  if (buyArray.length > 1) {
    if (buyArray[0].item_type === 'NATIVE') {
      type = ItemType.NATIVE;
    }
    if (buyArray[0].item_type === 'ERC20') {
      type = ItemType.ERC20;
      contractAddress = buyArray[0].contract_address;
    }
    if (buyArray[0].item_type === 'ERC721') {
      type = ItemType.ERC721;
      contractAddress = buyArray[0].contract_address;
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

  // try do gas calcs using the unsigned txns
  // otherwise do the gas calcs manually with gas limit from orderbook team
  // const gasAmount = await provider.estimateGas(unsignedFulfillmentTransaction);
  // console.log('gas amount', gasAmount.toString());

  // mul = 300000 gas limit - probably move these gas limits to a common file
  // const feeData = await provider.getFeeData();
  // const gasPrice = getGasPriceInWei(feeData);
  // const gas = gasPrice?.mul(GAS_LIMIT);

  return {
    requirements,
    gas: {
      type: GasTokenType.NATIVE,
      limit: BigNumber.from(GAS_LIMIT),
    },
  };
};
