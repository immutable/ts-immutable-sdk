import { useCallback, useContext, useState } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { getL2ChainId } from '../../../lib';

export function SwitchNetworkZkEVM() {
  const { viewDispatch } = useContext(ViewContext);
  const { connectDispatch, connectState } = useContext(ConnectContext);
  const { checkout, provider, sendCloseEvent } = connectState;
  const { heading, body, button } = text.views[ConnectWidgetViews.SWITCH_NETWORK].zkEVM;

  const [buttonText, setButtonText] = useState(button.text);

  const switchNetwork = useCallback(async () => {
    if (!provider || !checkout) return;

    try {
      const switchRes = await checkout.switchNetwork({
        provider,
        chainId: getL2ChainId(checkout.config),
      });
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider: switchRes.provider,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: ConnectWidgetViews.SUCCESS,
          },
        },
      });
    } catch (err: any) {
      setButtonText(button.retryText);
    }
  }, [provider, checkout]);

  return (
    <SimpleLayout
      testId="switch-network-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      footer={(
        <FooterButton
          actionText={buttonText}
          onActionClick={switchNetwork}
        />
      )}
      heroContent={<ImmutableNetworkHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>{body}</SimpleTextBody>
    </SimpleLayout>
  );
}
