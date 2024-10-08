import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  CheckoutErrorType,
  EIP6963ProviderDetail,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { addProviderListenersForWidgetRoot } from './eip1193Events';
import { getProviderSlugFromRdns } from './provider/utils';

export enum ConnectEIP6963ProviderError {
  CONNECT_ERROR = 'CONNECT_ERROR',
  SANCTIONED_ADDRESS = 'SANCTIONED_ADDRESS',
  USER_REJECTED_REQUEST_ERROR = 'USER_REJECTED_REQUEST_ERROR',
}

export type ConnectEIP6963ProviderResult = {
  provider: Web3Provider;
  providerName: string;
};

export const connectEIP6963Provider = async (
  providerDetail: EIP6963ProviderDetail,
  checkout: Checkout,
): Promise<ConnectEIP6963ProviderResult> => {
  const web3Provider = new Web3Provider(providerDetail.provider as any);

  try {
    const requestWalletPermissions = providerDetail.info.rdns === WalletProviderRdns.METAMASK;
    const connectResult = await checkout.connect({
      provider: web3Provider,
      requestWalletPermissions,
    });

    const address = await connectResult.provider.getSigner().getAddress();
    const isSanctioned = await checkout.checkIsAddressSanctioned(
      address,
      checkout.config.environment,
    );

    if (isSanctioned) {
      throw new Error(ConnectEIP6963ProviderError.SANCTIONED_ADDRESS);
    }

    addProviderListenersForWidgetRoot(connectResult.provider);
    return {
      provider: connectResult.provider,
      providerName: getProviderSlugFromRdns(providerDetail.info.rdns),
    };
  } catch (error: CheckoutErrorType | any) {
    if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
      throw new Error(ConnectEIP6963ProviderError.USER_REJECTED_REQUEST_ERROR);
    }

    throw new Error(ConnectEIP6963ProviderError.CONNECT_ERROR);
  }
};
