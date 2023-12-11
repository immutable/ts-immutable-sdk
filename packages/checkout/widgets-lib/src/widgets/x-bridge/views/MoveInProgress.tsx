import { useContext } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { RocketHero } from '../../../components/Hero/RocketHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { XBridgeContext } from '../context/XBridgeContext';

export function MoveInProgress() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { heading, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];
  const {
    bridgeState: { checkout },
  } = useContext(XBridgeContext);

  return (
    <SimpleLayout
      testId="move-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      heroContent={<RocketHero environment={checkout.config.environment} />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
