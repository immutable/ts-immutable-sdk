import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { AnalyticsProvider } from '../../context/AnalyticsProvider';
import { OnrampComponent } from './component/OnrampComponent';

export interface BridgeWidgetProps {
  // eslint-disable-next-line react/no-unused-prop-types
  params: OnRampWidgetParams;
  config: StrongCheckoutWidgetsConfig;
}

export interface OnRampWidgetParams {
  amount?: string;
}

export function OnRampWidget(props: BridgeWidgetProps) {
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

  return (
    <AnalyticsProvider>
      <BiomeCombinedProviders theme={{ base: biomeTheme }}>
        <SimpleLayout
          header={(
            <HeaderNavigation
              showBack
              title="Add coins"
              onCloseButtonClick={() => console.log('close widget event')}
            />
            )}
          footerBackgroundColor="base.color.translucent.emphasis.200"
        >
          <OnrampComponent finalUrl={finalUrl} />
        </SimpleLayout>
      </BiomeCombinedProviders>
    </AnalyticsProvider>
  );
}
