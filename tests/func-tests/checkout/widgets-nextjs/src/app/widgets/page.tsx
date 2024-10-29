"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { ChainId, CommerceFlowType, CommerceWidgetFlowParams, SwapDirection, WalletProviderName, Widget, WidgetType } from '@imtbl/sdk/checkout';
import { useEffect, useState } from 'react';

const checkoutSDK = new checkout.Checkout();

const COMMERCE_FLOW_PARAMS: Record<CommerceFlowType, CommerceWidgetFlowParams> = {
  [CommerceFlowType.CONNECT]: {
    flow: CommerceFlowType.CONNECT,
    language: 'en',
    targetChainId: ChainId.ETHEREUM,
    targetWalletRdns: 'io.metamask',
    blocklistWalletRdns: ['com.blockedwallet']
  },
  [CommerceFlowType.WALLET]: {
    flow: CommerceFlowType.WALLET,
    walletProviderName: WalletProviderName.METAMASK,
    language: 'en',
  },
  [CommerceFlowType.SALE]: {
    flow: CommerceFlowType.SALE,
    environmentId: 'env-123',
    items: [
      {
        productId: 'prod-1',
        qty: 1,
        name: 'Test NFT',
        image: 'https://example.com/nft.png',
        description: 'A test NFT item'
      }
    ],
    collectionName: 'Test Collection',
    walletProviderName: WalletProviderName.METAMASK,
    language: 'en',
    excludePaymentTypes: [],
    excludeFiatCurrencies: [],
    preferredCurrency: 'USD',
    customOrderData: {
      'test': 'test'
    }
  },
  [CommerceFlowType.SWAP]: {
    flow: CommerceFlowType.SWAP,
    showBackButton: true,
    walletProviderName: WalletProviderName.METAMASK,
    language: 'en',
    amount: '1.0',
    fromTokenAddress: '0x123...',
    toTokenAddress: '0x456...',
    autoProceed: false,
    direction: SwapDirection.FROM

  },
  [CommerceFlowType.BRIDGE]: {
    flow: CommerceFlowType.BRIDGE,
    showBackButton: true,
    walletProviderName: WalletProviderName.PASSPORT,
    language: 'en',
    tokenAddress: '0x789...',
    amount: '1.0',
  },
  [CommerceFlowType.ONRAMP]: {
    flow: CommerceFlowType.ONRAMP,
    showBackButton: true,
    walletProviderName: WalletProviderName.WALLETCONNECT,
    language: 'en',
    tokenAddress: '0x789...',
    amount: '1.0',
  },
  [CommerceFlowType.ADD_FUNDS]: {
    flow: CommerceFlowType.ADD_FUNDS,
    showBackButton: true,
    language: 'en',
    showOnrampOption: true,
    showSwapOption: true,
    showBridgeOption: true,
    toTokenAddress: '0xabc...',
    toAmount: '100',
    toProvider: undefined,
  },
};

function Widgets() {

  const [widget, setWidget] = useState<Widget<WidgetType.IMMUTABLE_COMMERCE>>();

  useEffect(() => {

    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ config: {} });

      const widget = widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {})
      setWidget(widget);
    }

    loadWidgets();
  }, []);


  useEffect(() => {
    if (!widget) return;

    widget.mount("widget-root", {
      ...COMMERCE_FLOW_PARAMS[CommerceFlowType.WALLET]
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceSuccessEventType.CONNECT_SUCCESS) {
          // Handle connect success
        }

        if (type === checkout.CommerceSuccessEventType.ADD_FUNDS_SUCCESS) {
          // Handle add funds success
        }

        if (type === checkout.CommerceSuccessEventType.BRIDGE_SUCCESS) {
          // Handle bridge success
        }

        if (type === checkout.CommerceSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS) {
          // Handle bridge claim withdrawal success
        }

        if (type === checkout.CommerceSuccessEventType.ONRAMP_SUCCESS) {
          // Handle onramp success
        }

        if (type === checkout.CommerceSuccessEventType.SWAP_SUCCESS) {
          // Handle swap success
        }

        if (type === checkout.CommerceSuccessEventType.SALE_SUCCESS) {
          // Handle sale success
        }

        if (type === checkout.CommerceSuccessEventType.SALE_TRANSACTION_SUCCESS) {
          // Handle sale transaction success
        }
      }
    );

    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.CONNECT_FAILED) {
          // Handle connect failure
        }

        if (type === checkout.CommerceFailureEventType.ADD_FUNDS_FAILED) {
          // Handle add funds failure
        }

        if (type === checkout.CommerceFailureEventType.BRIDGE_FAILED) {
          // Handle bridge failure
        }

        if (type === checkout.CommerceFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED) {
          // Handle bridge claim withdrawal failure
        }

        if (type === checkout.CommerceFailureEventType.ONRAMP_FAILED) {
          // Handle onramp failure
        }

        if (type === checkout.CommerceFailureEventType.SWAP_FAILED) {
          // Handle swap failure
        }

        if (type === checkout.CommerceFailureEventType.SWAP_REJECTED) {
          // Handle swap rejection
        }

        if (type === checkout.CommerceFailureEventType.SALE_FAILED) {
          // Handle sale failure
        }
      }
    );

    widget.addListener(checkout.CommerceEventType.PROVIDER_UPDATED,
      (payload: checkout.CommerceProviderUpdatedEvent) => {
        // Handle provider updated
        const { provider, walletProviderName, walletProviderInfo } = payload;
      });

    widget.addListener(checkout.CommerceEventType.USER_ACTION, () => {
      (payload: checkout.CommerceUserActionEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceUserActionEventType.PAYMENT_METHOD_SELECTED) {
          // Handle payment method selection
        }

        if (type === checkout.CommerceUserActionEventType.PAYMENT_TOKEN_SELECTED) {
          // Handle payment token selection  
        }

        if (type === checkout.CommerceUserActionEventType.NETWORK_SWITCH) {
          // Handle network switch
        }
      }
    });

    widget.addListener(checkout.CommerceEventType.DISCONNECTED, () => {
    });

    widget.addListener(checkout.CommerceEventType.CLOSE, () => {
      widget.unmount();
    });

    // clean up event listeners
    return () => {
      widget.removeListener(checkout.CommerceEventType.SUCCESS);
      widget.removeListener(checkout.CommerceEventType.FAILURE);
      widget.removeListener(checkout.CommerceEventType.PROVIDER_UPDATED);
      widget.removeListener(checkout.CommerceEventType.USER_ACTION);
      widget.removeListener(checkout.CommerceEventType.DISCONNECTED);
      widget.removeListener(checkout.CommerceEventType.CLOSE);
    };


  }, [widget]);


  return (
    <div>
      <Box
        id="widget-root"
        sx={{
          minw: "430px",
          minh: "650px",
          bg: "base.color.translucent.standard.300",
          brad: "base.borderRadius.x5",
        }}
      />
    </div>
  )
}

export default Widgets;
