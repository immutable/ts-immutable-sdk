import { BASIS_POINT_PRECISION } from 'constants/router';
import { BigNumber } from 'ethers';
import { Coin, CoinAmount, SecondaryFee } from 'types';
import { TradeType } from '@uniswap/sdk-core';
import { addAmount, newAmount, subtractAmount } from './utils';

export class Fees {
  private amount: CoinAmount<Coin>;

  constructor(private secondaryFees: SecondaryFee[], token: Coin, private tradeType: TradeType) {
    this.secondaryFees = secondaryFees;
    this.amount = newAmount(BigNumber.from(0), token);
    this.tradeType = tradeType;
  }

  get token(): Coin {
    return this.amount.token;
  }

  addAmount(amount: CoinAmount<Coin>): void {
    this.amount = addAmount(this.amount, amount);
  }

  amountWithFeesApplied(): CoinAmount<Coin> {
    return this.tradeType === TradeType.EXACT_INPUT ?
      subtractAmount(this.amount, this.total()) :
      addAmount(this.amount, this.total());
  }

  withAmounts() {
    return this.secondaryFees.map((fee) => {
      const feeAmount = this.getFeeAmount(fee);
      return {
        ...fee,
        amount: newAmount(feeAmount, this.amount.token),
      };
    });
  }

  private total(): CoinAmount<Coin> {
    let totalFees = newAmount(BigNumber.from(0), this.amount.token);

    for (const fee of this.secondaryFees) {
      const feeAmount = this.getFeeAmount(fee);
      totalFees = addAmount(totalFees, newAmount(feeAmount, this.amount.token));
    }

    return totalFees;
  }

  private getFeeAmount(fee: SecondaryFee): BigNumber {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.amount.value.mul(fee.basisPoints).div(BASIS_POINT_PRECISION);
    }

    return this.amount.value.mul(fee.basisPoints).div(BASIS_POINT_PRECISION - fee.basisPoints);
  }
}
