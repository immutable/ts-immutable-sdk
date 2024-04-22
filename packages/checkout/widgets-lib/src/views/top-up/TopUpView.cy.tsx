import {
  beforeEach, cy, describe, it,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import {
  IMTBLWidgetEvents, Checkout, GasEstimateType, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { UserJourney } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { TopUpView } from './TopUpView';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { WalletWidgetTestComponent } from '../../widgets/wallet/test-components/WalletWidgetTestComponent';
import { WalletState } from '../../widgets/wallet/context/WalletContext';
import { ConnectionStatus } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';

describe('Top Up View', () => {
  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: {} as Web3Provider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  describe('TopUpView render', () => {
    it('should render the top up view', () => {
      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
      cySmartGet('menu-item-advanced').should('exist');
    });

    it('should hide onramp option', () => {
      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption={false}
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );
      cySmartGet('menu-item-onramp').should('not.exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
    });

    it('should hide swap option', () => {
      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption={false}
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('not.exist');
      cySmartGet('menu-item-bridge').should('exist');
    });

    it('should hide bridge option', () => {
      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption={false}
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('not.exist');
    });

    it('should call close function when close button clicked', () => {
      const closeFunction = cy.stub().as('closeFunction');
      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={closeFunction}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
      cySmartGet('close-button').click();
      cy.get('@closeFunction').should('have.been.called');
    });

    it('should fire onramp event with onramp data on event when onramp clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestOnrampEvent').as(
        'sendRequestOnrampEventStub',
      );

      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                tokenAddress="0x123"
                amount="10"
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );

      cySmartGet('menu-item-onramp').click();
      cy.get('@sendRequestOnrampEventStub').should('have.been.called');
      cy.get('@sendRequestOnrampEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        { tokenAddress: '0x123', amount: '10' },
      );
    });

    it('should fire swap event with swap data on event when swap clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as('sendRequestSwapEventStub');

      mount(
        <ViewContextTestComponent>
          <CustomAnalyticsProvider checkout={{} as Checkout}>
            <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                tokenAddress="0x123"
                amount="10"
                onCloseButtonClick={() => {}}
              />
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </ViewContextTestComponent>,
      );

      cySmartGet('menu-item-swap').click();
      cy.get('@sendRequestSwapEventStub').should('have.been.called');
      cy.get('@sendRequestSwapEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        // fromToken and amount should be empty for swap in top up
        { fromTokenAddress: '', toTokenAddress: '0x123', amount: '' },
      );
    });

    it('should fire bridge event with bridge data on event when bridge clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestBridgeEvent').as(
        'sendRequestBridgeEventStub',
      );

      mount(
        <ViewContextTestComponent>
          <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
            <TopUpView
              analytics={{ userJourney: UserJourney.WALLET }}
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              tokenAddress="0x123"
              amount="10"
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </ViewContextTestComponent>,
      );

      cySmartGet('menu-item-bridge').click();
      cy.get('@sendRequestBridgeEventStub').should('have.been.called');
      cy.get('@sendRequestBridgeEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        // tokenAddress and amount should be empty for bridging in top up
        { tokenAddress: '', amount: '' },
      );
    });
  });

  describe('TopUpView render with disabled options', () => {
    describe('when swap is unavailable', () => {
      beforeEach(() => {
        cy.stub(Checkout.prototype, 'isSwapAvailable').as('isSwapAvailableStub').returns(false);
      });

      it('should not fire swap event', () => {
        cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as('sendRequestSwapEventStub');

        mount(
          <ViewContextTestComponent>
            <CustomAnalyticsProvider checkout={{} as Checkout}>
              <ConnectLoaderTestComponent
                initialStateOverride={connectLoaderState}
              >
                <TopUpView
                  analytics={{ userJourney: UserJourney.WALLET }}
                  showOnrampOption
                  showSwapOption
                  showBridgeOption
                  widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                  tokenAddress="0x123"
                  amount="10"
                  onCloseButtonClick={() => {}}
                />
              </ConnectLoaderTestComponent>
            </CustomAnalyticsProvider>
          </ViewContextTestComponent>,
        );

        cySmartGet('menu-item-swap')
          .should('have.css', 'background-color', 'rgba(243, 243, 243, 0.06)');
      });
    });
  });

  describe('Fee display', () => {
    const cryptoConversions = new Map<string, number>([
      ['eth', 2000],
      ['imx', 1.5],
      ['usdc', 1],
    ]);

    beforeEach(() => {
      cyIntercept();
    });

    it('should display fees for onramp, swap and bridge', () => {
      const baseWalletState: WalletState = {
        network: null,
        walletProviderName: WalletProviderName.METAMASK,
        tokenBalances: [],
        supportedTopUps: {
          isOnRampEnabled: true,
          isSwapEnabled: true,
          isBridgeEnabled: true,
          isSwapAvailable: true,
        },
        walletConfig: {
          showNetworkMenu: true,
          showDisconnectButton: true,
        },
      };
      cy.stub(Checkout.prototype, 'getExchangeFeeEstimate')
        .as('getExchangeFeeEstimateStub')
        .onFirstCall()
        .resolves({
          minPercentage: '3.5',
          maxPercentage: '5.5',
        });
      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .onFirstCall()
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          fees: {
            totalFees: BigNumber.from(1000000000000000),
          },
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        });

      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <TopUpView
                analytics={{ userJourney: UserJourney.WALLET }}
                showOnrampOption
                showSwapOption
                showBridgeOption
                widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
                onCloseButtonClick={() => {}}
              />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('menu-item-caption-swap').should('be.visible');
      cySmartGet('menu-item-caption-bridge').should('be.visible');
      cySmartGet('menu-item-caption-onramp').should('be.visible');
    });

    it('should display placeholder fees for onramp, swap and bridge', () => {
      const baseWalletState: WalletState = {
        network: null,
        walletProviderName: WalletProviderName.METAMASK,
        tokenBalances: [],
        supportedTopUps: {
          isOnRampEnabled: true,
          isSwapEnabled: true,
          isBridgeEnabled: true,
          isSwapAvailable: true,
        },
        walletConfig: {
          showNetworkMenu: true,
          showDisconnectButton: true,
        },
      };

      cy.stub(Checkout.prototype, 'getExchangeFeeEstimate')
        .as('getExchangeFeeEstimateStub')
        .onFirstCall()
        .rejects();
      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .onFirstCall()
        .rejects();

      mount(
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <WalletWidgetTestComponent
            initialStateOverride={baseWalletState}
            cryptoConversionsOverride={cryptoConversions}
          >
            <TopUpView
              analytics={{ userJourney: UserJourney.WALLET }}
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </WalletWidgetTestComponent>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('menu-item-caption-bridge').contains('$-.-- USD');
      cySmartGet('menu-item-caption-onramp').contains('-.--%');
    });
  });
});
