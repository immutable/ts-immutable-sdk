import { onDarkBase } from '@biom3/design-tokens';
import { BiomeThemeProvider } from '@biom3/react';
import { mount } from 'cypress/react18';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { FooterLogo } from './FooterLogo';

describe('Footer Logo', () => {
  it('should show the immutable logo', () => {
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<FooterLogo />} />
      </BiomeThemeProvider>,
    );

    cySmartGet('footer-logo-image').should('exist');
  });

  it('should hide the logo when configured', () => {
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <SimpleLayout footer={<FooterLogo hideLogo />} />
      </BiomeThemeProvider>,
    );

    cySmartGet('footer-logo-container').should('exist');
    cySmartGet('footer-logo-image').should('not.exist');
  });
});
