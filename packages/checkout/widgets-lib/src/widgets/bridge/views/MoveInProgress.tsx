import { useContext, useEffect } from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
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
        />
      )}
      footer={(
        <FooterLogo />
      )}
      heroContent={<RocketHero environment={checkout.config.environment} />}
      floatHeader
    >
      <SimpleTextBody heading={t('views.IN_PROGRESS.heading')}>
        {t('views.IN_PROGRESS.body2')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
