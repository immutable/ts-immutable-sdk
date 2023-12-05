import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';

import { BridgeReviewSummary } from '../components/BridgeReviewSummary';

export function BridgeReview() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { layoutHeading } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

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
      footer={<FooterLogo />}
    >
      <BridgeReviewSummary />
    </SimpleLayout>
  );
}
