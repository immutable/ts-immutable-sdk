import {
  ChainId, ChainName, Checkout, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { ViewContextTestComponent } from '../../context/view-context/test-components/ViewContextTestComponent';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import { ConnectLoader, ConnectLoaderParams } from './ConnectLoader';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

describe('ConnectLoader', () => {
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  let providerOnStub;
  let providerRemoveListenerStub;
  let checkout;
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
    providerOnStub = cy.stub().as('providerOnStub');
    providerRemoveListenerStub = cy.stub().as('providerRemoveListenerStub');
    checkout = new Checkout();
  });

  it('should show connect widget when no provider', () => {
    const params = {
      allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
      checkout,
    } as ConnectLoaderParams;
    mount(
      <ViewContextTestComponent theme={config.theme}>
        <ConnectLoader
          widgetConfig={config}
          params={params}
          closeEvent={() => {}}
        >
          <div id="inner-widget">Inner Widget</div>
        </ConnectLoader>
        ,
      </ViewContextTestComponent>,
    );
    cySmartGet('wallet-list-metamask').should('be.visible');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should show ready to connect view when provider but not connected', () => {
    const provider = {
      on: providerOnStub,
      removeListener: providerRemoveListenerStub,
      request: () => {},
      getSigner: () => ({
        getAddress: async () => Promise.resolve(''),
      }),
    };
    const params = {
      web3Provider: { provider } as any as Web3Provider,
      allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
      checkout,
    } as ConnectLoaderParams;

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: false,
      });

    mount(
      <ViewContextTestComponent theme={config.theme}>
        <ConnectLoader
          widgetConfig={config}
          params={params}
          closeEvent={() => {}}
        >
          <div id="inner-widget">Inner Widget</div>
        </ConnectLoader>
      </ViewContextTestComponent>,
    );

    cySmartGet('footer-button').should('have.text', 'Ready to connect');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should show connect widget switch network when user addListener wrong network', () => {
    const provider = {
      on: providerOnStub,
      removeListener: providerRemoveListenerStub,
      request: () => {},
    };
    const params = {
      targetChainId: ChainId.IMTBL_ZKEVM_TESTNET,
      web3Provider: { provider } as any as Web3Provider,
      allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
      checkout,
    };

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: true,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          provider: {
            getSigner: () => ({
              getAddress: async () => Promise.resolve(''),
            }),
            getNetwork: async () => ({
              chainId: ChainId.ETHEREUM,
              name: 'ETHEREUM',
            }),
            on: providerOnStub,
            removeListener: providerRemoveListenerStub,
          },
          network: { name: 'ETHEREUM' },
        },
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        isSupported: false,
      });

    mount(
      <ViewContextTestComponent theme={config.theme}>
        <ConnectLoader
          widgetConfig={config}
          params={params}
          closeEvent={() => {}}
        >
          <div id="inner-widget">Inner Widget</div>
        </ConnectLoader>
      </ViewContextTestComponent>,
    );

    cySmartGet('switch-network-view').should('be.visible');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should go through connect flow and show inner widget if provider not connected', () => {
    const provider = {
      on: providerOnStub,
      removeListener: providerRemoveListenerStub,
      request: async () => Promise.resolve(ChainId.IMTBL_ZKEVM_TESTNET),
    };
    const params = {
      targetChainId: ChainId.IMTBL_ZKEVM_TESTNET,
      web3Provider: {
        provider,
        getSigner: () => ({
          getAddress: async () => Promise.resolve(''),
        }),
        isMetaMask: true,
      } as any as Web3Provider,
      allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
      checkout,
    };

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .onFirstCall()
      .resolves({
        isConnected: false,
      })
      .onSecondCall()
      .resolves({
        isConnected: true,
      });

    cy.stub(Checkout.prototype, 'createProvider')
      .as('createProviderStub')
      .resolves({
        provider: {
          provider,
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          isMetaMask: true,
        } as any as Web3Provider,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .onFirstCall()
      .resolves({
        provider: {
          provider: {
            on: providerOnStub,
            removeListener: providerRemoveListenerStub,
          },
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          getNetwork: async () => ({
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: ChainName.IMTBL_ZKEVM_TESTNET,
          }),
        },
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        isSupported: true,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      });

    mount(
      <ViewContextTestComponent theme={config.theme}>
        <ConnectLoader
          widgetConfig={config}
          params={params}
          closeEvent={() => {}}
        >
          <div id="inner-widget">Inner Widget</div>
        </ConnectLoader>
      </ViewContextTestComponent>,
    );

    cySmartGet('footer-button').click();
    cy.get('#inner-widget').should('be.visible');
  });

  it('should not show connect flow when user already connected', () => {
    const provider = {
      on: providerOnStub,
      removeListener: providerRemoveListenerStub,
      request: () => {},
    };
    const params = {
      targetChainId: ChainId.IMTBL_ZKEVM_TESTNET,
      web3Provider: {
        provider,
        getSigner: () => ({
          getAddress: async () => Promise.resolve(''),
        }),
        getNetwork: async () => ({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: ChainName.IMTBL_ZKEVM_TESTNET,
        }),
      } as any as Web3Provider,
      allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
      checkout,
    };

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: true,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          provider: {
            on: providerOnStub,
            removeListener: providerRemoveListenerStub,
          },
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          getNetwork: async () => ({
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: ChainName.IMTBL_ZKEVM_TESTNET,
          }),
        },
      });

    cy.stub(Checkout, 'isWeb3Provider')
      .as('isWeb3ProviderStub')
      .returns(true);

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        isSupported: true,
      });

    mount(
      <ViewContextTestComponent theme={config.theme}>
        <ConnectLoader
          widgetConfig={config}
          params={params}
          closeEvent={() => {}}
        >
          <div id="inner-widget">Inner Widget</div>
        </ConnectLoader>
      </ViewContextTestComponent>,
    );

    cy.get('#inner-widget').should('be.visible');
  });

  // TODO: This functionality has been moved into the BaseWidgetRoot. The tests should be moved there

  // describe('wallet events', () => {
  //   it('should set up event listeners for accountsChanged and chainChanged', () => {
  //     const provider = { on: providerOnStub, removeListener: providerRemoveListenerStub };
  //     const params = {
  //       web3Provider: {
  //         provider,
  //         getSigner: () => ({
  //           getAddress: async () => Promise.resolve(''),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  //           name: ChainName.IMTBL_ZKEVM_TESTNET,
  //         }),
  //       } as any as Web3Provider,
  //       allowedChains: [ChainId.IMTBL_ZKEVM_TESTNET],
  //       checkout,
  //     };

  //     cy.stub(Checkout.prototype, 'checkIsWalletConnected')
  //       .as('checkIsWalletConnectedStub')
  //       .resolves({
  //         isConnected: true,
  //       });

  //     cy.stub(Checkout.prototype, 'connect')
  //       .as('connectStub')
  //       .resolves({
  //         provider: {
  //           provider: {
  //             on: providerOnStub,
  //             removeListener: providerRemoveListenerStub,
  //           },
  //           getSigner: () => ({
  //             getAddress: async () => Promise.resolve(''),
  //           }),
  //           getNetwork: async () => ({
  //             chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  //             name: ChainName.IMTBL_ZKEVM_TESTNET,
  //           }),
  //         },
  //       });

  //     cy.stub(Checkout, 'isWeb3Provider')
  //       .as('isWeb3ProviderStub')
  //       .returns(true);

  //     cy.stub(Checkout.prototype, 'getNetworkInfo')
  //       .as('getNetworkInfoStub')
  //       .resolves({
  //         chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  //         isSupported: true,
  //       });

  //     mount(
  //       <ViewContextTestComponent theme={config.theme}>
  //         <ConnectLoader
  //           widgetConfig={config}
  //           params={params}
  //           closeEvent={() => {}}
  //         >
  //           <div id="inner-widget">Inner Widget</div>
  //         </ConnectLoader>
  //       </ViewContextTestComponent>,
  //     );

  //     cy.get('#inner-widget').should('be.visible');

  //     cySmartGet('@providerOnStub').should('have.been.calledWith', ProviderEvent.ACCOUNTS_CHANGED);
  //     cySmartGet('@providerOnStub').should('have.been.calledWith', ProviderEvent.CHAIN_CHANGED);
  //   });
  // });
});
