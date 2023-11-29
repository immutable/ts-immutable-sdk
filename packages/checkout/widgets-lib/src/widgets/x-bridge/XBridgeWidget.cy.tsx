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
  let createProviderStub;
  let checkIsWalletConnectedStub;
  let connectStub;
  let switchNetworkStub;

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    createProviderStub = cy.stub().as('createProviderStub');
    checkIsWalletConnectedStub = cy.stub().as('checkIsWalletConnectedStub');
    connectStub = cy.stub().as('connectStub');
    switchNetworkStub = cy.stub().as('switchNetworkStub');

    Checkout.prototype.createProvider = createProviderStub;
    Checkout.prototype.checkIsWalletConnected = checkIsWalletConnectedStub;
    Checkout.prototype.connect = connectStub;
    Checkout.prototype.switchNetwork = switchNetworkStub;

    getNetworkSepoliaStub = cy.stub().as('getNetworkSepoliaStub').resolves({ chainId: ChainId.SEPOLIA });

    getNetworkImmutableZkEVMStub = cy.stub().as('getNetworkImmutableZkEVMStub')
      .resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });

    mockMetaMaskProvider = {
      provider: {
        isMetaMask: true,
      },
      getNetwork: getNetworkSepoliaStub,
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
    it('should show from wallet and network selector and select MetaMask and ImmutablezkEVM', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should select from ImmutablezkEVM by default when selecting Passport', () => {
      createProviderStub.returns({ provider: mockPassportProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockPassportProvider });

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).click();

      cySmartGet(`bridge-wallet-form-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should not make getNetwork call if the from wallet provider is Passport', () => {
      createProviderStub.returns({ provider: mockPassportProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockPassportProvider });

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).click();

      cySmartGet(`bridge-wallet-form-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet(`bridge-wallet-form-network-${ChainId.IMTBL_ZKEVM_TESTNET}-button`).click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cy.get('@getNetworkImmutableZkEVMStub').should('not.have.been.called');
    });

    it('should not re-create from wallet web3provider if the from wallet selection is the same as existing', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');

      // make same selection again in from wallet
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .click('left'); // had to specify left to click the wallet part

      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).click();
    });
  });

  describe('To wallet selector', () => {
    it('should always show MetaMask in the to wallet selector', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-from-wallet-list-passport').should('be.visible');

      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-to-wallet-list-passport').should('not.exist');
    });

    it('should show Passport in the to wallet list when, from wallet is MetaMask and from network is L1', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.SEPOLIA },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-from-wallet-list-passport').should('be.visible');

      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').should('be.visible');
      cySmartGet('bridge-wallet-form-to-wallet-list-passport').should('be.visible');
    });

    it('should clear to wallet selection when from wallet selection changes wallets', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .resolves({ provider: mockMetaMaskProvider })
        .onSecondCall()
        .resolves({ provider: mockPassportProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.SEPOLIA },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();
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
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.PASSPORT}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('be.visible');
    });

    it('should clear to wallet selection when from wallet selection changes networks', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .as('connectStub')
        .onFirstCall()
        .resolves({ provider: mockMetaMaskProvider })
        .onSecondCall()
        .resolves({ provider: { ...mockMetaMaskProvider, getNetwork: getNetworkImmutableZkEVMStub } });

      switchNetworkStub
        .onFirstCall()
        .resolves({
          provider: mockMetaMaskProvider,
          network: { chainId: ChainId.SEPOLIA },
        } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet(`bridge-wallet-form-from-wallet-list-${WalletProviderName.METAMASK}`).click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.SEPOLIA}`).click();

      cySmartGet('@createProviderStub').should('have.been.calledOnce');
      cySmartGet('@checkIsWalletConnectedStub').should('have.been.calledOnce');
      cySmartGet('@connectStub').should('have.been.calledOnce');

      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('bridge-wallet-form-to-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-to-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('not.exist');

      cySmartGet(`bridge-wallet-form-network-${ChainId.SEPOLIA}-button`)
        .click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('be.visible');
    });
  });

  describe('Next button', () => {
    it('should show when from and to wallet are selected', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();
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
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

      cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
      cySmartGet('bridge-wallet-form-from-wallet-list-metamask').click();
      cySmartGet(`bridge-wallet-form-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('bridge-wallet-form-to-wallet-select__target').should('be.visible');
      cySmartGet('bridge-wallet-form-submit-button').should('not.exist');
    });
  });
});
