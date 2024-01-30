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

export interface MoveInProgressProps {
  transactionHash: string;
}

export function MoveInProgress({ transactionHash }: MoveInProgressProps) {
  const { t } = useTranslation();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { page } = useAnalytics();

  const { viewDispatch } = useContext(ViewContext);
  const {
    bridgeState: { checkout },
  } = useContext(BridgeContext);

  useEffect(() => {
    sendBridgeTransactionSentEvent(
      eventTarget,
      transactionHash,
    );
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'InProgress',
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
              <Badge
                isAnimated
                variant="guidance"
                sx={{
                  position: 'absolute',
                  right: 'base.spacing.x16',
                  top: 'base.spacing.x2',
                }}
              />
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
      <SimpleTextBody heading={t('views.IN_PROGRESS.heading')}>
        {t('views.IN_PROGRESS.body1')}
        <br />
        <br />
        {t('views.IN_PROGRESS.body2')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
