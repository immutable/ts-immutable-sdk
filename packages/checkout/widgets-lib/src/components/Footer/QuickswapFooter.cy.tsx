import { onDarkBase, onLightBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { QuickswapFooter } from './QuickswapFooter';
import { text } from '../../resources/text/textConfig';

describe('Quickswap Footer', () => {
  it('should show the Quickswap logo', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onLightBase }}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.LIGHT} />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet('quickswap-logo').should('be.visible');
  });

  it('should show the disclaimer text', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.DARK} />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet(
      'quickswap-footer-disclaimer-text',
    ).should(
      'have.text',
      text.footers.quickswapFooter.disclaimerText,
    );
  });
});
