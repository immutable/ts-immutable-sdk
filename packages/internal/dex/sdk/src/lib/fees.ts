import { BASIS_POINT_PRECISION } from '../constants/router';
import { BigNumber } from 'ethers';
import { Coin, CoinAmount, SecondaryFee } from '../types';
import { addAmount, newAmount, subtractAmount } from './utils';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: CoinAmount<Coin>;

  constructor(secondaryFees: SecondaryFee[], token: Coin) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
  }

  get token(): Coin {
    return this.amount.token;
  }

  addAmount(amount: CoinAmount<Coin>): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): CoinAmount<Coin> {
    return addAmount(this.amount, this.total());
  }

  amountLessFees(): CoinAmount<Coin> {
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

  private total(): CoinAmount<Coin> {
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
