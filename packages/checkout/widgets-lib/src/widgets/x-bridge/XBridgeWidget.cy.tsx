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

describe('XBridgeWidget', () => {
  let getNetworkImmutableZkEVMStub;
  let getNetworkSepoliaStub;
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    getNetworkSepoliaStub = cy.stub().resolves({ chainId: ChainId.SEPOLIA });

    getNetworkImmutableZkEVMStub = cy.stub().resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
  });

  const mockMetaMaskProvider = {
    provider: {
      isMetaMask: true,
    },
    getNetwork: () => (getNetworkSepoliaStub),
  };

  const mockPassportProvider = {
    provider: {
      isPassport: true,
    },
    getNetwork: () => (getNetworkImmutableZkEVMStub),
  };

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

  it('should show xBridgeWalletForm and select MetaMask and ImmutablezkEVM', () => {
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
  });

  it('should show xBridgeWalletForm and select Passport and ImmutablezkEVM is selected by default', () => {
    cy.stub(Checkout.prototype, 'createProvider').returns({ provider: mockPassportProvider });
    cy.stub(Checkout.prototype, 'checkIsWalletConnected').resolves({ isConnected: false });
    cy.stub(Checkout.prototype, 'connect').resolves({ provider: mockPassportProvider });

    mount(<XBridgeWidget checkout={checkout} config={widgetConfig} />);

    cySmartGet('bridge-wallet-form-from-wallet-select__target').click();
    cySmartGet('bridge-wallet-form-wallet-list-metamask').should('be.visible');
    cySmartGet('bridge-wallet-form-wallet-list-passport').should('be.visible');

    cy.wait(100);
    cySmartGet(`bridge-wallet-form-wallet-list-${WalletProviderName.METAMASK}`).click();

    cySmartGet(`bridge-wallet-form-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
      .should('exist');
  });
});
