import { useContext, useEffect } from 'react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { RocketHero } from '../../../components/Hero/RocketHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendBridgeTransactionSentEvent, sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { XBridgeContext } from '../context/XBridgeContext';

export interface MoveInProgressProps {
  transactionHash: string;
}

export function MoveInProgress({ transactionHash }: MoveInProgressProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { heading, body2 } = text.views[XBridgeWidgetViews.IN_PROGRESS];
  const {
    bridgeState: { checkout },
  } = useContext(XBridgeContext);

  useEffect(() => {
    sendBridgeTransactionSentEvent(
      eventTarget,
      transactionHash,
    );
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
      <SimpleTextBody heading={heading}>
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
