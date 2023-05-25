import { onDarkBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { FooterLogo } from './FooterLogo';

describe('Footer Logo', () => {
  it('should show the immutable logo', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<FooterLogo />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet('footer-logo-image').should('exist');
  });

  it('should hide the logo when configured', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<FooterLogo hideLogo />} />
      </BiomeCombinedProviders>,
    );

    cySmartGet('footer-logo-container').should('exist');
    cySmartGet('footer-logo-image').should('not.exist');
  });
});
