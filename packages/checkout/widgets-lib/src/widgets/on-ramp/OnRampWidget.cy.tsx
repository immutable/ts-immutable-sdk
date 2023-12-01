import { cy, describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Environment } from '@imtbl/config';
import {
  ChainId, ChainName, Checkout, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { cySmartGet } from '../../lib/testUtils';
import OnRampWidget, { OnRampWidgetInputs } from './OnRampWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  ConnectLoaderTestComponent,
} from '../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { ConnectionStatus } from '../../context/connect-loader-context/ConnectLoaderContext';
import { AnalyticsProvider } from '../../context/analytics-provider/SegmentAnalyticsProvider';

describe('OnRampWidget tests', () => {
  const widgetsConfig: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
    }),
    getNetwork: async () => ({
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      name: ChainName.IMTBL_ZKEVM_TESTNET,
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: mockProvider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  describe('OnRamp screen', () => {
    it('should have title', () => {
      const params = {} as OnRampWidgetInputs;
      mount(
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <AnalyticsProvider>
            <OnRampWidget
              {...params}
              config={widgetsConfig}
            />
          </AnalyticsProvider>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('header-title').should('have.text', 'Add coins');
    });

    it('should show the loading screen before the on ramp iframe', () => {
      const params = {} as OnRampWidgetInputs;
      mount(
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <AnalyticsProvider>
            <OnRampWidget
              {...params}
              config={widgetsConfig}
            />
          </AnalyticsProvider>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('loading-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('header-title').should('have.text', 'Add coins');
    });
  });
});
