/* eslint-disable max-len */
import { SalePaymentTypes, WalletProviderName } from '@imtbl/checkout-sdk';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { SharedViews } from '../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { SaleWidgetViews } from '../../context/view-context/SaleViewContextTypes';
import { SaleErrorTypes } from '../../widgets/sale/types';
import { ServiceType } from '../../views/error/serviceTypes';

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
        heading: 'You’ll be asked to switch to the Immutable zkEVM network',
        body: 'Check for the pop-up from MetaMask to switch the network. If this is the first time, MetaMask will also ask you to add the network.',
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
    [SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW]: {
      heading: {
        [ServiceType.SWAP]: 'Swapping is not available in your region',
      },
      body: 'We’re sorry we cannot provide this service in your region.',
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
        body1:
          'This network is called Immutable zkEVM. If you have other coins in your Passport and can’t see them here, they might be on another network. ',
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
            heading:
              "You'll be asked to set a spending cap for this transaction",
            body: [
              'Input at least',
              'for this transaction and future transactions, then follow the prompts.',
            ],
          },
          passport: {
            heading:
              "You'll be asked to approve a spending cap for this transaction",
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
    [OnRampWidgetViews.ONRAMP]: {
      header: {
        title: 'Add coins',
      },
      initialLoadingText: 'Taking you to Transak',
      [OnRampWidgetViews.IN_PROGRESS_LOADING]: {
        loading: {
          text: 'Transak is processing your order',
        },
      },
      [OnRampWidgetViews.IN_PROGRESS]: {
        content: {
          heading: 'Order in progress',
          body1: 'You’ll receive an email from Transak when complete. This can take up to 3 mins.',
          body2: 'You can close this window, the transaction will be reflected in your wallet once complete.',
        },
      },
      [OnRampWidgetViews.SUCCESS]: {
        text: 'Coins are on the way',
        actionText: 'Done',
      },
      [OnRampWidgetViews.FAIL]: {
        text: 'Transaction failed',
        actionText: 'Try again',
      },
    },
    [SharedViews.TOP_UP_VIEW]: {
      header: {
        title: 'How would you like to add coins?',
      },
      topUpOptions: {
        onramp: {
          heading: 'Buy with card',
          caption: 'Google pay & Apple pay available. Minimum $5.',
          subcaption: 'Fees',
          disabledCaption: '',
        },
        swap: {
          heading: 'Swap my coins',
          caption: 'Using the coins I have on the same network',
          subcaption: 'Fees',
          disabledCaption: 'Not available in your region',
        },
        bridge: {
          heading: 'Move my coins',
          caption: 'From the coins I have on a different network',
          subcaption: 'Fees ',
          disabledCaption: '',
        },
      },
    },
    [SaleWidgetViews.FUND_WITH_SMART_CHECKOUT]: {
      loading: {
        checkingBalances: 'Crunching numbers',
      },
      currency: {
        usdEstimate: '≈ USD $',
        fees: 'Fees',
      },
      fundingRouteDrawer: {
        header: 'Available balance',
      },
      fundingRouteSelect: {
        heading: 'Pay with your',
        noRoutesAvailable: 'Insufficient coin balance. Please proceed with card instead.',
        continue: 'Continue',
        payWithCardInstead: "No thanks, I'll pay with card",
        payWithCard: 'Pay with card',
      },
    },
    [SaleWidgetViews.PAYMENT_METHODS]: {
      header: {
        heading: 'How would you like to pay?',
      },
      options: {
        [SalePaymentTypes.CRYPTO]: {
          heading: 'Coins',
          caption: 'Using the coins balance in your wallet',
          disabledCaption: "We can't see enough coins in your balance",
        },
        [SalePaymentTypes.FIAT]: {
          heading: 'Card',
          caption: 'GooglePay also available with Transak',
          disabledCaption: undefined,
        },
      },
      insufficientCoinsBanner: {
        caption: 'Insufficient coin balance. Please proceed with card instead.',
      },
      loading: {
        ready: 'Ready to purchase',
        confirm: 'Confirm in your wallet',
        processing: 'Processing purchase',
      },
    },
    [SaleWidgetViews.PAY_WITH_COINS]: {
      header: {
        heading: 'Pay with your',
        caption: 'Using the coins balance in your wallet',
      },
      button: {
        buyNow: 'Buy now',
      },
    },
    [SaleWidgetViews.PAY_WITH_CARD]: {
      screenTitle: 'Pay with card',
      loading: 'Taking you to Transak',
    },
    [SaleWidgetViews.SALE_FAIL]: {
      errors: {
        [SaleErrorTypes.TRANSACTION_FAILED]: {
          description: 'Transaction failed',
          primaryAction: 'Try again',
          secondaryAction: 'View details',
        },
        [SaleErrorTypes.SERVICE_BREAKDOWN]: {
          description:
            "Sorry, we're unable to process your payment right now. Please try again in a few minutes.",
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.PRODUCT_NOT_FOUND]: {
          description: 'Sorry, this item is no longer available',
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.INSUFFICIENT_STOCK]: {
          description: 'Sorry, the requested quantity is not in stock. Consider buying a smaller quantity.',
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.TRANSAK_FAILED]: {
          description: 'Sorry, something went wrong. Please try again.',
          primaryAction: 'Try again',
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.WALLET_FAILED]: {
          description: "Sorry, we're unable to process this right now.",
          primaryAction: 'Go back',
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
          description: 'Sorry, something went wrong. Please try again.',
          primaryAction: 'Go back',
          secondaryAction: 'Dismiss',
        },
        [SaleErrorTypes.WALLET_REJECTED]: {
          description:
            "You'll need to approve the transaction in your wallet to proceed.",
          primaryAction: 'Try again',
          secondaryAction: 'Cancel',
        },
        [SaleErrorTypes.SMART_CHECKOUT_ERROR]: {
          description:
            'Unable to check your wallets balance. Please try again.',
          primaryAction: 'Try again',
          secondaryAction: 'Cancel',
        },
        [SaleErrorTypes.SMART_CHECKOUT_EXECUTE_ERROR]: {
          description:
            'Sorry, something went wrong while moving funds. Please try again.',
          primaryAction: 'Try again',
          secondaryAction: 'Cancel',
        },
        [SaleErrorTypes.DEFAULT]: {
          description: 'Sorry, something went wrong. Please try again.',
          primaryAction: 'Try again',
          secondaryAction: 'Dismiss',
        },
      },
    },
    [SaleWidgetViews.SALE_SUCCESS]: {
      text: 'Order completed',
      actionText: 'Continue',
    },
    [BridgeWidgetViews.WALLET_NETWORK_SELECTION]: {
      layoutHeading: 'Move',
      heading: 'Where would you like to move funds between?',
      fromFormInput: {
        heading: 'From',
        selectDefaultText: 'Select wallet and network',
        walletSelectorHeading: 'From wallet',
        networkSelectorHeading: 'From network',
      },
      toFormInput: {
        heading: 'To',
        selectDefaultText: 'Select wallet and network',
        walletSelectorHeading: 'To wallet',
      },
      submitButton: {
        text: 'Next',
      },
    },
    [BridgeWidgetViews.BRIDGE_FORM]: {
      header: {
        title: 'Move coins',
      },
      fees: {
        title: 'Estimated fees',
        fiatPricePrefix: '~ USD $',
      },
      content: {
        title: 'How much would you like to move?',
        fiatPricePrefix: 'Approx USD',
        availableBalancePrefix: 'Available',
      },
      bridgeForm: {
        from: {
          inputPlaceholder: '0',
          selectorTitle: 'What would you like to move?',
        },
        buttonText: 'Review',
      },
      validation: {
        noAmountInputted: 'Please input amount',
        insufficientBalance: 'Insufficient balance',
        noTokenSelected: 'Select a coin to move',
      },
    },
    [BridgeWidgetViews.BRIDGE_REVIEW]: {
      layoutHeading: 'Move',
      heading: 'Ok, how does this look?',
      fromLabel: {
        amountHeading: 'Moving',
        heading: 'From',
      },
      toLabel: {
        heading: 'To',
      },
      fees: {
        heading: 'Estimated fees',
      },
      submitButton: {
        buttonText: 'Confirm move',
      },
      fiatPricePrefix: '~ USD $',
    },
    [BridgeWidgetViews.BRIDGE_FAILURE]: {
      statusText: 'Transaction failed',
      actionText: 'Review & Try again',
    },
    [BridgeWidgetViews.APPROVE_TRANSACTION]: {
      content: {
        heading: 'Approve the transaction in your wallet',
        body: 'Follow the prompts in your wallet popup to confirm.',
      },
      footer: {
        buttonText: 'Okay',
        retryText: 'Try again',
      },
      loadingView: {
        text: 'Initiating move',
      },
    },
    [BridgeWidgetViews.IN_PROGRESS]: {
      heading: 'Move in progress',
      body1: (symbol: string) => `Less than 3 mins until your ${symbol} lands on zkEVM.`,
      body2: "Your funds have been sent, with less than 20 mins remaining until they're received. You can return and view progress by clicking on the rocket icon.",
      body3: 'You can close this window.',
    },
    [BridgeWidgetViews.TRANSACTIONS]: {
      layoutHeading: 'In progress',
      passportDashboard: 'View the full transaction history in your',
      status: {
        inProgress: {
          heading: 'In Progress',
          txnEstimate: 'Usually takes 20 mins',
          stepInfo: 'View Details',
        },
        emptyState: {
          notConnected: {
            body: 'Connect your wallet to view the transactions',
          },
        },
        noTransactions: {
          body: "You're all done here.",
          passport: {
            body: 'View your completed transactions in ',
            link: 'Passport',
          },
        },
      },
      fiatPricePrefix: '≈ USD $',
      support: {
        body1: 'Need help?',
        body2: ' Contact ',
        body3: 'support',
        supportLink: 'https://support.immutable.com/en/',
        passport: {
          body1: 'Or view completed transactions in your ',
          body2: 'Passport',
        },
      },
      walletSelection: {
        heading: 'Choose a wallet to view',
      },
    },
  },
  footers: {
    quickswapFooter: {
      disclaimerText: 'Quickswap is a third party app. Immutable neither builds, owns, operates or deploys Quickswap. For further info, refer to Quickswap’s website.',
    },
  },
  wallets: {
    [WalletProviderName.PASSPORT]: {
      heading: 'Immutable Passport',
      accentText: 'Recommended',
      description: 'digital wallet and identity',
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
        eth: {
          heading: 'Balance too low',
          body: 'Your ETH balance is too low to cover the gas fee on this move. You could transfer more ETH into your wallet using MetaMask directly.',
        },
        imx: {
          heading: "You'll need more IMX coins",
          body: "In order to cover the fees for the amount specified, you'll need to add more IMX coins.",
        },
      },
      buttons: {
        adjustAmount: 'Adjust amount',
        copyAddress: 'Copy wallet address',
        addMoreImx: 'Add IMX coins',
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
