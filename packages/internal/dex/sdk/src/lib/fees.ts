import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import {
  Fee, SecondaryFee,
} from 'lib';
import { Currency, CurrencyAmount } from 'types/amount';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private amount: CurrencyAmount<Currency>;

  constructor(secondaryFees: SecondaryFee[], token: Currency) {
    this.secondaryFees = secondaryFees;
    this.amount = new CurrencyAmount(token, BigNumber.from(0));
  }

  addAmount(amount: CurrencyAmount<Currency>): void {
    this.amount = this.amount.add(amount);
  }

  amountWithFeesApplied(): CurrencyAmount<Currency> {
    return this.amount.add(this.total());
  }

  amountLessFees(): CurrencyAmount<Currency> {
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

  private total(): CurrencyAmount<Currency> {
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
