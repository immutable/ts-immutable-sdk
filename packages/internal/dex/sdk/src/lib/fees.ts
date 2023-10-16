import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  Fee, SecondaryFee, TokenInfo,
} from 'lib';
import { CurrencyAmount, Token } from 'types/amount';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: CurrencyAmount<Token>;

  constructor(secondaryFees: SecondaryFee[], token: TokenInfo) {
    this.secondaryFees = secondaryFees;
    this.amount = new CurrencyAmount(token, BigNumber.from(0));
  }

  addAmount(amount: CurrencyAmount<Token>): void {
    this.amount = this.amount.add(amount);
  }

  amountWithFeesApplied(): CurrencyAmount<Token> {
    return this.amount.add(this.total());
  }

  amountLessFees(): CurrencyAmount<Token> {
    return this.amount.sub(this.total());
  }

  withAmounts(): Fee[] {
    return this.secondaryFees.map((fee) => {
      const feeAmount = this.amount.value
        .mul(fee.basisPoints)
        .div(BASIS_POINT_PRECISION);

      return {
        ...fee,
        amount: new CurrencyAmount(this.amount.currency, feeAmount),
      };
    });
  }

  private total(): CurrencyAmount<Token> {
    let totalFees = new CurrencyAmount(this.amount.currency, BigNumber.from(0));

    for (const fee of this.secondaryFees) {
      const feeAmount = this.amount.value
        .mul(fee.basisPoints)
        .div(BASIS_POINT_PRECISION);
      totalFees = totalFees.add(new CurrencyAmount(this.amount.currency, feeAmount));
    }

    return totalFees;
  }
}
