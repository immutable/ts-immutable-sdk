import {
  ChainId,
  ChainName,
  Checkout,
  WidgetTheme,
  ConnectWidgetParams,
} from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Environment } from '@imtbl/config';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import ConnectWidget from './ConnectWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

describe('ConnectWidget tests', () => {
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  let providerOnStub;
  let providerRemoveListenerStub;

  beforeEach(() => {
    cyIntercept();
    cy.viewport('ipad-2');
    providerOnStub = cy.stub().as('providerOnStub').returns({});
    providerRemoveListenerStub = cy.stub().as('providerRemoveListenerStub').returns({});
  });

  const mockWeb3Provider = {
    provider: {
      on: providerOnStub,
      removeListener: providerRemoveListenerStub,
    },
    getSigner: () => ({
      getAddress: () => Promise.resolve(''),
    }),
  } as unknown as Web3Provider;

  /** mounting the connect widget should be done to start all tests */
  const mountConnectWidget = () => {
    const props = {} as ConnectWidgetParams;
    const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

    mount(
      <ViewContextTestComponent>
        <ConnectWidget config={config} checkout={checkout} {...props} web3Provider={mockWeb3Provider} />
      </ViewContextTestComponent>,
    );
  };

  const mountConnectWidgetAndGoToReadyToConnect = () => {
    mountConnectWidget();
    cySmartGet('wallet-list-metamask').click();
  };

  const mockPassportProvider = (request: 'reject' | 'resolve') => {
    if (request === 'reject') {
      return {
        isPassport: true,
        request: cy.stub().as('requestStub').rejects({}),
      } as any as ExternalProvider;
    }
    if (request === 'resolve') {
      return {
        isPassport: true,
        request: cy.stub().as('requestStub').resolves({}),
      } as any as ExternalProvider;
    }
    return {};
  };

  const mountConnectWidgetWithPassport = (passportProviderRequest: 'reject' | 'resolve') => {
    const passportProvider = mockPassportProvider(passportProviderRequest);
    const testPassportInstance = {
      connectEvm: cy.stub().as('connectEvmStub').returns(passportProvider),
    } as any as Passport;
    const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX }, passport: testPassportInstance });

    mount(
      <ViewContextTestComponent>
        <ConnectWidget
          config={config}
          checkout={checkout}
        />
      </ViewContextTestComponent>,
    );
  };

  const mountConnectWidgetWithPassportAndGoToReadyToConnect = (passportProviderRequest: 'reject' | 'resolve') => {
    mountConnectWidgetWithPassport(passportProviderRequest);
    cySmartGet('wallet-list-passport').click();
  };

  describe('Connect Wallet screen', () => {
    it('should show MetaMask wallet option on desktop', () => {
      mountConnectWidget();

      cySmartGet('wallet-list').should('exist');
      cySmartGet('wallet-list-metamask').should('be.visible');
    });

    it('should show Passport wallet option on desktop if passport instance is passed in', () => {
      mountConnectWidgetWithPassport('resolve');

      cySmartGet('wallet-list').should('exist');
      cySmartGet('wallet-list-passport').should('be.visible');
    });

    it('should show the Immutable Logo in the footer', () => {
      mountConnectWidget();

      cySmartGet('footer-logo-container').should('exist');
      cySmartGet('footer-logo-image').should('exist');
    });

    it('should update the view to Ready to Connect screen when MetaMask is clicked', () => {
      mountConnectWidget();

      cy.stub(Checkout.prototype, 'createProvider')
        .as('createProviderStub')
        .resolves({
          provider: {} as Web3Provider,
        });

      cySmartGet('wallet-list-metamask').click();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('metamask-connect-hero').should('be.visible');
    });

    it('should update the view to Ready to Connect screen when Passport is clicked', () => {
      mountConnectWidgetWithPassport('resolve');

      cySmartGet('wallet-list-passport').click();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('passport-connect-hero').should('be.visible');
    });
  });

  describe('Ready to connect screen', () => {
    describe('Passport', () => {
      it('should show Passport logo in Hero content', () => {
        mountConnectWidgetWithPassportAndGoToReadyToConnect('resolve');

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('passport-connect-hero').should('be.visible');
        cySmartGet('passport-connect-hero-logo').should('be.visible');
      });

      it('should call connectEvm on passport instance when Continue is clicked', () => {
        mountConnectWidgetWithPassportAndGoToReadyToConnect('resolve');

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Continue');
        cySmartGet('footer-button').click();
        cySmartGet('@connectEvmStub').should('have.been.called');
      });

      it('should update footer button text to Try again when user rejects connection request', () => {
        mountConnectWidgetWithPassportAndGoToReadyToConnect('reject');

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Continue');
        cySmartGet('footer-button').click();
        cySmartGet('@requestStub').should('have.been.called');
        cySmartGet('@connectEvmStub').should('have.been.called');
        cySmartGet('footer-button').should('have.text', 'Try again');
      });

      it('should call request when Try again is clicked', () => {
        const provider = mockPassportProvider('reject');
        cy.stub(Checkout.prototype, 'connect').as('connectStub').onFirstCall().rejects({})
          .onSecondCall()
          .resolves({ provider: { provider } as Web3Provider, walletProviderName: 'passport' });
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({});

        mountConnectWidgetWithPassportAndGoToReadyToConnect('reject');

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Continue');
        cySmartGet('footer-button').click();
        cySmartGet('@requestStub').should('have.been.called');
        cySmartGet('@connectEvmStub').should('have.been.called');
        cySmartGet('footer-button').should('have.text', 'Try again');
        cySmartGet('footer-button').click();
        cySmartGet('@connectStub').should('have.been.calledTwice');
      });

      it('should go back to Connect A Wallet screen when back is clicked', () => {
        mountConnectWidgetWithPassportAndGoToReadyToConnect('resolve');

        cySmartGet('back-button').click();
        cySmartGet('ready-to-connect').should('not.exist');
        cySmartGet('connect-wallet').should('be.visible');
      });
    });

    describe('Metamask', () => {
      beforeEach(() => {
        cy.stub(Checkout.prototype, 'createProvider')
          .as('createProviderStub')
          .resolves({
            provider: {} as Web3Provider,
          });
      });

      it('should show MetaMask logo in Hero content', () => {
        mountConnectWidgetAndGoToReadyToConnect();

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('metamask-connect-hero').should('be.visible');
        cySmartGet('metamask-connect-hero-logo').should('be.visible');
      });

      it('should call checkout.connect() when Ready to connect is clicked', () => {
        cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({});
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({});
        mountConnectWidgetAndGoToReadyToConnect();

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('@connectStub').should('have.been.calledWith', { provider: {} as Web3Provider });
      });

      it('should update footer button text to Try again when user rejects connection request', () => {
        cy.stub(Checkout.prototype, 'connect').as('connectStub').rejects({});
        mountConnectWidgetAndGoToReadyToConnect();

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('@connectStub').should('have.been.called');
        cySmartGet('footer-button').should('have.text', 'Try again');
      });

      it('should call checkout.connect() when Try again is clicked', () => {
        cy.stub(Checkout.prototype, 'connect').as('connectStub').rejects({});
        mountConnectWidgetAndGoToReadyToConnect();

        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('@connectStub').should('have.been.called');
        cySmartGet('footer-button').should('have.text', 'Try again');
        cySmartGet('footer-button').click();
        cySmartGet('@connectStub').should('have.been.calledTwice');
      });

      it('should go back to Connect A Wallet screen when back is clicked', () => {
        mountConnectWidgetAndGoToReadyToConnect();

        cySmartGet('back-button').click();
        cySmartGet('ready-to-connect').should('not.exist');
        cySmartGet('connect-wallet').should('be.visible');
      });
    });
  });

  describe('SwitchNetwork', () => {
    describe('No Switch', () => {
      beforeEach(() => {
        cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({
          provider: {
            provider: {
              on: providerOnStub,
              removeListener: providerRemoveListenerStub,
            },
            getSigner: () => ({
              getAddress: () => Promise.resolve(''),
              getChainId: async () => Promise.resolve(ChainId.IMTBL_ZKEVM_TESTNET),
            }),
          } as unknown as Web3Provider,
        });
        cy.stub(Checkout.prototype, 'createProvider')
          .as('createProviderStub')
          .resolves({
            provider: {
              provider: {
                on: providerOnStub,
                removeListener: providerRemoveListenerStub,
              },
              getSigner: () => ({
                getAddress: () => Promise.resolve(''),
                getChainId: async () => Promise.resolve(ChainId.IMTBL_ZKEVM_TESTNET),
              }),
            } as unknown as Web3Provider,
          });
      });

      it('should not show switch to ZKEVM network if already connected to ZKEVM', () => {
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('not.exist');
        cySmartGet('success-view').should('be.visible');
      });

      it('should not show switch network if chain is part of allowed chains', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Sepolia',
            chainId: ChainId.SEPOLIA,
          });

        const props = {} as ConnectWidgetParams;
        const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

        mount(
          <ViewContextTestComponent>
            <ConnectWidget
              config={config}
              checkout={checkout}
              {...props}
              targetChainId={ChainId.IMTBL_ZKEVM_TESTNET}
              allowedChains={[ChainId.IMTBL_ZKEVM_TESTNET, ChainId.SEPOLIA]}
            />
          </ViewContextTestComponent>,
        );

        cySmartGet('wallet-list-metamask').click();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('success-box').should('be.visible');
      });
    });

    describe('Switch', () => {
      beforeEach(() => {
        cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({
          provider: {
            provider: {
              on: providerOnStub,
              removeListener: providerRemoveListenerStub,
            },
            getSigner: () => ({
              getAddress: () => Promise.resolve(''),
              getChainId: async () => Promise.resolve(ChainId.SEPOLIA),
            }),
          } as unknown as Web3Provider,
        });
        cy.stub(Checkout.prototype, 'createProvider')
          .as('createProviderStub')
          .resolves({
            provider: {
              provider: {
                on: providerOnStub,
                removeListener: providerRemoveListenerStub,
              },
              getSigner: () => ({
                getAddress: () => Promise.resolve(''),
                getChainId: async () => Promise.resolve(ChainId.SEPOLIA),
              }),
            } as unknown as Web3Provider,
          });
      });

      it('should show switch to zkEVM network if not connected to immutable-zkevm', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          });
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('be.visible');
      });

      it('should show success when ready to connect pressed and network switched', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          });
        cy.stub(Checkout.prototype, 'switchNetwork')
          .as('switchNetworkStub')
          .resolves({
            provider: mockWeb3Provider as Web3Provider,
            network: {
              name: ChainName.IMTBL_ZKEVM_TESTNET,
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            },
          });
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('be.visible');
        cySmartGet('footer-button').click();
        cySmartGet('success-view').should('be.visible');
      });

      it('should show try again if network switch was rejected', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          });
        cy.stub(Checkout.prototype, 'switchNetwork')
          .as('switchNetworkStub')
          .rejects({});
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('be.visible');
        cySmartGet('footer-button').click();
        cySmartGet('footer-button').should('have.text', 'Try Again');
      });

      it('should show success if try again and switch network succeeds', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          });
        cy.stub(Checkout.prototype, 'switchNetwork')
          .as('switchNetworkStub')
          .onFirstCall()
          .rejects({})
          .onSecondCall()
          .resolves({
            provider: mockWeb3Provider as Web3Provider,
          });
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('be.visible');
        cySmartGet('footer-button').click();
        cySmartGet('footer-button').should('have.text', 'Try Again');
        cySmartGet('footer-button').click();
        cySmartGet('success-view').should('be.visible');
      });

      it('should not show success if try again and switch network fails', () => {
        cy.stub(Checkout.prototype, 'getNetworkInfo')
          .as('getNetworkInfoStub')
          .resolves({
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          });
        cy.stub(Checkout.prototype, 'switchNetwork')
          .as('switchNetworkStub')
          .onFirstCall()
          .rejects({})
          .onSecondCall()
          .rejects({});
        mountConnectWidgetAndGoToReadyToConnect();
        cySmartGet('ready-to-connect').should('be.visible');
        cySmartGet('footer-button').should('have.text', 'Ready to connect');
        cySmartGet('footer-button').click();
        cySmartGet('switch-network-view').should('be.visible');
        cySmartGet('footer-button').click();
        cySmartGet('footer-button').should('have.text', 'Try Again');
        cySmartGet('footer-button').click();
        cySmartGet('footer-button').should('have.text', 'Try Again');
        cySmartGet('success-view').should('not.exist');
      });
    });
  });

  describe('BridgeComingSoon for Passport', () => {
    beforeEach(() => {
      cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({
        provider: {
          provider: {
            on: providerOnStub,
            removeListener: providerRemoveListenerStub,
            isPassport: true,
          },
          getSigner: () => ({
            getAddress: () => Promise.resolve(''),
            getChainId: async () => Promise.resolve(ChainId.IMTBL_ZKEVM_TESTNET),
          }),
        },
      });
      cy.stub(Checkout.prototype, 'createProvider')
        .as('createProviderStub')
        .resolves({
          provider: {
            provider: { isPassport: true },
            getSigner: () => ({
              getAddress: () => Promise.resolve(''),
              getChainId: async () => Promise.resolve(ChainId.IMTBL_ZKEVM_TESTNET),
            }),
          },
        });
    });
  });

  describe('Error Connecting', () => {
    it('should show error view if unable to create provider', () => {
      cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({});
      cy.stub(Checkout.prototype, 'createProvider')
        .as('createProviderStub')
        .rejects({});

      const props = {} as ConnectWidgetParams;
      const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

      mount(
        <ViewContextTestComponent>
          <ConnectWidget
            {...props}
            checkout={checkout}
            config={config}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('wallet-list-metamask').click();
      cySmartGet('simple-text-body__heading').should('have.text', "Something's gone wrong");
      cySmartGet('footer-button').should('have.text', 'Try again');
      cySmartGet('footer-button').click();
      cySmartGet('wallet-list-metamask').should('be.visible');
    });
  });
});
