import { ProviderPreference } from '@imtbl/imx-sdk';

export interface SetupOptions {
  providerPreference?: ProviderPreference;
}

export interface SetupResult {
  address: string;
  starkPublicKey: string;
  ethNetwork: string;
  providerPreference: string;
  email?: string;
}

export interface NFTCheckoutSecondaryParams {
  provider: string;
  orderId: string;
  userWalletAddress: string;
}

export interface NFTCheckoutPrimaryParams {
  contractAddress: string;
  offerId: string;
  provider: string;
}
