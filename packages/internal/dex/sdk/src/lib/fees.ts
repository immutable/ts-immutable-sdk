import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  Amount,
  Fee, SecondaryFee, TokenInfo, addAmount, newAmount, subtractAmount,
} from 'lib';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: Amount;

  constructor(secondaryFees: SecondaryFee[], token: TokenInfo) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  addAmount(amount: Amount): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): Amount {
    return addAmount(this.amount, this.total());
  }

  amountLessFees(): Amount {
    return subtractAmount(this.amount, this.total());
  }

  withAmounts(): Fee[] {
    return this.secondaryFees.map((fee) => {
      const feeAmount = this.amount.value
        .mul(fee.feeBasisPoints)
        .div(BASIS_POINT_PRECISION);

      return {
        ...fee,
        amount: newAmount(feeAmount, this.amount.token),
      };
    });
  }

  private total(): Amount {
    let totalFees = newAmount(BigNumber.from(0), this.amount.token);

    for (const fee of this.secondaryFees) {
      const feeAmount = this.amount.value
        .mul(fee.feeBasisPoints)
        .div(BASIS_POINT_PRECISION);
      totalFees = addAmount(totalFees, newAmount(feeAmount, this.amount.token));
    }

    return totalFees;
  }
}
