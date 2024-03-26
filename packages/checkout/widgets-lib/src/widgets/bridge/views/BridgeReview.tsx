import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useEffect } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeReviewSummary } from '../components/BridgeReviewSummary';

export function BridgeReview() {
  const { t } = useTranslation();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'Review',
    });
  }, []);

  return (
    <SimpleLayout
      testId="bridge-review"
      header={(
        <HeaderNavigation
          showBack
          title={t('views.BRIDGE_REVIEW.layoutHeading')}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(<FooterLogo />)}
    >
      <BridgeReviewSummary />
    </SimpleLayout>
  );
}
