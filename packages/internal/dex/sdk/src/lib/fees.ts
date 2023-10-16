import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  ERC20,
  Fee, SecondaryFee, addAmount, newAmount, subtractAmount, ERC20Amount,
} from 'lib';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: ERC20Amount;

  constructor(secondaryFees: SecondaryFee[], token: ERC20) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  addAmount(amount: ERC20Amount): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): ERC20Amount {
    return addAmount(this.amount, this.total());
  }

  amountLessFees(): ERC20Amount {
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

  private total(): ERC20Amount {
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
