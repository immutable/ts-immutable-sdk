import { FeeValue } from '@imtbl/orderbook';
import { BigNumber, utils } from 'ethers';
import { FeePercentage, FeeToken, OrderFee } from '../../types/fees';
import { CheckoutError, CheckoutErrorType } from '../../errors';

export const MAX_FEE_PERCENTAGE_DECIMAL = 1; // 100%
export const MAX_FEE_DECIMAL_PLACES = 6; // will allow 0.000001 (0.0001%) as the minimum value

const calculateFeesPercent = (
  orderFee:OrderFee,
  amountBn: BigNumber,
  tokenQuantity: number = 1,
): BigNumber => {
  const feePercentage = orderFee.amount as FeePercentage;

  // note: multiply in and out of the maximum decimal places to the power of ten to do the math in big number integers
  const feePercentageMultiplier = Math.round(feePercentage.percentageDecimal * (10 ** MAX_FEE_DECIMAL_PLACES));

  const bnFeeAmount = amountBn
    .mul(BigNumber.from(feePercentageMultiplier))
    .div(BigNumber.from(tokenQuantity))
    .mul(BigNumber.from(tokenQuantity))
    .div(10 ** MAX_FEE_DECIMAL_PLACES);

  return bnFeeAmount;
};

const calculateFeesToken = (
  orderFee:OrderFee,
  decimals: number,
): BigNumber => {
  const feeToken = orderFee.amount as FeeToken;
  const bnFeeAmount = utils.parseUnits(feeToken.token, decimals);
  return bnFeeAmount;
};

export const calculateFees = (
  orderFees: Array<OrderFee>,
  weiAmount: string,
  decimals: number = 18,
  tokenQuantity: number = 1,
):Array<FeeValue> => {
  let totalTokenFees: BigNumber = BigNumber.from(0);

  const amountBn = BigNumber.from(weiAmount);

  // note: multiply in and out of the maximum decimal places to the power of ten to do the math in big number integers
  const totalAllowableFees: BigNumber = amountBn
    .mul(MAX_FEE_PERCENTAGE_DECIMAL * (10 ** MAX_FEE_DECIMAL_PLACES))
    .div(10 ** MAX_FEE_DECIMAL_PLACES);

  const calculateFeesResult: Array<FeeValue> = [];

  for (const orderFee of orderFees) {
    let currentFeeBn = BigNumber.from(0);
    if (Object.hasOwn(orderFee.amount, 'percentageDecimal')) {
      currentFeeBn = calculateFeesPercent(orderFee, amountBn, tokenQuantity);

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
    if (currentFeeBn.gt(0)) {
      calculateFeesResult.push({
        amount: currentFeeBn.toString(),
        recipientAddress: orderFee.recipient,
      });
    }
  }// for

  return calculateFeesResult;
};
