import { FeeValue } from '@imtbl/orderbook';
import { parseUnits } from 'ethers';
import { FeePercentage, FeeToken, OrderFee } from '../../types/fees';
import { CheckoutError, CheckoutErrorType } from '../../errors';

export const MAX_FEE_PERCENTAGE_DECIMAL = 1; // 100%
export const MAX_FEE_DECIMAL_PLACES = 6; // will allow 0.000001 (0.0001%) as the minimum value

const calculateFeesPercent = (
  orderFee:OrderFee,
  amountBn: bigint,
  tokenQuantity: bigint = BigInt(1),
): bigint => {
  const feePercentage = orderFee.amount as FeePercentage;

  // note: multiply in and out of the maximum decimal places to the power of ten to do the math in big number integers
  const feePercentageMultiplier = Math.round(feePercentage.percentageDecimal * (10 ** MAX_FEE_DECIMAL_PLACES));

  const bnFeeAmount = (amountBn * BigInt(feePercentageMultiplier)) / BigInt(10 ** MAX_FEE_DECIMAL_PLACES);

  // always round down to have a fee amount divisible by the token quantity
  return bnFeeAmount - (bnFeeAmount % tokenQuantity);
};

const calculateFeesToken = (
  orderFee:OrderFee,
  decimals: number,
): bigint => {
  const feeToken = orderFee.amount as FeeToken;
  const bnFeeAmount = parseUnits(feeToken.token, decimals);
  return bnFeeAmount;
};

export const calculateFees = (
  orderFees: Array<OrderFee>,
  weiAmount: string,
  decimals: number = 18,
  tokenQuantity: bigint = BigInt(1),
):Array<FeeValue> => {
  let totalTokenFees: bigint = BigInt(0);

  const amountBn = BigInt(weiAmount);

  // note: multiply in and out of the maximum decimal places to the power of ten to do the math in big number integers
  const totalAllowableFees: bigint = (amountBn
    * BigInt(MAX_FEE_PERCENTAGE_DECIMAL * (10 ** MAX_FEE_DECIMAL_PLACES)))
    / BigInt(10 ** MAX_FEE_DECIMAL_PLACES);

  const calculateFeesResult: Array<FeeValue> = [];

  for (const orderFee of orderFees) {
    let currentFeeBn = BigInt(0);
    if (Object.hasOwn(orderFee.amount, 'percentageDecimal')) {
      currentFeeBn = calculateFeesPercent(orderFee, amountBn, tokenQuantity);

      totalTokenFees += currentFeeBn;
    } else if (Object.hasOwn(orderFee.amount, 'token')) {
      currentFeeBn = calculateFeesToken(orderFee, decimals);
      totalTokenFees += currentFeeBn;
    } else {
      throw new CheckoutError(
        'Unknown fee type parsed, must be percentageDecimal or token',
        CheckoutErrorType.ORDER_FEE_ERROR,
      );
    }
    if (totalTokenFees > totalAllowableFees) {
      throw new CheckoutError(
        `The combined fees are above the allowed maximum of ${MAX_FEE_PERCENTAGE_DECIMAL * 100}%`,
        CheckoutErrorType.ORDER_FEE_ERROR,
      );
    }
    if (currentFeeBn > 0) {
      calculateFeesResult.push({
        amount: currentFeeBn.toString(),
        recipientAddress: orderFee.recipient,
      });
    }
  }// for

  return calculateFeesResult;
};
