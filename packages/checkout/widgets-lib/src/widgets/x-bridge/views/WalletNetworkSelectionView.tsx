import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { WalletAndNetworkSelector } from '../components/WalletAndNetworkSelector';

export function WalletNetworkSelectionView() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading } = text.views[XBridgeWidgetViews.WALLET_NETWORK_SELECTION];
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
      <WalletAndNetworkSelector />
    </SimpleLayout>
  );
}
