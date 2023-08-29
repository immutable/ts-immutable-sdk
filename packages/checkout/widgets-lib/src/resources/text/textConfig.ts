/* eslint-disable max-len */
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { SharedViews } from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';

export const text = {
  views: {
    [ConnectWidgetViews.CONNECT_WALLET]: {
      body: {
        heading: 'Connect a wallet',
        content:
          "You'll need to connect or create a digital wallet to buy, sell, trade and store your coins and collectibles.",
      },
    },
    [ConnectWidgetViews.READY_TO_CONNECT]: {
      header: {
        title: 'Connect',
      },
      metamask: {
        body: {
          heading: 'Check for the pop-up from MetaMask',
          content: 'Follow the prompts in the MetaMask popup to connect',
        },
        footer: {
          buttonText1: 'Ready to connect',
          buttonText2: 'Try again',
        },
      },
      passport: {
        body: {
          heading: 'Connect with Immutable Passport',
          content: 'Follow the prompts to connect with Immutable Passport',
        },
        footer: {
          buttonText1: 'Continue',
          buttonText2: 'Try again',
        },
      },
    },
    [ConnectWidgetViews.SWITCH_NETWORK]: {
      eth: {
        heading:
          "To move your coins, you'll need to switch to the Sepolia network",
        body: "You'll be prompted to switch networks in MetaMask. You'll be able to switch back when needed.",
        button: {
          text: 'Ready to Switch',
          retryText: 'Try Again',
        },
      },
      zkEVM: {
        heading:
          'You’ll be asked to switch to the Immutable zkEVM network',
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
      metamask: {
        heading: 'Coins and collectibles are native to networks',
        body: 'You can switch networks to add coins or move them from one network to another',
      },
      passport: {
        heading: 'Coins and collectibles are native to networks',
        body1: 'This network is called Immutable zkEVM. If you have other coins in your Passport and can’t see them here, they might be on another network. ',
        body2: ' for more info.',
        linkText: 'Visit our FAQs',
      },
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
      [SwapWidgetViews.IN_PROGRESS]: {
        loading: {
          text: 'Swap in progress',
        },
      },
    },
    [SwapWidgetViews.APPROVE_ERC20]: {
      approveSwap: {
        content: {
          heading: "Now you'll just need to confirm the transaction",
          body: 'Follow the prompts in your wallet.',
        },
        footer: {
          buttonText: 'Okay',
          retryText: 'Try again',
        },
      },
      approveSpending: {
        content: {
          metamask: {
            heading: "You'll be asked to set a spending cap for this transaction",
            body: [
              'Input at least',
              'for this transaction and future transactions, then follow the prompts.',
            ],
          },
          passport: {
            heading: "You'll be asked to approve a spending cap for this transaction",
            body: 'Follow the prompts in your wallet to approve the spending cap.',
          },
        },
        footer: {
          buttonText: 'Got it',
          retryText: 'Try again',
        },
        loading: {
          text: 'Approving spending cap',
        },
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
    [BridgeWidgetViews.IN_PROGRESS]: {
      heading: 'Move in progress',
      body1: (symbol: string) => `Less than 3 mins until your ${symbol} lands on zkEVM.`,
      body2: 'You can close this window, the transaction will be reflected in your wallet once complete.',
    },
    [BridgeWidgetViews.APPROVE_ERC20]: {
      approveBridge: {
        content: {
          heading: "Now you'll just need to approve the transaction",
          body: 'Follow the prompts in MetaMask.',
        },
        footer: {
          buttonText: 'Okay',
          retryText: 'Try again',
        },
      },
      approveSpending: {
        content: {
          heading: "You'll be asked to set a spending cap for this transaction",
          body: [
            'Input at least',
            'for this transaction and future transactions, then follow the prompts.',
          ],
        },
        footer: {
          buttonText: 'Got it',
          retryText: 'Try again',
        },
        loading: {
          text: 'Approving spending cap',
        },
      },
    },
    [BridgeWidgetViews.SUCCESS]: {
      text: 'Success',
      actionText: 'Continue',
    },
    [BridgeWidgetViews.FAIL]: {
      text: 'Transaction failed',
      actionText: 'Review & Try again',
    },
    [BridgeWidgetViews.BRIDGE_COMING_SOON]: {
      heading: 'Coming soon',
      body: "Moving funds across networks currently isn't supported for Passport.",
      actionText: 'Dismiss',
    },
    [OnRampWidgetViews.ONRAMP]: {
      initialLoadingText: 'Taking you to Transak',
    },
    [SharedViews.TOP_UP_VIEW]: {
      header: {
        title: 'How would you like to add coins?',
      },
      topUpOptions: {
        onramp: {
          heading: 'Buy with card',
          caption: 'Google pay & Apple pay available. Minimum $20.',
          subcaption: 'Fees ≈ 0.3%',
        },
        swap: {
          heading: 'Swap my coins',
          caption: 'Using the coins I have on the same network',
          subcaption: 'Fees ≈',
        },
        bridge: {
          heading: 'Move my coins',
          caption: 'From the coins I have on a different network',
          subcaption: 'Fees ≈',
        },
      },
    },
  },
  wallets: {
    [WalletProviderName.PASSPORT]: {
      heading: 'Immutable Passport',
      accentText: 'Recommended',
      description:
        'digital wallet and identity',
    },
    [WalletProviderName.METAMASK]: {
      heading: 'MetaMask',
      description:
        'Digital wallet for accessing blockchain applications and web3',
    },
  },
  drawers: {
    feesBreakdown: {
      heading: 'Fee breakdown',
      total: 'Fees total',
      fees: {
        gas: {
          label: 'Gas fee',
        },
      },
    },
    transactionFailed: {
      content: {
        heading1: 'We’ll need you to confirm in your',
        heading2: 'wallet before proceeding',
        body1: 'When the MetaMask pop up appears, be sure to',
        body2: 'sign the transaction',
      },
      buttons: {
        retry: 'Got it',
        cancel: 'Dismiss',
      },
    },
    coinSelector: {
      option: {
        fiatPricePrefix: 'Approx USD $',
      },
      noCoins: 'You have no available coins to select in your wallet.',
    },
    notEnoughGas: {
      content: {
        heading: 'Balance too low',
        body: "You're ETH balance is too low to cover the gas fee on this move. You could transfer more ETH into your wallet using MetaMask directly.",
      },
      buttons: {
        adjustAmount: 'Adjust amount',
        copyAddress: 'Copy wallet address',
        cancel: 'Dismiss',
      },
    },
    notEnoughImx: {
      content: {
        noImx: {
          heading: "You'll need IMX coins to swap",
          body: "Swap fees are paid in IMX coins, so you'll need to add this before you can swap",
        },
        insufficientImx: {
          heading: "You'll need more IMX coins",
          body: "In order to cover the fees for the amount specified, you'll need to add more IMX coins",
        },
      },
      buttons: {
        adjustAmount: 'Adjust amount',
        addMoreImx: 'Add IMX coins',
        cancel: 'Dismiss',
      },
    },
    unableToSwap: {
      heading: 'Unable to swap this coin',
      body: "This coin pairing isn't available to swap right now. Try another selection.",
      buttons: {
        cancel: 'Dismiss',
      },
    },
  },
};
