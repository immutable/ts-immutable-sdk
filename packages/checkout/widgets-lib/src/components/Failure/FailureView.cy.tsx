import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { onDarkBase } from '@biom3/design-tokens';
import { BiomeThemeProvider } from '@biom3/react';
import { cySmartGet } from '../../lib/testUtils';
import { FailureView } from './FailureView';

describe('failure view', () => {
  it('shows failure text and button', () => {
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <FailureView
          failureText="Failed"
          actionText="Close"
          onActionClick={() => {
            // eslint-disable-next-line no-console
            console.log('clicked!');
          }}
        />
      </BiomeThemeProvider>,
    );

    cySmartGet('failure-view').should('be.visible');
    cySmartGet('failure-box').should('be.visible');
    cySmartGet('fail-icon').should('be.visible');
    cySmartGet('fail-text').should('be.visible');
    cySmartGet('fail-text').should('have.text', 'Failed');
    cySmartGet('footer-button-container').should('be.visible');
  });
});
