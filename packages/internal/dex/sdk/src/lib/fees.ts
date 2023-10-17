import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  Amount,
  Fee, SecondaryFee, newAmount, ERC20, subtractERC20Amount, addERC20Amount,
} from 'lib';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: Amount<ERC20>;

  constructor(secondaryFees: SecondaryFee[], token: ERC20) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  addAmount(amount: Amount<ERC20>): void {
    this.amount = addERC20Amount(this.amount, amount);
  }

  amountWithFeesApplied(): Amount<ERC20> {
    return addERC20Amount(this.amount, this.total());
  }

  amountLessFees(): Amount<ERC20> {
    return subtractERC20Amount(this.amount, this.total());
  }

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

  private total(): Amount<ERC20> {
    let totalFees = newAmount(BigNumber.from(0), this.amount.token);

    for (const fee of this.secondaryFees) {
      const feeAmount = this.amount.value
        .mul(fee.basisPoints)
        .div(BASIS_POINT_PRECISION);
      totalFees = addERC20Amount(totalFees, newAmount(feeAmount, this.amount.token));
    }

    return totalFees;
  }
}
