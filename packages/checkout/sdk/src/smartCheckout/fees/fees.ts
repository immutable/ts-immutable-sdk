import { ERC20Item, FeeValue, NativeItem } from '@imtbl/orderbook';
import { BigNumber } from 'ethers';
import { FeePercentage, FeeToken, OrderFee } from '../../types/fees';
import { CheckoutError, CheckoutErrorType } from '../../errors';

export const MAX_FEE_PERCENTAGE_DECIMAL = 1; // 100%
export const MAX_FEE_DECIMAL_PLACES = 6; // will allow 0.000001 (0.0001%) as the minimum value

const calculateFeesPercent = (
  orderFee:OrderFee,
  amountBn: BigNumber,
): BigNumber => {
  const feePercentage = orderFee.amount as FeePercentage;

  const feePercentageMultiplier = Math.round(feePercentage.percentageDecimal * (10 ** MAX_FEE_DECIMAL_PLACES));

  const bnFeeAmount = amountBn
    .mul(BigNumber.from(feePercentageMultiplier))
    .div(10 ** MAX_FEE_DECIMAL_PLACES);

  return bnFeeAmount;
};

const calculateFeesToken = (
  orderFee:OrderFee,
  decimals: number,
): BigNumber => {
  const feeToken = orderFee.amount as FeeToken;

  const bnFeeAmount = BigNumber.from(feeToken.token)
    .mul(BigNumber.from(10)
      .pow(decimals));
  return bnFeeAmount;
};

export const calculateFees = (
  orderFees: Array<OrderFee>,
  buyTokenOrNative: ERC20Item | NativeItem,
  decimals: number = 18,
):Array<FeeValue> => {
  let totalTokenFees: BigNumber = BigNumber.from(0);

  const amountBn = BigNumber.from(buyTokenOrNative.amount)
    .mul(BigNumber.from(10)
      .pow(decimals));

  const totalAllowableFees: BigNumber = amountBn
    .mul(MAX_FEE_PERCENTAGE_DECIMAL * (10 ** MAX_FEE_DECIMAL_PLACES))
    .div(10 ** MAX_FEE_DECIMAL_PLACES);

  const calculateFeesResult:Array<FeeValue> = [];

  for (const orderFee of orderFees) {
    let currentFeeBn = BigNumber.from(0);
    if (Object.hasOwn(orderFee.amount, 'percentageDecimal')) {
      currentFeeBn = calculateFeesPercent(orderFee, amountBn);
      totalTokenFees = totalTokenFees.add(currentFeeBn);
    } else if (Object.hasOwn(orderFee.amount, 'token')) {
      currentFeeBn = calculateFeesToken(orderFee, decimals);
      totalTokenFees = totalTokenFees.add(currentFeeBn);
    } else {
      throw new CheckoutError(
        'Unknown fee type parsed, must be percentageDecimal or token',
        CheckoutErrorType.ORDER_FEE_ERROR,
      );
    }
    if (totalTokenFees.gt(totalAllowableFees)) {
      throw new CheckoutError(
        `The combined fees are above the allowed maximum of ${MAX_FEE_PERCENTAGE_DECIMAL * 100}%`,
        CheckoutErrorType.ORDER_FEE_ERROR,
      );
    }
    if (currentFeeBn.gte(0)) {
      calculateFeesResult.push({
        amount: currentFeeBn.toString(),
        recipient: orderFee.recipient,
      });
    }
  }// for

  return calculateFeesResult;
};
