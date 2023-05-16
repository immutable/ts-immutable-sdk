/* eslint-disable max-len */
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { BaseViews } from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';

export const text = {
  views: {
    [ConnectWidgetViews.CONNECT_WALLET]: {
      header: {
        title: 'Connect a wallet',
      },
      body: {
        content:
          "You'll need to connect or create a digital wallet to buy, sell, trade and store your coins and collectibles.",
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
      heading:
        'To trade here, MetaMask will ask you to switch to the Immutable zkEVM network',
      body: "Check for the pop-up from MetaMask and 'Approve' to switch. If this is the first time, MetaMask will also ask you to add the network.",
    },
    [BaseViews.ERROR]: {
      heading: "Something's gone wrong",
      body: ['You can try again or contact', 'support', 'for help.'],
    },
    [WalletWidgetViews.WALLET_BALANCES]: {
      header: {
        title: 'Wallet',
      },
      networkStatus: {
        heading: 'Network',
        network1Name: 'Polygon',
        network2Name: 'Ethereum',
      },
      tokenBalancesList: {
        noTokensFound: 'No tokens found',
      },
    },
    [SwapWidgetViews.SWAP]: {
      header: {
        title: 'Swap coins',
      },
      content: {
        title: 'What would you like to swap?',
      },
      swapForm: {
        from: {
          label: 'From',
        },
        to: {
          label: 'To',
        },
        buttonText: 'Swap',
      },
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
