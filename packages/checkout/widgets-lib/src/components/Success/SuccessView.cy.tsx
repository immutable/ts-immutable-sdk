import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';
import { SuccessView } from './SuccessView';
import { onDarkBase } from '@biom3/design-tokens';
import { BiomeThemeProvider } from '@biom3/react';

describe('success view', () => {
  it('shows success text and button', () => {
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <SuccessView
          successText="Test success"
          actionText="Close"
          onActionClick={() => {
            console.log('clicked!');
          }}
        />
      </BiomeThemeProvider>
    );

    cySmartGet('success-box').should('be.visible');
    cySmartGet('success-icon').should('be.visible');
    cySmartGet('success-text').should('be.visible');
    cySmartGet('success-text').should('have.text', 'Test success');
    cySmartGet('footer-button-container').should('be.visible');
  });
});
