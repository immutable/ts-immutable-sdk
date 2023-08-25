import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Environment } from '@imtbl/config';
import { cySmartGet } from '../../lib/testUtils';
import { OnRampWidget, OnRampWidgetParams } from './OnRampWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';

describe('OnRampWidget tests', () => {
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  /** mounting the on ramp widget should be done to start all tests */
  const mountOnRampWidget = () => {
    const params = {} as OnRampWidgetParams;

    mount(
      <OnRampWidget
        params={params}
        config={config}
      />,
    );
  };

  describe('OnRamp screen', () => {
    it('should have title', () => {
      mountOnRampWidget();

      cySmartGet('header-title').should('have.text', 'Add coins');
    });
  });
});
