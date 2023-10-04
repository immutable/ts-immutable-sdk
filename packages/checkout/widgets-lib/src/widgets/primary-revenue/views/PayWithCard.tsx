/* eslint-disable no-console */
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '../../../lib';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { useSharedContext } from '../context/SharedContextProvider';

export interface PayWithCardProps {
  config: StrongCheckoutWidgetsConfig;

}

export function PayWithCard() {
  const { config: { theme } } = useSharedContext();

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <Box>
        <SimpleLayout
          header={(
            <HeaderNavigation
              showBack
              title="Pay with Card"
              onCloseButtonClick={() => {}}
            />
          )}
          footerBackgroundColor="base.color.translucent.emphasis.200"
        >
          <Box>
            Transak Iframe
          </Box>
        </SimpleLayout>
      </Box>
    </BiomeCombinedProviders>
  );
}
