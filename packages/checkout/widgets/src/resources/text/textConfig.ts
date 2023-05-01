import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { ConnectWidgetViews } from '../../context/ConnectViewContextTypes';

export const text = {
  views: {
    [ConnectWidgetViews.CONNECT_WALLET]: {
      header: {
        title: 'Connect a wallet',
      },
      body: {
        content:
          'You’ll need to connect or create a digital wallet to buy, sell, trade and store your coins and collectibles.',
      },
    },
    [ConnectWidgetViews.READY_TO_CONNECT]: {
      body: {
        heading: 'Check for the pop-up from MetaMask',
        content: 'Follow the prompts in the Metamask popup to connect',
      },
      footer: {
        buttonText1: 'Ready to connect',
        buttonText2: 'Try again',
      },
    },
    [ConnectWidgetViews.SWITCH_NETWORK]: {
      heading: 'To trade here, MetaMask will ask you to switch to the Immutable zkEVM network',
      body: 'Check for the pop-up from MetaMask and ‘Approve’ to switch. If this is the first time, MetaMask will also ask you to add the network.',
    },
  },
  wallets: {
    [ConnectionProviders.METAMASK]: {
      heading: 'MetaMask',
      description:
        'Digital wallet for accessing blockchain applications and web3',
    },
  },
};
