import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { Bridge } from './Bridge';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

describe('Bridge View', () => {
  const { header, content } = text.views[BridgeWidgetViews.BRIDGE];

  beforeEach(() => {
    cyIntercept();
  });

  it('should render the bridge view', () => {
    mount(
      <ViewContextTestComponent>
        <BridgeWidgetTestComponent>
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>
      </ViewContextTestComponent>,
    );

    cySmartGet('bridge-view').should('exist');
    cySmartGet('bridge-form').should('be.visible');
    cySmartGet('header-title').should('have.text', header.title);
    cySmartGet('bridge-form-content-heading').should('have.text', content.title);
  });
});
