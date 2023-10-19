import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import { SecondaryFee } from 'types';
import { Amount, Coin } from 'types/private';
import { addAmount, newAmount, subtractAmount } from './utils';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: Amount<Coin>;

  constructor(secondaryFees: SecondaryFee[], token: Coin) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  get token(): Coin {
    return this.amount.token;
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

  withAmounts() {
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
