import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useEffect } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeReviewSummary } from '../components/BridgeReviewSummary';

export function BridgeReview() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading } = text.views[BridgeWidgetViews.BRIDGE_REVIEW];

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
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(<FooterLogo />)}
    >
      <BridgeReviewSummary />
    </SimpleLayout>
  );
}
