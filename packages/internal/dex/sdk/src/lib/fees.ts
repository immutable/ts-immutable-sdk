import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  ERC20, Amount,
  Fee, SecondaryFee, addAmount, newAmount, subtractAmount, Coin,
} from 'lib';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: Amount<Coin>;

  constructor(secondaryFees: SecondaryFee[], token: ERC20) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  addAmount(amount: Amount<Coin>): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): Amount<Coin> {
    return addAmount(this.amount, this.total());
  }

  amountLessFees(): Amount<Coin> {
    return subtractAmount(this.amount, this.total());
  }

  // TODO: Maybe take native indicator
  withAmounts(): Fee[] {
    return this.secondaryFees.map((fee) => {
      const feeAmount = this.amount.value
        .mul(fee.basisPoints)
        .div(BASIS_POINT_PRECISION);

      return {
        ...fee,
        amount: newAmount(feeAmount, this.amount.token),
      };
    });
  }

  private total(): Amount<Coin> {
    let totalFees = newAmount(BigNumber.from(0), this.amount.token);

    for (const fee of this.secondaryFees) {
      const feeAmount = this.amount.value
        .mul(fee.basisPoints)
        .div(BASIS_POINT_PRECISION);
      totalFees = addAmount(totalFees, newAmount(feeAmount, this.amount.token));
    }

    return totalFees;
  }
}
