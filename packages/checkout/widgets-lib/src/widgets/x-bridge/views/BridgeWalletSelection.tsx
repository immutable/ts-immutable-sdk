import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeWalletForm } from '../components/BridgeWalletForm';

export function BridgeWalletSelection() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];
  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <BridgeWalletForm />
    </SimpleLayout>
  );
}
