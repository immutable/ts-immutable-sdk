import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { MoveInProgress } from './MoveInProgress';

describe('MoveInProgress View', () => {
  const { heading, body1, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];

  it('should render the MoveInProgress view with the correct token symbol in the body text', () => {
    mount(
      <BridgeWidgetTestComponent>
        <MoveInProgress token={{
          name: 'Immutable X',
          symbol: 'IMX',
          decimals: 18,
        }}
        />
      </BridgeWidgetTestComponent>,
    );

    cySmartGet('move-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', heading);
    cySmartGet('simple-text-body__body').should('have.text', body1('IMX') + body2);
  });
});
