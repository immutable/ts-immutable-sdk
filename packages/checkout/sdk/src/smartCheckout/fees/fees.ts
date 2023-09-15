import { ERC20Item, NativeItem } from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { FeePercent, FeeToken, OrderFee } from '../../types/fees';

export const calculateFees = (
  orderFee: OrderFee,
  buyTokenOrNative: ERC20Item | NativeItem,
  decimals: number = 18,
):string => {
  console.log('calculateFees', orderFee, decimals, buyTokenOrNative);

  console.log(Object.hasOwn(orderFee.amount, 'percent'));

  if (Object.hasOwn(orderFee.amount, 'percent')) {
    const bnFeeAmount = BigNumber.from(buyTokenOrNative.amount).mul(BigNumber.from(10).pow(decimals));
    console.log('bnFeeAmount', bnFeeAmount.toString());

    const feePercent = orderFee.amount as FeePercent;

    const feeDecimalsPlaces = feePercent.percent.toString().split('.')[1].length;

    console.log('feeDecimalsPlaces', feeDecimalsPlaces);

    const bnFeePercent = bnFeeAmount.mul(BigNumber.from(feePercent.percent));
    console.log('bnFeePercent', bnFeePercent.toString());

    return bnFeePercent.toString();
  }

  if (Object.hasOwn(orderFee.amount, 'token')) {
    const feeToken = orderFee.amount as FeeToken;

    const bnFeeAmount = BigNumber.from(feeToken.token).mul(BigNumber.from(10).pow(decimals));
    return bnFeeAmount.toString();
  }

  return '';
};
