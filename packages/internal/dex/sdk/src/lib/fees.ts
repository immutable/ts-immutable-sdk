import { BASIS_POINT_PRECISION } from 'constants/router';
import { ethers } from 'ethers';
import { SecondaryFee } from 'lib';

export function calculateFees(amount: ethers.BigNumber, secondaryFees: SecondaryFee[]) {
  let totalFees = ethers.BigNumber.from(0);

  for (let i = 0; i < secondaryFees.length; i++) {
    const feeAmount = amount.mul(secondaryFees[i].feeBasisPoints).div(BASIS_POINT_PRECISION);
    totalFees = totalFees.add(feeAmount);
  }

  return totalFees;
}
