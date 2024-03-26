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
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { Transaction } from 'lib/clients';
import BridgeWidget from './BridgeWidget';
import mockTransactionPending from './test-components/BridgeTransactionWithdrawalPending.json';
import mockTransactionInProgress from './test-components/BridgeTransactionInProgress.json';

type CypressStub = Cypress.Agent<sinon.SinonStub<any[], any>>;
describe('BridgeWidget', () => {
  // Checkout stubs
  let createProviderStub;
  let checkIsWalletConnectedStub;
  let connectStub;
  let switchNetworkStub;
  let getNetworkInfoStub;
  let getAllBalancesStub;
  let sendTransactionStub;

  // provider stubs
  let mockMetaMaskProvider;
  let mockPassportProvider;
  let getNetworkImmutableZkEVMStub;
  let getNetworkSepoliaStub;
  let estimateGasStub;
  let getFeeDataStub;

  // TokenBridge stubs
  let getFeeStub: CypressStub;
  let getUnsignedApproveBridgeTxStub;
  let getUnsignedBridgeTxStub;
  let getFlowRateWithdrawTxStub;

  const mockMetaMaskAddress = '0x1234567890123456789012345678901234567890';
  const mockPassportAddress = '0x0987654321098765432109876543210987654321';

  beforeEach(() => {
    // const t = (key) => key; // Simplistic translation function that returns the key
    // cy.stub(ReactI18next, 'useTranslation').returns({ t });

    cy.viewport('ipad-2');
    cyIntercept();

    createProviderStub = cy.stub().as('createProviderStub');
    checkIsWalletConnectedStub = cy.stub().as('checkIsWalletConnectedStub');
    connectStub = cy.stub().as('connectStub');
    switchNetworkStub = cy.stub().as('switchNetworkStub');
    getNetworkInfoStub = cy.stub().as('getNetworkInfoStub');
    getAllBalancesStub = cy.stub().as('getAllBalancesStub');
    sendTransactionStub = cy.stub().as('sendTransactionStub');

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
    getFlowRateWithdrawTxStub = cy.stub().as('getFlowRateWithdrawTxStub');

    TokenBridge.prototype.getFee = getFeeStub;
    TokenBridge.prototype.getUnsignedApproveBridgeTx = getUnsignedApproveBridgeTxStub;
    TokenBridge.prototype.getUnsignedBridgeTx = getUnsignedBridgeTxStub;
    TokenBridge.prototype.getFlowRateWithdrawTx = getFlowRateWithdrawTxStub;

    estimateGasStub = cy.stub().as('estimateGasStub');
    getFeeDataStub = cy.stub().as('getFeeDataStub');

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
        getAddress: () => Promise.resolve(mockMetaMaskAddress),
      }),
      estimateGas: estimateGasStub,
      getFeeData: getFeeDataStub,
    };

    mockPassportProvider = {
      provider: {
        isPassport: true,
        on: () => { },
        removeListener: () => { },
      },
      getNetwork: getNetworkImmutableZkEVMStub,
      getSigner: () => ({
        getAddress: () => Promise.resolve(mockPassportAddress),
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
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

  // describe('Next button', () => {
  //   it('should show when from and to wallet are selected', () => {
  //     createProviderStub.returns({ provider: mockMetaMaskProvider });
  //     checkIsWalletConnectedStub.resolves({ isConnected: false });
  //     connectStub.resolves({ provider: mockMetaMaskProvider });
  //
  //     switchNetworkStub.resolves({
  //       provider: mockMetaMaskProvider,
  //       network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
  //     } as SwitchNetworkResult);
  //
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     cySmartGet('wallet-network-selector-from-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
  //     cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
  //
  //     cySmartGet('wallet-network-selector-to-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
  //
  //     cySmartGet('wallet-network-selector-submit-button')
  //       .should('be.visible')
  //       .should('have.text', t('views.WALLET_NETWORK_SELECTION.submitButton.text'));
  //   });
  //
  //   it('should not show when from wallet is not selected', () => {
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     cySmartGet('wallet-network-selector-submit-button').should('not.exist');
  //   });
  //
  //   it('should not show when to wallet is not selected', () => {
  //     createProviderStub.returns({ provider: mockMetaMaskProvider });
  //     checkIsWalletConnectedStub.resolves({ isConnected: false });
  //     connectStub.resolves({ provider: mockMetaMaskProvider });
  //
  //     switchNetworkStub.resolves({
  //       provider: mockMetaMaskProvider,
  //       network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
  //     } as SwitchNetworkResult);
  //
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     cySmartGet('wallet-network-selector-from-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
  //     cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
  //
  //     cySmartGet('wallet-network-selector-to-wallet-select__target').should('be.visible');
  //     cySmartGet('wallet-network-selector-submit-button').should('not.exist');
  //   });
  //
  //   it('should go to bridge from', () => {
  //     createProviderStub.returns({ provider: mockMetaMaskProvider });
  //     checkIsWalletConnectedStub.resolves({ isConnected: false });
  //     connectStub.resolves({ provider: mockMetaMaskProvider });
  //
  //     switchNetworkStub.resolves({
  //       provider: mockMetaMaskProvider,
  //       network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
  //     } as SwitchNetworkResult);
  //
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     cySmartGet('wallet-network-selector-from-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
  //     cySmartGet(`wallet-network-selector-network-list-${ChainId.IMTBL_ZKEVM_TESTNET}`).click();
  //
  //     cySmartGet('wallet-network-selector-to-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
  //     cySmartGet('wallet-network-selector-submit-button').click();
  //     cySmartGet('bridge-form').should('be.visible');
  //   });
  // });

  // describe('Happy path', () => {
  //   it('should complete a withdrawal from Passport to Metamask', () => {
  //     createProviderStub
  //       .onFirstCall()
  //       .returns({ provider: mockPassportProvider })
  //       .onSecondCall()
  //       .returns({ provider: mockMetaMaskProvider });
  //     checkIsWalletConnectedStub.resolves({ isConnected: false });
  //     connectStub
  //       .onFirstCall()
  //       .returns({ provider: mockPassportProvider })
  //       .onSecondCall()
  //       .returns({ provider: mockMetaMaskProvider });
  //     getNetworkInfoStub.resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
  //     getAllBalancesStub.resolves({
  //       balances: [
  //         {
  //           balance: BigNumber.from('2000000000000000000'),
  //           formattedBalance: '2.0',
  //           token: {
  //             name: 'IMX',
  //             symbol: 'IMX',
  //             decimals: 18,
  //           },
  //         },
  //       ],
  //     });
  //
  //     const feeData = {
  //       sourceChainGas: BigNumber.from('10000000000000000'),
  //       imtblFee: BigNumber.from('0'),
  //       bridgeFee: BigNumber.from('200000000000000000'),
  //       totalFees: BigNumber.from('210000000000000000'),
  //     };
  //
  //     getFeeStub.resolves(feeData);
  //
  //     getUnsignedApproveBridgeTxStub.resolves({
  //       contractToApprove: '0xcontract',
  //       unsignedTx: {
  //         to: '0x123456',
  //         from: '0x',
  //       },
  //     });
  //
  //     getUnsignedBridgeTxStub.resolves({
  //       feeData,
  //       unsignedTx: {
  //         to: '0x123456',
  //         from: '0x',
  //       },
  //     });
  //
  //     sendTransactionStub.resolves({
  //       transactionResponse: {
  //         wait: cy.stub().resolves({
  //           transactionHash: '0x123456789',
  //           status: 1,
  //         }),
  //       },
  //     });
  //     switchNetworkStub.resolves({
  //       provider: mockMetaMaskProvider,
  //       network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
  //     } as SwitchNetworkResult);
  //
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     // Wallet & Network Selector
  //     cySmartGet('wallet-network-selector-from-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-from-wallet-list-passport').click();
  //     cySmartGet('wallet-network-selector-to-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-to-wallet-list-metamask').click();
  //     cySmartGet('wallet-network-selector-submit-button').click();
  //
  //     // Bridge form
  //     cySmartGet('bridge-token-select__target').click();
  //     cySmartGet('bridge-token-coin-selector__option-imx').click();
  //     cySmartGet('bridge-amount-text__input').type('1').blur();
  //     cySmartGet('bridge-gas-fee__priceDisplay').should('have.text', 'IMX 0.210000~ USD $ 0.32');
  //     cySmartGet('bridge-form-button').click();
  //
  //     // Review screen
  //     cySmartGet('bridge-review-summary-from-amount__priceDisplay').should('have.text', 'IMX 1~ USD $1.50');
  //     cySmartGet('bridge-review-summary-gas-amount__priceDisplay').should('have.text', 'IMX 0.210000~ USD $0.32');
  //     cySmartGet('bridge-review-summary-from-address__label').should('include.text', '0x0987...4321');
  //     cySmartGet('bridge-review-summary-to-address__label').should('include.text', '0x1234...7890');
  //     cySmartGet('bridge-review-summary__submit-button').click();
  //
  //     // Approvals screen
  //     cySmartGet('wallet-approve-hero').should('be.visible');
  //     cySmartGet('footer-button').click();
  //   });
  //
  //   it('should complete a deposit from Metamask to Passport', () => {
  //     createProviderStub
  //       .onFirstCall()
  //       .returns({ provider: mockMetaMaskProvider })
  //       .onSecondCall()
  //       .returns({ provider: mockPassportProvider });
  //     checkIsWalletConnectedStub.resolves({ isConnected: false });
  //     connectStub
  //       .onFirstCall()
  //       .returns({ provider: mockMetaMaskProvider })
  //       .onSecondCall()
  //       .returns({ provider: mockPassportProvider });
  //     getNetworkInfoStub.resolves({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
  //     getAllBalancesStub.resolves({
  //       balances: [
  //         {
  //           balance: BigNumber.from('2000000000000000000'),
  //           formattedBalance: '2.0',
  //           token: {
  //             name: 'ETH',
  //             symbol: 'ETH',
  //             decimals: 18,
  //           },
  //         },
  //         {
  //           balance: BigNumber.from('2000000000000000000'),
  //           formattedBalance: '2.0',
  //           token: {
  //             name: 'IMX',
  //             symbol: 'IMX',
  //             decimals: 18,
  //           },
  //         },
  //       ],
  //     });
  //
  //     const feeData = {
  //       sourceChainGas: BigNumber.from('100000000000000'),
  //       imtblFee: BigNumber.from('0'),
  //       bridgeFee: BigNumber.from('2000000000000000'),
  //       totalFees: BigNumber.from('2100000000000000'),
  //     };
  //
  //     getFeeStub.resolves(feeData);
  //
  //     getUnsignedApproveBridgeTxStub.resolves({
  //       contractToApprove: '0xcontract',
  //       unsignedTx: {
  //         to: '0x123456',
  //         from: '0x',
  //       },
  //     });
  //
  //     getUnsignedBridgeTxStub.resolves({
  //       feeData,
  //       unsignedTx: {
  //         to: '0x123456',
  //         from: '0x',
  //       },
  //     });
  //
  //     sendTransactionStub.resolves({
  //       transactionResponse: {
  //         wait: cy.stub().resolves({
  //           transactionHash: '0x123456789',
  //           status: 1,
  //         }),
  //       },
  //     });
  //     switchNetworkStub.resolves({
  //       provider: mockMetaMaskProvider,
  //       network: { chainId: ChainId.IMTBL_ZKEVM_TESTNET },
  //     } as SwitchNetworkResult);
  //
  //     mount(
  //       <ViewContextTestComponent theme={widgetConfig.theme}>
  //         <BridgeWidget checkout={checkout} config={widgetConfig} />
  //       </ViewContextTestComponent>,
  //     );
  //
  //     // Wallet & Network Selector
  //     cySmartGet('wallet-network-selector-from-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-from-wallet-list-metamask').click();
  //     cySmartGet(`wallet-network-selector-network-list-${ChainId.SEPOLIA}`).click();
  //     cySmartGet('wallet-network-selector-to-wallet-select__target').click();
  //     cySmartGet('wallet-network-selector-to-wallet-list-passport').click();
  //     cySmartGet('wallet-network-selector-submit-button').click();
  //
  //     // Bridge form
  //     cySmartGet('bridge-token-select__target').click();
  //     cySmartGet('bridge-token-coin-selector__option-eth').click();
  //     cySmartGet('bridge-amount-text__input').type('0.1').blur();
  //     cySmartGet('bridge-gas-fee__priceDisplay').should('have.text', 'ETH 0.002100~ USD $ 4.20');
  //     cySmartGet('bridge-form-button').click();
  //
  //     // // Review screen
  //     cySmartGet('bridge-review-summary-from-amount__priceDisplay').should('have.text', 'ETH 0.1~ USD $200.00');
  //     cySmartGet('bridge-review-summary-gas-amount__priceDisplay').should('have.text', 'ETH 0.002100~ USD $4.20');
  //     cySmartGet('bridge-review-summary-from-address__label').should('include.text', '0x1234...7890');
  //     cySmartGet('bridge-review-summary-to-address__label').should('include.text', '0x0987...4321');
  //     cySmartGet('bridge-review-summary__submit-button').click();
  //
  //     // // Approvals screen
  //     cySmartGet('wallet-approve-hero').should('be.visible');
  //     cySmartGet('footer-button').click();
  //   });
  // });

  describe('Transactions', () => {
    it('should show a withdrawal transaction with action required when withdrawal is ready for claiming', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );
      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();

      // assert that withdrawal transaction item is there
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}`).should('exist');
      // assert that action button is there
      // eslint-disable-next-line max-len
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`).should('exist');
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-message`)
        .should('have.text', 'Action required to receive your coins');
    });

    it('should show a withdrawal transaction with delay text when withdrawal is not ready for claiming', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };

      cy.clock(new Date('2024-01-15T00:00:00Z')); // stub date now
      const mockDateIn1Hour = new Date('2024-01-15T01:00:00.000Z'); // 1 hour after date now

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateIn1Hour.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );
      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();

      // assert that withdrawal transaction item is there
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}`).should('exist');

      // assert that action button is not shown
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`)
        .should('not.exist');

      // assert it includes the withdrawal delay text
      cySmartGet(`transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-message`)
        .should(
          'include.text',
          'This move has been paused, please return ',
        );
    });

    it('should show transaction items with withdrawal pending status first', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };

      cy.clock(new Date('2024-01-15T00:00:00Z')); // stub date now
      const mockDateIn1Hour = new Date('2024-01-15T01:00:00.000Z'); // 1 hour after date now

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateIn1Hour.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionInProgress as Transaction,
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );
      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();

      cySmartGet('move-transaction-list').children().first()
        .should(
          'have.attr',
          'data-testid',
          `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}`,
        );
      cySmartGet('move-transaction-list').children().first().next()
        .should(
          'have.attr',
          'data-testid',
          `transaction-item-${mockTransactionInProgress.blockchain_metadata.transaction_hash}`,
        );
    });
  });

  describe('Claiming Withdrawals', () => {
    it('should move to claim withdrawal screen with MetaMask when action required button is clicked', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.resolves(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves({
        lastBaseFeePerGas: BigNumber.from(20e9), // 20 gwei,
        maxFeePerGas: BigNumber.from(40e9), // 40 gwei,
        maxPriorityFeePerGas: BigNumber.from(1.5e9), // 1.5 gwei,
      });
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledOnceWith', {
        provider: mockMetaMaskProvider,
        transaction: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });
    });

    it('should show the not enough eth withdrawal drawer when gas is more than eth balance', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.00001',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0ximx',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.resolves(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves({
        lastBaseFeePerGas: BigNumber.from(20e9), // 20 gwei,
        maxFeePerGas: BigNumber.from(40e9), // 40 gwei,
        maxPriorityFeePerGas: BigNumber.from(1.5e9), // 1.5 gwei,
      });
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('not.have.been.called');

      cySmartGet('not-enough-eth-drawer').should('be.visible');
      cySmartGet('not-enough-eth-drawer-retry-button').click();

      cySmartGet('@connectStub').should(
        'have.been.calledWith',
        { provider: mockMetaMaskProvider, requestWalletPermissions: true },
      );
      cySmartGet('@getAllBalancesStub').should('have.been.calledThrice');
      cySmartGet('@estimateGasStub').should('have.been.calledTwice');
      cySmartGet('@getFeeDataStub').should('have.been.calledTwice');
      cySmartGet('@sendTransactionStub').should('not.have.been.called');
    });

    it('should request connection to MM first if provider is Passport', () => {
      createProviderStub
        .onFirstCall()
        .resolves({ provider: mockPassportProvider })
        .onSecondCall()
        .resolves({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .resolves({ provider: mockPassportProvider })
        .onSecondCall()
        .resolves({ provider: mockMetaMaskProvider });

      getAllBalancesStub
        .onFirstCall().resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000'),
              formattedBalance: '0.00001',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'native',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0ximx',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
              },
            },
          ],
        })
        .onSecondCall()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('1000000000000000000'),
              formattedBalance: '1',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'native',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0ximx',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
              },
            },
          ],
        });

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.resolves(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves({
        lastBaseFeePerGas: BigNumber.from(20e9), // 20 gwei,
        maxFeePerGas: BigNumber.from(40e9), // 40 gwei,
        maxPriorityFeePerGas: BigNumber.from(1.5e9), // 1.5 gwei,
      });
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );
      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockPassportAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.called');
    });

    it('should first request MM, then not enough eth, then retry with enough and call transaction', () => {
      createProviderStub
        .onFirstCall()
        .resolves({ provider: mockPassportProvider })
        .onSecondCall()
        .resolves({ provider: mockMetaMaskProvider })
        .onThirdCall()
        .resolves({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .onFirstCall()
        .resolves({ provider: mockPassportProvider })
        .onSecondCall()
        .resolves({ provider: mockMetaMaskProvider })
        .onThirdCall()
        .resolves({ provider: mockMetaMaskProvider });

      getAllBalancesStub
        .onFirstCall().resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000'),
              formattedBalance: '0.00001',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'native',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0ximx',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
              },
            },
          ],
        })
        .onSecondCall()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000'),
              formattedBalance: '0.00001',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'native',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0ximx',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
              },
            },
          ],
        })
        .onThirdCall()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('1000000000000000000'),
              formattedBalance: '1',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'native',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0ximx',
              },
            },
            {
              balance: BigNumber.from('2000000000000000000'),
              formattedBalance: '2.0',
              token: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
              },
            },
          ],
        });

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.resolves(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves({
        lastBaseFeePerGas: BigNumber.from(20e9), // 20 gwei,
        maxFeePerGas: BigNumber.from(40e9), // 40 gwei,
        maxPriorityFeePerGas: BigNumber.from(1.5e9), // 1.5 gwei,
      });
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );
      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockPassportAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('not.have.been.called');

      cySmartGet('not-enough-eth-drawer').should('be.visible');
      cySmartGet('not-enough-eth-drawer-retry-button').click();

      cySmartGet('@connectStub').should(
        'have.been.calledWith',
        { provider: mockMetaMaskProvider, requestWalletPermissions: true },
      );
      cySmartGet('@getAllBalancesStub').should('have.been.calledThrice');
      cySmartGet('@estimateGasStub').should('have.been.calledTwice');
      cySmartGet('@getFeeDataStub').should('have.been.calledTwice');
      cySmartGet('@sendTransactionStub').should('have.been.calledWith', {
        provider: mockMetaMaskProvider,
        transaction: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });
    });

    it('should still sendTransaction if there was a problem getting feeData', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.00001',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0ximx',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      });

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.rejects(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves(null);
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.called');
    });

    it('should still sendTransaction if there was a problem getting L1 balances to do gas check', () => {
      createProviderStub
        .returns({ provider: mockMetaMaskProvider });
      checkIsWalletConnectedStub.resolves({ isConnected: false });
      connectStub
        .returns({ provider: mockMetaMaskProvider });

      getAllBalancesStub.onFirstCall().resolves({
        balances: [
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.00001',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: 'native',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0ximx',
            },
          },
          {
            balance: BigNumber.from('2000000000000000000'),
            formattedBalance: '2.0',
            token: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              address: '0x3B2d8A1931736Fc321C24864BceEe981B11c3c57',
            },
          },
        ],
      }).onSecondCall().rejects({});

      getFlowRateWithdrawTxStub.resolves({
        pendingWithdrawal: {
          canWithdraw: true,
          withdrawer: '0xf364930c779c6674472e131898c4b3f7aaccf1b7',
          recipient: '0xe98b61832248c698085ffbc4313deb465be857e7',
          amount: BigNumber.from('10000000'),
        },
        unsignedTx: {
          to: '0xL1ContractAddress',
          from: mockMetaMaskAddress,
          data: 'some-data',
        },
      });

      estimateGasStub.rejects(BigNumber.from('90458')); // withdrawal gas limit estimate
      getFeeDataStub.resolves({
        lastBaseFeePerGas: BigNumber.from(20e9), // 20 gwei,
        maxFeePerGas: BigNumber.from(40e9), // 40 gwei,
        maxPriorityFeePerGas: BigNumber.from(1.5e9), // 1.5 gwei,
      });
      sendTransactionStub.resolves({}); // transaction response

      const mockBridgeTransactionsResponse: { result: Transaction[] } = { result: [] };
      cy.clock(new Date('2024-01-16T00:00:00Z')); // stub date now to day after
      const mockDateYesterday = new Date('2024-01-15T00:00:00.000Z');

      mockTransactionPending.details.current_status.withdrawal_ready_at = mockDateYesterday.toISOString();
      mockBridgeTransactionsResponse.result = [
        mockTransactionPending as Transaction,
      ];

      cy.intercept(
        // eslint-disable-next-line max-len
        `https://api.sandbox.immutable.com/checkout/v1/transactions?from_address=${mockMetaMaskAddress}&tx_type=bridge`,
        mockBridgeTransactionsResponse,
      );

      mount(
        <ViewContextTestComponent theme={widgetConfig.theme}>
          <BridgeWidget checkout={checkout} config={widgetConfig} />
        </ViewContextTestComponent>,
      );

      cySmartGet('move-transactions-button').click();
      cySmartGet('transactions-connect-wallet-button').click();
      cySmartGet('select-wallet-drawer-wallet-list-metamask').click();
      cySmartGet('@getAllBalancesStub').should('have.been.calledOnce');
      cySmartGet(
        `transaction-item-${mockTransactionPending.blockchain_metadata.transaction_hash}-action-button`,
      ).click();
      cySmartGet('claim-withdrawal').should('exist');
      cySmartGet('claim-withdrawal-continue-button').click();

      cySmartGet('@getAllBalancesStub').should('have.been.calledTwice');
      cySmartGet('@estimateGasStub').should('have.been.calledOnce');
      cySmartGet('@getFeeDataStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.called');
    });
  });
});
