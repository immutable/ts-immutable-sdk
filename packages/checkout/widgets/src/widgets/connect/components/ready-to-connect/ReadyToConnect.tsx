import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FooterButton } from '../../../../components/Footer/FooterButton';
import { useCallback, useContext, useState } from 'react';
import { ConnectActions, ConnectContext } from '../../context/ConnectContext';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';
import {
  ChainId,
  Checkout,
  ConnectionProviders,
} from '@imtbl/checkout-sdk-web';
import { ConnectWidgetViews } from '../../../../context/ConnectViewContextTypes';
import { Body, Box, Heading } from '@biom3/react';
import { MetamaskConnectHero } from '../../../../components/Hero/MetamaskConnectHero';
import { text } from '../../../../resources/text/textConfig';
import { Web3Provider } from '@ethersproject/providers';

export const ReadyToConnect = () => {
  const {
    connectState: { checkout },
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
      header={<HeaderNavigation showBack title="" showClose transparent />}
      floatHeader
      heroContent={<MetamaskConnectHero />}
      footer={
        <FooterButton
          actionText={footerButtonText}
          onActionClick={onConnectClick}
        />
      }
    >
      <Box
        sx={{
          paddingY: 'base.spacing.x10',
          paddingX: 'base.spacing.x9',
          display: 'flex',
          flexDirection: 'column',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Heading
          size="small"
          weight="bold"
          sx={{ color: 'base.color.text.primary' }}
        >
          {body.heading}
        </Heading>
        <Body size="small" sx={{ color: 'base.color.text.secondary' }}>
          {body.content}
        </Body>
      </Box>
    </SimpleLayout>
  );
};
