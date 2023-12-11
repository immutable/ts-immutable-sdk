import { mount } from 'cypress/react18';
import { beforeEach, cy } from 'local-cypress';
import { cyIntercept, cySmartGet } from 'lib/testUtils';
import {
  ChainId, Checkout, SwitchNetworkResult, WalletProviderName, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { Passport } from '@imtbl/passport';
import { BigNumber } from 'ethers';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { WidgetContainer } from 'components/WidgetContainer/WidgetContainer';
import { XBridgeWidget } from './XBridgeWidget';
import { text } from '../../resources/text/textConfig';

type CypressStub = Cypress.Agent<sinon.SinonStub<any[], any>>;
describe('XBridgeWidget', () => {
  // Checkout stubs
  let getNetworkImmutableZkEVMStub;
  let getNetworkSepoliaStub;
  let mockMetaMaskProvider;
  let mockPassportProvider;
  let createProviderStub;
  let checkIsWalletConnectedStub;
  let connectStub;
  let switchNetworkStub;
  let getNetworkInfoStub;
  let getAllBalancesStub;
  let sendTransactionStub;

  // TokenBridge stubs
  let getFeeStub: CypressStub;
  let getUnsignedApproveBridgeTxStub;
  let getUnsignedBridgeTxStub;

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    createProviderStub = cy.stub().as('createProviderStub');
    checkIsWalletConnectedStub = cy.stub().as('checkIsWalletConnectedStub');
    connectStub = cy.stub().as('connectStub');
    switchNetworkStub = cy.stub().as('switchNetworkStub');
    getNetworkInfoStub = cy.stub().as('getNetworkInfoStub');
    getAllBalancesStub = cy.stub().as('getAllBalancesStub');
    sendTransactionStub = cy.stub().as('sendTransaction');

    Checkout.prototype.createProvider = createProviderStub;
    Checkout.prototype.checkIsWalletConnected = checkIsWalletConnectedStub;
    Checkout.prototype.connect = connectStub;
    Checkout.prototype.switchNetwork = switchNetworkStub;
    Checkout.prototype.getNetworkInfo = getNetworkInfoStub;
    Checkout.prototype.getAllBalances = getAllBalancesStub;
    Checkout.prototype.sendTransaction = sendTransactionStub;

    getFeeStub = cy.stub().as('getFeeStub');
    getUnsignedApproveBridgeTxStub = cy.stub().as('getUnsignedApproveBridgeTxStub');
    getUnsignedBridgeTxStub = cy.stub().as('getUnsignedBridgeTxStub');

    TokenBridge.prototype.getFee = getFeeStub;
    TokenBridge.prototype.getUnsignedApproveBridgeTx = getUnsignedApproveBridgeTxStub;
    TokenBridge.prototype.getUnsignedBridgeTx = getUnsignedBridgeTxStub;

    getNetworkSepoliaStub = cy.stub().as('getNetworkSepoliaStub').resolves({ chainId: ChainId.SEPOLIA });

    getNetworkImmutableZkEVMStub = cy.stub().as('getNetworkImmutableZkEVMStub')
      .resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });

    mockMetaMaskProvider = {
      provider: {
        isMetaMask: true,
        on: () => { },
        removeListener: () => { },
      },
      getNetwork: getNetworkSepoliaStub,
      getSigner: () => ({
        getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890'),
      }),
    };

    mockPassportProvider = {
      provider: {
        isPassport: true,
        on: () => { },
        removeListener: () => { },
      },
      getNetwork: getNetworkImmutableZkEVMStub,
      getSigner: () => ({
        getAddress: () => Promise.resolve('0x0987654321098765432109876543210987654321'),
      }),
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
    // it should auto fill fromWeb3Provider if web3provider is injected in

    it('should show from wallet and network selector and select MetaMask and ImmutablezkEVM', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();

      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should select from ImmutablezkEVM by default when selecting Passport', () => {
      createProviderStub.returns({ provider: mockPassportProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockPassportProvider });

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).click();

      cySmartGet(`wallet-network-selector-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
    });

    it('should not make getNetwork call if the from wallet provider is Passport', () => {
      createProviderStub.returns({ provider: mockPassportProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockPassportProvider });

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).should('be.visible');
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).should('be.visible');

      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).click();

      cySmartGet(`wallet-network-selector-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet(`wallet-network-selector-network-${ChainId.IMTBL_ZKEVM_TESTNET}-button`).click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cy.get('@getNetworkImmutableZkEVMStub').should('not.have.been.called');
    });

    it('should correctly select from wallet and address when from wallet changes', () => {
      createProviderStub
        .onFirstCall()
        .returns({ provider: mockPassportProvider })
        .onSecondCall()
        .returns({ provider: mockMetaMaskProvider });

      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .returns({ provider: mockPassportProvider })
        .onSecondCall()
        .returns({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      // Choose from Passport
      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');

      // Then change from wallet MetaMask
      cySmartGet(`wallet-network-selector-${WalletProviderName.PASSPORT}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .click('left');
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
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

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').should('be.visible');
      cySmartGet('wallet-network-selector-from-wallet-list-passport').should('be.visible');

      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();

      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').should('be.visible');
      cySmartGet('wallet-network-selector-to-wallet-list-passport').should('not.exist');
    });

    it('should show Passport in the to wallet list when, from wallet is MetaMask and from network is L1', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.SEPOLIA },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').should('be.visible');
      cySmartGet('wallet-network-selector-from-wallet-list-passport').should('be.visible');

      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();

      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).should('be.visible');
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).should('be.visible');

      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').should('be.visible');
      cySmartGet('wallet-network-selector-to-wallet-list-passport').should('be.visible');
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

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet('wallet-network-selector-to-wallet-select__target').should('not.exist');

      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.PASSPORT}`).click();

      cySmartGet('wallet-network-selector-to-wallet-select__target').should('be.visible');
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

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet(`wallet-network-selector-from-wallet-list-${WalletProviderName.METAMASK}`).click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).click();

      cySmartGet('@createProviderStub').should('have.been.calledOnce');
      cySmartGet('@checkIsWalletConnectedStub').should('have.been.calledOnce');
      cySmartGet('@connectStub').should('have.been.calledOnce');

      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.SEPOLIA}-button-wrapper`)
        .should('exist');

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-${WalletProviderName.METAMASK}-${ChainId.IMTBL_ZKEVM_TESTNET}-button-wrapper`)
        .should('exist');
      cySmartGet('wallet-network-selector-to-wallet-select__target').should('not.exist');

      cySmartGet(`wallet-network-selector-network-${ChainId.SEPOLIA}-button`)
        .click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('wallet-network-selector-to-wallet-select__target').should('be.visible');
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

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();

      cySmartGet('wallet-network-selector-submit-button')
        .should('be.visible')
        .should('have.text', text.views.WALLET_NETWORK_SELECTION.submitButton.text);
    });

    it('should not show when from wallet is not selected', () => {
      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-submit-button').should('not.exist');
    });

    it('should not show when to wallet is not selected', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('wallet-network-selector-to-wallet-select__target').should('be.visible');
      cySmartGet('wallet-network-selector-submit-button').should('not.exist');
    });

    it('should go to bridge from', () => {
      createProviderStub.returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub.resolves({ provider: mockMetaMaskProvider });

      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();

      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
      cySmartGet('wallet-network-selector-submit-button').click();
      cySmartGet('bridge-form').should('be.visible');
    });
  });

  describe('Happy path', () => {
    it('should complete a withdrawal from Passport to Metamask', () => {
      createProviderStub
        .onFirstCall()
        .returns({ provider: mockPassportProvider })
        .onSecondCall()
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .returns({ provider: mockPassportProvider })
        .onSecondCall()
        .returns({ provider: mockMetaMaskProvider });
      getNetworkInfoStub.resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
      });

      const feeData = {
        sourceChainGas: BigNumber.from('10000000000000000'),
        imtblFee: BigNumber.from('0'),
        bridgeFee: BigNumber.from('200000000000000000'),
        totalFees: BigNumber.from('210000000000000000'),
      };

      getFeeStub.resolves(feeData);

      getUnsignedApproveBridgeTxStub.resolves({
        contractToApprove: '0xcontract',
        unsignedTx: {
          to: '0x123456',
          from: '0x',
        },
      });

      getUnsignedBridgeTxStub.resolves({
        feeData,
        unsignedTx: {
          to: '0x123456',
          from: '0x',
        },
      });

      sendTransactionStub.resolves({
        transactionResponse: {
          wait: cy.stub().resolves({
            transactionHash: '0x123456789',
            status: 1,
          }),
        },
      });
      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      // Wallet & Network Selector
      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-passport').click();
      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
      cySmartGet('wallet-network-selector-submit-button').click();

      // Bridge form
      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx').click();
      cySmartGet('bridge-amount-text__input').type('1').blur();
      cySmartGet('bridge-gas-fee__priceDisplay__price').should('have.text', 'IMX 0.210000');
      cySmartGet('bridge-form-button').click();

      // Review screen
      cySmartGet('bridge-review-summary-from-amount__priceDisplay__price').should('have.text', 'IMX 1');
      cySmartGet('bridge-review-summary-from-amount__priceDisplay__fiatAmount').should('have.text', '~ USD $1.50');
      cySmartGet('bridge-review-summary-gas-amount__priceDisplay__price').should('have.text', 'IMX 0.210000');
      cySmartGet('bridge-review-summary-gas-amount__priceDisplay__fiatAmount').should('have.text', '~ USD $0.32');
      cySmartGet('bridge-review-summary-from-address__label').should('include.text', '0x0987...4321');
      cySmartGet('bridge-review-summary-to-address__label').should('include.text', '0x1234...7890');
      cySmartGet('bridge-review-summary__submit-button').click();

      // Approvals screen
      cySmartGet('wallet-approve-hero').should('be.visible');
      cySmartGet('footer-button').click();
    });

    it('should complete a deposit from Metamask to Passport', () => {
      createProviderStub
        .onFirstCall()
        .returns({ provider: mockMetaMaskProvider })
        .onSecondCall()
        .returns({ provider: mockPassportProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .returns({ provider: mockMetaMaskProvider })
        .onSecondCall()
        .returns({ provider: mockPassportProvider });
      getNetworkInfoStub.resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
      });

      const feeData = {
        sourceChainGas: BigNumber.from('100000000000000'),
        imtblFee: BigNumber.from('0'),
        bridgeFee: BigNumber.from('2000000000000000'),
        totalFees: BigNumber.from('2100000000000000'),
      };

      getFeeStub.resolves(feeData);

      getUnsignedApproveBridgeTxStub.resolves({
        contractToApprove: '0xcontract',
        unsignedTx: {
          to: '0x123456',
          from: '0x',
        },
      });

      getUnsignedBridgeTxStub.resolves({
        feeData,
        unsignedTx: {
          to: '0x123456',
          from: '0x',
        },
      });

      sendTransactionStub.resolves({
        transactionResponse: {
          wait: cy.stub().resolves({
            transactionHash: '0x123456789',
            status: 1,
          }),
        },
      });
      switchNetworkStub.resolves({
        provider: mockMetaMaskProvider,
        network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
      } as SwitchNetworkResult);

      mount(
        <WidgetContainer id="test" config={widgetConfig}>
          <XBridgeWidget checkout={checkout} config={widgetConfig} />
        </WidgetContainer>,
      );

      // Wallet & Network Selector
      cySmartGet('wallet-network-selector-from-wallet-select__target').click();
      cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
      cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).click();
      cySmartGet('wallet-network-selector-to-wallet-select__target').click();
      cySmartGet('wallet-network-selector-to-wallet-list-passport').click();
      cySmartGet('wallet-network-selector-submit-button').click();

      // Bridge form
      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-eth').click();
      cySmartGet('bridge-amount-text__input').type('0.1').blur();
      cySmartGet('bridge-gas-fee__priceDisplay__price').should('have.text', 'ETH 0.002100');
      cySmartGet('bridge-form-button').click();

      // // Review screen
      cySmartGet('bridge-review-summary-from-amount__priceDisplay__price').should('have.text', 'ETH 0.1');
      cySmartGet('bridge-review-summary-from-amount__priceDisplay__fiatAmount').should('have.text', '~ USD $200.00');
      cySmartGet('bridge-review-summary-gas-amount__priceDisplay__price').should('have.text', 'ETH 0.002100');
      cySmartGet('bridge-review-summary-gas-amount__priceDisplay__fiatAmount').should('have.text', '~ USD $4.20');
      cySmartGet('bridge-review-summary-from-address__label').should('include.text', '0x1234...7890');
      cySmartGet('bridge-review-summary-to-address__label').should('include.text', '0x0987...4321');
      cySmartGet('bridge-review-summary__submit-button').click();

      // // Approvals screen
      cySmartGet('wallet-approve-hero').should('be.visible');
      cySmartGet('footer-button').click();
    });
  });
});
