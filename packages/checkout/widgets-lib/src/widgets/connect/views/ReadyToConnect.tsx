import { ChainId } from '@imtbl/checkout-sdk';
import { useContext, useState, useCallback } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { MetamaskConnectHero } from '../../../components/Hero/MetamaskConnectHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';

export interface ReadyToConnectProps {
  targetChainId: ChainId;
}
export function ReadyToConnect({ targetChainId }: ReadyToConnectProps) {
  const {
    connectState: { checkout, provider, sendCloseEvent },
    connectDispatch,
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { body, footer } = text.views[ConnectWidgetViews.READY_TO_CONNECT];
  const [footerButtonText, setFooterButtonText] = useState(footer.buttonText1);

  const handleConnectViewUpdate = async () => {
    if (!checkout || !provider) return;

    const networkInfo = await checkout.getNetworkInfo({ provider });

    if (networkInfo.chainId !== targetChainId) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: ConnectWidgetViews.SWITCH_NETWORK },
        },
      });
      return;
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: ConnectWidgetViews.SUCCESS },
      },
    });
  };

  const onConnectClick = useCallback(async () => {
    if (checkout && provider) {
      try {
        const connectResult = await checkout.connect({
          provider,
        });

        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: connectResult.provider,
          },
        });
        await handleConnectViewUpdate();
      } catch (err: any) {
        setFooterButtonText(footer.buttonText2);
      }
    }
  }, [checkout, provider, connectDispatch, viewDispatch, footer.buttonText2]);

  return (
    <SimpleLayout
      testId="ready-to-connect"
      header={(
        <HeaderNavigation
          showBack
          title=""
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      floatHeader
      heroContent={<MetamaskConnectHero />}
      footer={(
        <FooterButton
          actionText={footerButtonText}
          onActionClick={onConnectClick}
        />
      )}
    >
      <SimpleTextBody heading={body.heading}>{body.content}</SimpleTextBody>
    </SimpleLayout>
  );
}
