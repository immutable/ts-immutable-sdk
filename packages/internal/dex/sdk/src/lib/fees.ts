import { BASIS_POINT_PRECISION } from 'constants/router';
import { ethers } from 'ethers';
import {
  Fee, SecondaryFee, TokenInfo, newAmount,
} from 'lib';

export class Fees {
  private secondaryFees: SecondaryFee[];

  private token: TokenInfo;

  private amount: ethers.BigNumber = ethers.BigNumber.from(0);

  constructor(secondaryFees: SecondaryFee[], token: TokenInfo) {
    this.secondaryFees = secondaryFees;
    this.token = token;
  }

  addAmount(amount: ethers.BigNumber): void {
    this.amount = this.amount.add(amount);
  }

  amountWithFeesApplied(): ethers.BigNumber {
    return this.amount.add(this.total());
  }

  amountLessFees(): ethers.BigNumber {
    return this.amount.sub(this.total());
  }

  withAmounts(): Fee[] {
    return this.secondaryFees.map((fee) => {
      const feeAmount = this.amount
        .mul(fee.feeBasisPoints)
        .div(BASIS_POINT_PRECISION);

      return {
        ...fee,
        amount: newAmount(feeAmount, this.token),
      };
    });
  }

  private total(): ethers.BigNumber {
    let totalFees = ethers.BigNumber.from(0);

    for (let i = 0; i < this.secondaryFees.length; i++) {
      const feeAmount = this.amount
        .mul(this.secondaryFees[i].feeBasisPoints)
        .div(BASIS_POINT_PRECISION);
      totalFees = totalFees.add(feeAmount);
    }

    return totalFees;
  }
}
