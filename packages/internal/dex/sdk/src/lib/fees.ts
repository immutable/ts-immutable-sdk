import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  ERC20,
  Fee, Native, SecondaryFee, TokenAmount, addAmount, newAmount, subtractAmount,
} from 'lib';

export class Fees<T extends ERC20 | Native> {
  private secondaryFees: SecondaryFee[];

  private amount: TokenAmount<T>;

  constructor(secondaryFees: SecondaryFee[], token: T) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  addAmount(amount: TokenAmount<T>): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): TokenAmount<T> {
    return addAmount(this.amount, this.total());
  }

  amountLessFees(): TokenAmount<T> {
    return subtractAmount(this.amount, this.total());
  }

  withAmounts(): Fee<T>[] {
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

  private total(): TokenAmount<T> {
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
