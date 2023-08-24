import { BiomeCombinedProviders, Box } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect } from 'react';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';

export interface OnRampWidgetProps {
  // eslint-disable-next-line react/no-unused-prop-types
  params: OnRampWidgetParams;
  config: StrongCheckoutWidgetsConfig;
}

export interface OnRampWidgetParams {
  amount?: string;
}

export function OnRampWidget(props: OnRampWidgetProps) {
  const { config } = props;
  const { environment, theme } = config;
  const url = environment === Environment.SANDBOX
    ? 'https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2'
    : '';

  const configurations = 'exchangeScreenTitle=BUY';

  const finalUrl = `${url}&${configurations}`;
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  useEffect(() => {
    const domIframe:HTMLIFrameElement = document.getElementById('transak-iframe') as HTMLIFrameElement;

    if (domIframe === undefined) return;

    const handler = (event: any) => {
      if (event.source === domIframe.contentWindow) {
        if (event.origin === 'https://global-stg.transak.com') {
          console.log('TRANSAK event data: ', event.data);
        }
      }
    };

    console.log('useeffect passed check for iframe domElement');
    window.addEventListener('message', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <SimpleLayout
        header={(
          <HeaderNavigation
            showBack
            title="Add coins"
            onCloseButtonClick={() => sendOnRampWidgetCloseEvent()}
          />
        )}
        footerBackgroundColor="base.color.translucent.emphasis.200"
      >
        <Box style={{
          position: 'relative',
          width: '420px',
          height: '565px',
          boxShadow: '0 0 15px #1461db',
          borderRadius: '15px',
          overflow: 'hidden',
          marginLeft: '5px',
        }}
        >
          <iframe
            title="Transak title"
            id="transak-iframe"
            src={finalUrl}
            allow="camera;microphone;fullscreen;payment"
            style={{ height: '100%', width: '100%', border: 'none' }}
          />
        </Box>
      </SimpleLayout>
    </BiomeCombinedProviders>
  );
}
