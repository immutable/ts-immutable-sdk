import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useMemo } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  Box, Button,
} from '@biom3/react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { isPassportProvider } from 'lib/providerUtils';
import { Web3Provider } from '@ethersproject/providers';
import { calculateCryptoToFiat } from 'lib/utils';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';

import { BridgeReviewSummary } from '../components/BridgeReviewSummary';
import { XBridgeContext } from '../context/XBridgeContext';
// import { ViewActions, ViewContext } from 'context/view-context/ViewContext';

export function BridgeReview() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  // const { viewDispatch } = useContext(ViewContext);

  const {
    bridgeState: {
      from,
      to,
      token,
      amount,
    },
  } = useContext(XBridgeContext);

  const walletProviderName = (provider: Web3Provider | null) => (isPassportProvider(provider)
    ? WalletProviderName.PASSPORT
    : WalletProviderName.METAMASK);

  const fromAmount = useMemo(() => `${token} ${amount} `, [token, amount]);
  const fromFiatAmount = useMemo(() => {
    if (!amount || !token) return '';
    return calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);
  }, [token, amount]);
  const fromAddress = useMemo(() => {
    if (!from) return '-';
    return from.walletAddress;
  }, [from]);
  const fromWalletProviderName = useMemo(() => walletProviderName(from.web3Provider), [from]);
  const fromNetwork = useMemo(() => from.network, [from]);

  const toAddress = useMemo(() => {
    if (!to) return '-';
    return to.walletAddress;
  }, [to]);
  const toWalletProviderName = useMemo(() => walletProviderName(to.web3Provider), [to]);
  const toNetwork = useMemo(() => to.network, [to]);

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
        fromNetwork={fromNetwork}
        toAddress={toAddress}
        toWalletProviderName={toWalletProviderName}
        toNetwork={toNetwork}
        gasEstimate={gasEstimate}
        gasFiatEstimate={gasFiatEstimate}
      />
    </SimpleLayout>
  );
}
