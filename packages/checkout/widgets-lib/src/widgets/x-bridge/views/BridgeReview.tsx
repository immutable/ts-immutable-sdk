import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { Box, Button } from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeReviewSummary } from '../components/BridgeReviewSummary';

export function BridgeReview() {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  // TODO: use data from context
  // const {
  //   bridgeState: {
  //     fromAmount, fromCurrency, fromAddress, toAddress, gasEstimate,
  //   },
  // } = useContext(XBridgeContext);

  // TODO: remove fake data
  const fromAmount = 'USDC 60.0';
  const fromFiatAmount = 'USD $60.00';
  const fromAddress = '0xA74...EFee';
  const fromWalletProviderName = WalletProviderName.METAMASK;
  const fromChainId = ChainId.ETHEREUM;
  const toAddress = '0x20fj...3fhjhg';
  const toWalletProviderName = WalletProviderName.PASSPORT;
  const toChainId = ChainId.IMTBL_ZKEVM_TESTNET;
  const gasEstimate = 'ETH 0.007984';
  const gasFiatEstimate = 'USD $15.00';

  const { layoutHeading, footer } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

  return (
    <SimpleLayout
      testId="bridge-review"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onBackButtonClick={() => {}}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'base.spacing.x4',
            paddingX: 'base.spacing.x4',
            backgroundColor: 'base.color.translucent.standard.200',
            width: '100%',
          }}
        >
          <Button size="large" sx={{ width: '100%' }}>
            {footer.buttonText}
          </Button>
          <FooterLogo />
        </Box>
      )}
    >
      <BridgeReviewSummary
        testId="bridge-review-summary"
        fromAmount={fromAmount}
        fromFiatAmount={fromFiatAmount}
        fromAddress={fromAddress}
        fromWalletProviderName={fromWalletProviderName}
        fromChainId={fromChainId}
        toAddress={toAddress}
        toWalletProviderName={toWalletProviderName}
        toChainId={toChainId}
        gasEstimate={gasEstimate}
        gasFiatEstimate={gasFiatEstimate}

      />
    </SimpleLayout>
  );
}
