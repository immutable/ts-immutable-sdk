import { Web3Provider } from '@ethersproject/providers';
import { ChainId, Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { useContext, useState, useCallback } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { MetamaskConnectHero } from '../../../components/Hero/MetamaskConnectHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { ViewContext, ViewActions } from '../../../context/ViewContext';
import { text } from '../../../resources/text/textConfig';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';

export const ReadyToConnect = () => {
  const {
    connectState: { checkout, sendCloseEvent },
    connectDispatch,
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { body, footer } = text.views[ConnectWidgetViews.READY_TO_CONNECT];
  const [footerButtonText, setFooterButtonText] = useState(footer.buttonText1);

  const onConnectClick = useCallback(async () => {
    const handleConnectViewUpdate = async (
      checkout: Checkout,
      provider: Web3Provider
    ) => {
      const networkInfo = await checkout.getNetworkInfo({ provider });

      if (networkInfo.chainId !== ChainId.POLYGON) {
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

    if (checkout) {
      try {
        const connectResult = await checkout.connect({
          providerPreference: ConnectionProviders.METAMASK,
        });
        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: connectResult.provider,
          },
        });
        handleConnectViewUpdate(checkout, connectResult.provider);
      } catch (err: any) {
        setFooterButtonText(footer.buttonText2);
      }
    }
  }, [checkout, connectDispatch, viewDispatch, footer.buttonText2]);

  return (
    <SimpleLayout
      testId="ready-to-connect"
      header={
        <HeaderNavigation
          showBack
          title=""
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      }
      floatHeader
      heroContent={<MetamaskConnectHero />}
      footer={
        <FooterButton
          actionText={footerButtonText}
          onActionClick={onConnectClick}
        />
      }
    >
      <SimpleTextBody heading={body.heading}>{body.content}</SimpleTextBody>
    </SimpleLayout>
  );
};
