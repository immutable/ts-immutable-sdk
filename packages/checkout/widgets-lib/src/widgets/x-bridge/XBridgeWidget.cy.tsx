import { mount } from 'cypress/react18';
import { beforeEach, cy } from 'local-cypress';
import { cyIntercept, cySmartGet } from 'lib/testUtils';
import {
  ChainId, Checkout, SwitchNetworkResult, WalletProviderName, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { Passport } from '@imtbl/passport';
import { XBridgeWidget } from './XBridgeWidget';
import { text } from '../../resources/text/textConfig';

describe('XBridgeWidget', () => {
  let getNetworkImmutableZkEVMStub;
  let getNetworkSepoliaStub;
  let mockMetaMaskProvider;
  let mockPassportProvider;

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    getNetworkSepoliaStub = cy.stub().resolves({ chainId: ChainId.SEPOLIA });

    getNetworkImmutableZkEVMStub = cy.stub().as('getNetworkImmutableZkEVMStub')
      .resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });

    mockMetaMaskProvider = {
      provider: {
        isMetaMask: true,
      },
      getNetwork: () => getNetworkSepoliaStub,
    };

    mockPassportProvider = {
      provider: {
        isPassport: true,
      },
      getNetwork: getNetworkImmutableZkEVMStub,
    };
  });

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
    passport: {} as any as Passport,
  });
  const widgetConfig: StrongCheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
    isBridgeEnabled: true,
    isOnRampEnabled: true,
    isSwapEnabled: true,
  };

  describe('From wallet and network selector', () => {
    it('should show from network selector and select MetaMask and ImmutablezkEVM', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cy.wait(100);
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cy.wait(100);
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should show from network selector and select Passport, then ImmutablezkEVM is selected by default', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockPassportProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockPassportProvider });

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cy.wait(100);
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.METAMASK}`).click();

      cySmartGet(`bridge-wallet-form-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should not make getNetwork call if the from wallet provider is Passport', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockPassportProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockPassportProvider });

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cy.wait(100);
      cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.PASSPORT}`).click();

      cySmartGet(`bridge-wallet-form-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet(`bridge-wallet-form-network-${ChainId.IMTBL_ZKEVM_TESTNET}-button`).click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cy.get('@getNetworkImmutableZkEVMStub').should('not.have.been.called');
    });
  });

  describe('To wallet selector', () => {
    it('should always show MetaMask in the to wallet selector', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-wallet-list-passport').should('be.visible');

      cy.wait(100);
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cy.wait(100);
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-to-wallet-list-passport').should('not.exist');
    });

    it('should only show Passport in the to wallet list when, from wallet is MetaMask and from network is L1', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.SEPOLIA },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-wallet-list-passport').should('be.visible');

      cy.wait(100);
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cy.wait(100);
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-to-wallet-list-passport').should('be.visible');
    });

    it('should clear to wallet selection when from wallet selection gets re-selected', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.SEPOLIA },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('not.exist');

      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('be.visible');
    });
  });

  describe('Next button', () => {
    it('should show when from and to wallet are selected', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').click();

      cySmartGet('bridge-wallet-form-submit-button')
        .should('be.visible')
        .should('have.text', text.views.BRIDGE_WALLET_SELECTION.submitButton.text);
    });

    it('should not show when from wallet is not selected', () => {
      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-submit-button').should('not.exist');
    });

    it('should not show when to wallet is not selected', () => {
      cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockMetaMaskProvider });
      cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
      cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockMetaMaskProvider });

      cy.stub(Checkout.prototype, 'switchNetwork').resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('be.visible');
      cySmartGet('bridge-wallet-form-submit-button').should('not.exist');
    });
  });
});
