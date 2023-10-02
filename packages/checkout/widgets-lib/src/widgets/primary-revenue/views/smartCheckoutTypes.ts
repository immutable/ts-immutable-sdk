// TODO temp types for dev.

import { TokenInfo } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
// ! SmartCheckoutTypes ------------------------

export type FundingRouteBalanceItem = {
  balance: BigNumber,
  formattedBalance: string,
  token: TokenInfo
};

export type FundingRouteStep = {
  type: FundingRouteType;
  chainId: number,
  asset: FundingRouteBalanceItem,
};
export enum FundingRouteType {
  BRIDGE = 'BRIDGE',
  ONRAMP = 'ONRAMP',
  SWAP = 'SWAP',
}

export type FundingRoute = {
  priority: number;
  steps: FundingRouteStep[]
};

// ! ------------------------
