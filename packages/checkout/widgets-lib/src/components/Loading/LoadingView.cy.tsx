import { onDarkBase } from '@biom3/design-tokens';
import { BiomeThemeProvider } from '@biom3/react';
import { mount } from 'cypress/react18';
import { LoadingView } from './LoadingView';
import { cySmartGet } from '../../lib/testUtils';

describe('LoadingView', () => {
  it('should show the loading spinner with text', () => {
    const testLoadingText = 'Loading the view';
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <LoadingView loadingText={testLoadingText} />
      </BiomeThemeProvider>
    );

    cySmartGet('loading-box').should('exist');
    cySmartGet('loading-icon').should('be.visible');
    cySmartGet('loading-text').should('have.text', testLoadingText);
  });
});
