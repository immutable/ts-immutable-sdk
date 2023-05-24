import { useContext, useState } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { ConnectContext } from '../context/ConnectContext';
import { L1Network } from '../../../lib/networkUtils';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';

export function SwitchNetworkEth() {
  const { viewDispatch } = useContext(ViewContext);
  const { connectState } = useContext(ConnectContext);
  const { checkout, provider, sendCloseEvent } = connectState;
  const { heading, body } = text.views[ConnectWidgetViews.SWITCH_NETWORK].eth;

  const [buttonText, setButtonText] = useState('Ready to Switch');

  const switchNetwork = async () => {
    if (!provider || !checkout) return;

    try {
      await checkout.switchNetwork({
        provider,
        chainId: L1Network(checkout.config.environment),
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
      // eslint-disable-next-line no-console
      console.log(err.code, err.message);
      setButtonText('Try Again');
    }
  };

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
          onActionClick={() => switchNetwork()}
        />
      )}
      heroContent={<ImmutableNetworkHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>{body}</SimpleTextBody>
    </SimpleLayout>
  );
}
