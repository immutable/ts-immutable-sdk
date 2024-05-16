import { useContext, useEffect } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { ButtonNavigationStyles } from 'components/Header/HeaderStyles';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { Badge, ButtCon } from '@biom3/react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { RocketHero } from '../../../components/Hero/RocketHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { sendBridgeTransactionSentEvent, sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { BridgeContext } from '../context/BridgeContext';
import { calculateCryptoToFiat } from '../../../lib/utils';
import { CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';

export interface MoveInProgressProps {
  transactionHash: string;
  isTransfer: boolean;
}

export function MoveInProgress({ transactionHash, isTransfer }: MoveInProgressProps) {
  const { t } = useTranslation();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { page } = useAnalytics();

  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const {
    bridgeState: {
      checkout,
      from,
      to,
      token,
      amount,
    },
  } = useContext(BridgeContext);

  useEffect(() => {
    sendBridgeTransactionSentEvent(
      eventTarget,
      transactionHash,
    );

    const fiatAmount = calculateCryptoToFiat(amount, token?.symbol ?? '', cryptoFiatState.conversions);
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'InProgress',
      extras: {
        fromWalletAddress: from?.walletAddress,
        toWalletAddress: to?.walletAddress,
        amount,
        fiatAmount,
        tokenAddress: token?.address,
        moveType: isTransfer ? 'transfer' : 'bridge',
      },
    });
  }, []);

  return (
    <SimpleLayout
      testId="move-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
          rightActions={(
            <>
              <ButtCon
                icon="Minting"
                sx={ButtonNavigationStyles()}
                onClick={() => {
                  viewDispatch({
                    payload: {
                      type: ViewActions.UPDATE_VIEW,
                      view: { type: BridgeWidgetViews.TRANSACTIONS },
                    },
                  });
                }}
                testId="settings-button"
              />
              {!isTransfer
                && (
                  <Badge
                    isAnimated
                    variant="guidance"
                    sx={{
                      position: 'absolute',
                      right: 'base.spacing.x14',
                      top: 'base.spacing.x1',
                    }}
                  />
                )}
            </>
          )}
        />
      )}
      footer={(
        <FooterLogo />
      )}
      heroContent={<RocketHero environment={checkout.config.environment} />}
      floatHeader
    >
      <SimpleTextBody heading={t(isTransfer ? 'views.IN_PROGRESS.transferHeading' : 'views.IN_PROGRESS.heading')}>
        {!isTransfer && t('views.IN_PROGRESS.body1')}
        <br />
        <br />
        {t('views.IN_PROGRESS.body2')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
