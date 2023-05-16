import { BiomeThemeProvider, Body, Box, Icon } from '@biom3/react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { useState } from 'react';
import { InnerWidget } from '../inner-widget/InnerWidget';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  SuccessBoxStyles,
  SuccessLogoStyles,
} from '../../../../components/Success/SuccessViewStyles';
import { CenteredBoxContent } from '../../../../components/CenteredBoxContent/CenteredBoxContent';
import { zkEVMNetwork } from '../../../../lib/networkUtils';
import { Environment } from '@imtbl/config';
import { InnerExampleWidgetViews } from '../../../../context/view-context/InnerExampleViewContextTypes';

export interface ConnectionLoaderProps {
  children?: React.ReactNode;
  params: ConnectionLoaderParams;
  theme: WidgetTheme;
}

export interface ConnectionLoaderParams {
  providerPreference?: ConnectionProviders;
}

enum ConnectionStatus {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED_WRONG_NETWORK = 'CONNECTED_WRONG_NETWORK',
  CONNECTED_WITH_NETWORK = 'CONNECTED_WITH_NETWORK',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

export function ConnectionLoader({
  children,
  params,
  theme,
}: ConnectionLoaderProps) {
  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });
  const [connStatus, setConnStatus] = useState(ConnectionStatus.UNKNOWN);

  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  async function checkConnection() {
    try {
      const checkIsConnectedRes = await checkout.checkIsWalletConnected({
        providerPreference: ConnectionProviders.METAMASK,
      });

      if (!checkIsConnectedRes.isConnected) {
        return ConnectionStatus.NOT_CONNECTED;
      }

      const connectRes = await checkout.connect({
        providerPreference: ConnectionProviders.METAMASK,
      });

      console.log('connectRes', connectRes);
      if (
        connectRes.network.chainId !== zkEVMNetwork(checkout.config.environment)
      ) {
        return ConnectionStatus.CONNECTED_WRONG_NETWORK;
      }

      return ConnectionStatus.CONNECTED_WITH_NETWORK;
    } catch (err: any) {
      return ConnectionStatus.ERROR;
    }
  }

  window.setTimeout(() => {
    checkConnection().then((newStatus: ConnectionStatus) => {
      setConnStatus(newStatus);
    });
  }, 2000);

  function callBack() {
    setConnStatus(ConnectionStatus.CONNECTED_WITH_NETWORK);
  }

  return (
    <>
      {connStatus === ConnectionStatus.UNKNOWN && (
        <BiomeThemeProvider theme={{ base: biomeTheme }}>
          <SimpleLayout footer={<FooterLogo />}>
            <CenteredBoxContent>
              <Box sx={SuccessBoxStyles}>
                <Box sx={SuccessLogoStyles}>
                  <Icon
                    icon="Loading"
                    variant="bold"
                    sx={{
                      width: 'base.icon.size.400',
                      fill: 'base.color.brand.2',
                    }}
                  />
                </Box>
                <Body size="medium" weight="bold">
                  Checking Connection
                </Body>
              </Box>
            </CenteredBoxContent>
          </SimpleLayout>
        </BiomeThemeProvider>
      )}
      {connStatus === ConnectionStatus.NOT_CONNECTED && (
        <InnerWidget
          params={params}
          theme={theme}
          callBack={callBack}
          deepLink={InnerExampleWidgetViews.VIEW_ONE}
        ></InnerWidget>
      )}
      {connStatus === ConnectionStatus.CONNECTED_WRONG_NETWORK && (
        <InnerWidget
          params={params}
          theme={theme}
          callBack={callBack}
          deepLink={InnerExampleWidgetViews.VIEW_TWO}
        ></InnerWidget>
      )}
      {connStatus === ConnectionStatus.CONNECTED_WITH_NETWORK && (
        <>{children && <>{children}</>}</>
      )}
    </>
  );
}
