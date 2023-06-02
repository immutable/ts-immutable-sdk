/* eslint-disable max-len */
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { SharedViews } from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';

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
      eth: {
        heading:
          "To move your coins, you'll need to switch to the Sepolia network",
        body: "You'll be prompted to switch networks in Metamask. You'll be able to switch back when needed.",
        button: {
          text: 'Ready to Switch',
          retryText: 'Try Again',
        },
      },
      zkEVM: {
        heading:
          'To trade here, MetaMask will ask you to switch to the Immutable zkEVM network',
        body: "Check for the pop-up from MetaMask and 'Approve' to switch. If this is the first time, MetaMask will also ask you to add the network.",
        button: {
          text: 'Ready to Switch',
          retryText: 'Try Again',
        },
      },
    },
    [SharedViews.ERROR_VIEW]: {
      heading: "Something's gone wrong",
      body: ['You can try again or contact', 'support', 'for help.'],
      actionText: 'Try again',
    },
    [SharedViews.LOADING_VIEW]: {
      text: 'Loading',
    },
    [WalletWidgetViews.WALLET_BALANCES]: {
      header: {
        title: 'Wallet',
      },
      networkStatus: {
        heading: 'Network',
      },
      totalTokenBalance: {
        heading: 'Coins',
        totalHeading: 'Value',
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
    [WalletWidgetViews.COIN_INFO]: {
      heading: 'Coins and collectibles are native to networks',
      body: 'You can switch networks to add coins or move them from one network to another',
    },
    [SwapWidgetViews.SWAP]: {
      header: {
        title: 'Swap coins',
      },
      content: {
        title: 'What would you like to swap?',
        fiatPricePrefix: 'Approx USD',
        availableBalancePrefix: 'Available',
      },
      swapForm: {
        from: {
          label: 'From',
          inputPlaceholder: '0',
          selectorTitle: 'What would you like to swap from?',
        },
        to: {
          label: 'To',
          inputPlaceholder: '0',
          selectorTitle: 'What would you like to swap to?',
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
      success: {
        text: 'Success',
        actionText: 'Continue',
      },
      failed: {
        text: 'Transaction rejected',
        actionText: 'Try again',
      },
      rejected: {
        text: 'Price surge',
        actionText: 'Review & try again',
      },
    },
    [BridgeWidgetViews.BRIDGE]: {
      header: {
        title: 'Move coins',
      },
      content: {
        title: 'What would you like to move from Ethereum to Immutable zkEVM?',
        fiatPricePrefix: 'Approx USD',
        availableBalancePrefix: 'Available',
      },
      bridgeForm: {
        from: {
          inputPlaceholder: '0',
          selectorTitle: 'What would you like to move?',
        },
        buttonText: 'Move',
      },
      fees: {
        title: 'Fees subtotal',
      },
      validation: {
        noAmountInputted: 'Please input amount',
        insufficientBalance: 'Insufficient balance',
        noTokenSelected: 'Select a coin to move',
      },
    },
    [SharedViews.TOP_UP_VIEW]: {
      header: {
        title: 'How would you like to add coins?',
      },
      topUpOptions: {
        onramp: {
          heading: 'Buy with card',
          caption: 'Google pay & Apple pay available. Minimum $20.',
          subcaption: 'Fees ~ 0.3%',
        },
        swap: {
          heading: 'Swap my coins',
          caption: 'Using the coins I have on the same network',
          subcaption: 'Fees ~ 0.3%',
        },
        bridge: {
          heading: 'Move my coins',
          caption: 'From the coins I have on a different network',
          // todo: get the live rate
          subcaption: 'Fees {live rate}',
        },
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
  drawers: {
    feesBreakdown: {
      heading: 'Fee breakdown',
      total:
        'Fees total',
    },
  },
};
