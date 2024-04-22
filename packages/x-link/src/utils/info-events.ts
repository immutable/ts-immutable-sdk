import {
  ImxLinkInfoEventType,
  InfoEvent,
  LINK_INFO_MESSAGE_TYPE,
  WalletConnectionInfoEvent,
} from '../sdk-types/info-events';

export function dispatchLinkInfoEvent(data: any) {
  // Do all of the checking for specific messages and then dispatch events accordingly
  let customEvent: CustomEvent | null = null;

  if (
    data
    && data?.address
    && data?.starkPublicKey
    && data?.providerPreference
  ) {
    // Wallet connection event
    customEvent = new CustomEvent<InfoEvent<WalletConnectionInfoEvent>>(
      LINK_INFO_MESSAGE_TYPE,
      {
        detail: {
          type: ImxLinkInfoEventType.WALLET_CONNECTION,
          payload: {
            walletAddress: data.address,
            starkPublicKey: data.starkPublicKey,
            providerPreference: data.providerPreference,
            email: data.email,
            ethNetwork: data.ethNetwork,
          },
        },
      },
    );
  }

  if (customEvent) {
    window.dispatchEvent(customEvent);
  }
}
