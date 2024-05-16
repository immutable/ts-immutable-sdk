import { mount } from 'cypress/react18';
import { ViewContextTestComponent } from '../../context/view-context/test-components/ViewContextTestComponent';
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

    cySmartGet('LoopingText').should('have.text', testLoadingText);
  });
});
