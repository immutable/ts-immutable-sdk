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
      },
      tokenBalancesList: {
        noTokensFound: 'No tokens found',
      },
    },
    [WalletWidgetViews.SETTINGS]: {
      header: {
        title: 'Settings',
      },
      disconnectButton: {
        label: 'Disconnect Wallet',
      },
    },
    [SwapWidgetViews.SWAP]: {
      header: {
        title: 'Swap coins',
      },
      content: {
        title: 'What would you like to swap?',
        fiatPricePrefix: 'Approx USD',
        gasFeePrefix: '≈ IMX',
        availableBalancePrefix: 'Available',
      },
      swapForm: {
        from: {
          label: 'From',
          inputPlaceholder: '0',
        },
        to: {
          label: 'To',
          inputPlaceholder: '0',
        },
        buttonText: 'Swap',
      },
      fees: {
        title: 'Fees total',
      },
      validation: {
        noAmountInputted: 'Please input amount',
        insufficientBalance: 'Insufficient balance',
        noFromTokenSelected: 'Select a coin to swap',
        noToTokenSelected: 'Select a coin to receive',
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
