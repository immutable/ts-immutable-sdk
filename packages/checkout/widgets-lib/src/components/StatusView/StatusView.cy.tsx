import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { onDarkBase } from '@biom3/design-tokens';
import { BiomeThemeProvider, Body } from '@biom3/react';
import { cySmartGet } from '../../lib/testUtils';
import { StatusView } from './StatusView';

describe('status view', () => {
  it('shows success text and button', () => {
    mount(
      <BiomeThemeProvider theme={{ base: onDarkBase }}>
        <StatusView
          actionText="Close"
          testId="status-view-text"
          onActionClick={() => {
            // eslint-disable-next-line no-console
            console.log('clicked!');
          }}
        >
          <Body testId="view-body">hi there</Body>
        </StatusView>
      </BiomeThemeProvider>,
    );

    cySmartGet('view-body').should('be.visible');
    cySmartGet('status-view-text').should('be.visible');
    cySmartGet('status-view-text').should('have.text', 'hi there');
    cySmartGet('footer-button-container').should('be.visible');
  });
});
