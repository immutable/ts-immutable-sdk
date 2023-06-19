import { onDarkBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { LoadingView } from './LoadingView';
import { cySmartGet } from '../../lib/testUtils';

describe('LoadingView', () => {
  it('should show the loading spinner with text and no footer logo', () => {
    const testLoadingText = 'Loading the view';
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <LoadingView loadingText={testLoadingText} />
      </BiomeCombinedProviders>,
    );

    cySmartGet('loading-box').should('exist');
    cySmartGet('loading-icon').should('be.visible');
    cySmartGet('loading-text').should('have.text', testLoadingText);
  });
  it('should show the loading spinner with text and footer logo', () => {
    const testLoadingText = 'Loading the view';
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <LoadingView loadingText={testLoadingText} showFooterLogo />
      </BiomeCombinedProviders>,
    );

    cySmartGet('loading-box').should('exist');
    cySmartGet('loading-icon').should('be.visible');
    cySmartGet('loading-text').should('have.text', testLoadingText);
    cySmartGet('footer-logo-container').should('exist');
  });
});
