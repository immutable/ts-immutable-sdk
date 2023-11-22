import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { CrossWalletForm } from '../components/CrossWalletForm';

export function CrossWalletSelection() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          title="Move"
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <CrossWalletForm testId="cross-wallet-form" />
    </SimpleLayout>
  );
}
