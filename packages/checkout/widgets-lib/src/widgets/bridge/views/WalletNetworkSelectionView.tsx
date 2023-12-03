import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { ButtonNavigationStyles } from 'components/Header/HeaderStyles';
import { Box, ButtCon } from '@biom3/react';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { WalletAndNetworkSelector } from '../components/WalletAndNetworkSelector';
import { BridgeContext } from '../context/BridgeContext';

export function WalletNetworkSelectionView() {
  const { viewDispatch } = useContext(ViewContext);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading } = text.views[BridgeWidgetViews.WALLET_NETWORK_SELECTION];

  const { bridgeState } = useContext(BridgeContext);
  const { web3Provider } = bridgeState;

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
          rightActions={web3Provider ? (
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
          ) : <Box />}
        />
      )}
      footer={<FooterLogo />}
    >
      <WalletAndNetworkSelector />
    </SimpleLayout>
  );
}
