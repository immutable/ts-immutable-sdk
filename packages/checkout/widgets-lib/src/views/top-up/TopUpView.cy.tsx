import {
  beforeEach, cy, describe, it,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { Checkout, GasEstimateType, WalletProviderName } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
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
  });

  describe('TopUpView render', () => {
    it('should render the top up view', () => {
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
    });

    it('should hide onramp option', () => {
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption={false}
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('not.exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
    });

    it('should hide swap option', () => {
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption={false}
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('not.exist');
      cySmartGet('menu-item-bridge').should('exist');
    });

    it('should hide bridge option', () => {
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption={false}
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('not.exist');
    });

    it('should hide bridge option when provider is Passport', () => {
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={
              {
                ...connectLoaderState,
                provider: { provider: { isPassport: true } as any as ExternalProvider } as Web3Provider,
              }
            }
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption={false}
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('not.exist');
    });

    it('should call close function when close button clicked', () => {
      const closeFunction = cy.stub().as('closeFunction');
      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={closeFunction}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );
      cySmartGet('menu-item-onramp').should('exist');
      cySmartGet('menu-item-swap').should('exist');
      cySmartGet('menu-item-bridge').should('exist');
      cySmartGet('close-button').click();
      cy.get('@closeFunction').should('have.been.called');
    });

    it('should fire onramp event with onramp data on event when onramp clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestOnrampEvent').as('sendRequestOnrampEventStub');

      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              tokenAddress="0x123"
              amount="10"
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );

      cySmartGet('menu-item-onramp').click();
      cy.get('@sendRequestOnrampEventStub').should('have.been.called');
      cy.get('@sendRequestOnrampEventStub')
        .should(
          'have.been.calledWith',
          window,
          IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
          { tokenAddress: '0x123', amount: '10' },
        );
    });

    it('should fire swap event with swap data on event when swap clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as('sendRequestSwapEventStub');

      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              tokenAddress="0x123"
              amount="10"
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );

      cySmartGet('menu-item-swap').click();
      cy.get('@sendRequestSwapEventStub').should('have.been.called');
      cy.get('@sendRequestSwapEventStub')
        .should(
          'have.been.calledWith',
          window,
          IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
          // fromToken and amount should be empty for swap in top up
          { fromTokenAddress: '', toTokenAddress: '0x123', amount: '' },
        );
    });

    it('should fire bridge event with bridge data on event when bridge clicked', () => {
      cy.stub(orchestrationEvents, 'sendRequestBridgeEvent').as('sendRequestBridgeEventStub');

      mount(
        <BiomeCombinedProviders>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              tokenAddress="0x123"
              amount="10"
              onCloseButtonClick={() => {}}
            />
          </ConnectLoaderTestComponent>
        </BiomeCombinedProviders>,
      );

      cySmartGet('menu-item-bridge').click();
      cy.get('@sendRequestBridgeEventStub').should('have.been.called');
      cy.get('@sendRequestBridgeEventStub')
        .should(
          'have.been.calledWith',
          window,
          IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
          // tokenAddress and amount should be empty for bridging in top up
          { tokenAddress: '', amount: '' },
        );
    });
  });

  describe('Fee display', () => {
    const cryptoConversions = new Map<string, number>([['eth', 2000], ['imx', 1.5], ['usdc', 1]]);

    const baseWalletState: WalletState = {
      network: null,
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };

    beforeEach(() => {
      cyIntercept();
    });

    it('should display fees for onramp, swap and bridge', () => {
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
          gasEstimateType: GasEstimateType.SWAP,
          gasFee: {
            estimatedAmount: BigNumber.from(100000000000000),
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        })
        .onSecondCall()
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          gasFee: {
            estimatedAmount: BigNumber.from(100000000000000),
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          bridgeFee: {
            estimatedAmount: BigNumber.from(100000000000000),
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletWidgetTestComponent
            initialStateOverride={baseWalletState}
            cryptoConversionsOverride={cryptoConversions}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </WalletWidgetTestComponent>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('menu-item-caption-swap').contains('Using the coins I have on the same network');
      cySmartGet('menu-item-caption-swap').contains('$0.20 USD');

      cySmartGet('menu-item-caption-bridge').contains('From the coins I have on a different network');
      cySmartGet('menu-item-caption-bridge').contains('$0.40 USD');

      cySmartGet('menu-item-caption-onramp').contains('Google pay & Apple pay available. Minimum $5.');
      cySmartGet('menu-item-caption-onramp').contains('3.5% to 5.5%');
    });

    it('should display placeholder fees for onramp, swap and bridge', () => {
      cy.stub(Checkout.prototype, 'getExchangeFeeEstimate')
        .as('getExchangeFeeEstimateStub')
        .onFirstCall()
        .rejects();
      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .onFirstCall()
        .rejects();

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletWidgetTestComponent
            initialStateOverride={baseWalletState}
            cryptoConversionsOverride={cryptoConversions}
          >
            <TopUpView
              showOnrampOption
              showSwapOption
              showBridgeOption
              widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
              onCloseButtonClick={() => {}}
            />
          </WalletWidgetTestComponent>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('menu-item-caption-swap').contains('$-.-- USD');
      cySmartGet('menu-item-caption-bridge').contains('$-.-- USD');
      cySmartGet('menu-item-caption-onramp').contains('-.--%');
    });
  });
});
