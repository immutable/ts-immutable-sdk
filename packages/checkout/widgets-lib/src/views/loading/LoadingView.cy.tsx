import { mount } from 'cypress/react18';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { LoadingView } from './LoadingView';
import { cySmartGet } from '../../lib/testUtils';

describe('LoadingView', () => {
  it('should show the loading spinner with text and no footer logo', () => {
    const testLoadingText = 'Loading the view';
    mount(
      <ViewContextTestComponent>
        <LoadingView loadingText={testLoadingText} />
      </ViewContextTestComponent>,
    );

    cySmartGet('loading-box').should('exist');
    cySmartGet('loading-icon').should('be.visible');
    cySmartGet('loading-text').should('have.text', testLoadingText);
  });
  it('should show the loading spinner with text and footer logo', () => {
    const testLoadingText = 'Loading the view';
    mount(
      <ViewContextTestComponent>
        <LoadingView loadingText={testLoadingText} showFooterLogo />
      </ViewContextTestComponent>,
    );

    cySmartGet('loading-box').should('exist');
    cySmartGet('loading-icon').should('be.visible');
    cySmartGet('loading-text').should('have.text', testLoadingText);
    cySmartGet('footer-logo-container').should('exist');
  });
});
