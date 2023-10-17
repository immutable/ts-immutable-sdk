import { onDarkBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { QuickswapFooter } from './QuickswapFooter';

describe('Quickswap Footer', () => {
  it('should show the Quickswap logo', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<QuickswapFooter />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet('quickswap-logo').should('be.visible');
  });

  it('should show the disclaimer text', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<QuickswapFooter />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet(
      'quickswap-footer-disclaimer-text',
    ).should(
      'have.text',
      'Quickswap is a third party application. Immutable neither builds, owns, operates or deploys Quickswap.',
    );
  });
});
