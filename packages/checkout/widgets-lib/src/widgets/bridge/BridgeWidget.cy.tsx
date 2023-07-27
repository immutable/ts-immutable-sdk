/* eslint-disable @typescript-eslint/naming-convention */
import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import {
  ChainId,
  Checkout, CheckoutErrorType, GasEstimateType, TokenAmountEstimate,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CompletionStatus, TokenBridge } from '@imtbl/bridge-sdk';
import { BiomeCombinedProviders } from '@biom3/react';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import {
  BridgeWidget,
  BridgeWidgetParams,
} from './BridgeWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { text } from '../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';

describe('Bridge Widget tests', () => {
  const { header, content } = text.views[BridgeWidgetViews.BRIDGE];
  let connectStubReturnValue;
  const config: StrongCheckoutWidgetsConfig = {
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
      chainId: ChainId.ETHEREUM,
      name: 'Ethereum',
    }),
    getFeeData: () => ({
      maxFeePerGas: BigNumber.from(100),
      maxPriorityFeePerGas: BigNumber.from(100),
      gasPrice: BigNumber.from(100),
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  beforeEach(() => {
    cy.viewport('ipad-2');

    cyIntercept({
      cryptoFiatOverrides: {
        conversion: {
          ethereum: { usd: 2000.0 },
          'usd-coin': { usd: 1.0 },
          'immutable-x': { usd: 1.5 },
        },
      },
    });

    connectStubReturnValue = {
      provider: mockProvider,
      network: {
        chainId: ChainId.ETHEREUM,
        name: 'Ethereum',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
          address: '',
        },
      },
    };

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves(connectStubReturnValue);

    cy.stub(Checkout.prototype, 'getAllBalances')
      .as('getAllBalancesStub')
      .resolves({
        balances: [
          {
            balance: BigNumber.from('1000000000000000000'),
            formattedBalance: '1',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '',
              icon: '123',
            },
          },
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              icon: '123',
            },
          },
        ],
      });

    cy.stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub')
      .resolves(connectStubReturnValue);

    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('getTokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '',
          },
          {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        ],
      });

    cy.stub(Checkout.prototype, 'getNetworkAllowList')
      .as('getNetworkAllowListStub')
      .resolves({
        networks: [
          {
            chainId: ChainId.ETHEREUM,
            name: 'Ethereum',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'Immutable zkEVM Testnet',
            nativeCurrency: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        isSupported: true,
        nativeCurrency: {
          symbol: 'eth',
        },
      });

    // Had to stub JsonRpcProvider as it makes calls on creation
    // Can resolve to any network for these tests as we also stub
    // TokenBridge which is at a higher level and which uses the JsonRpcProvider
    cy.stub(JsonRpcProvider.prototype, 'detectNetwork').resolves({ name: '', chainId: '0x1' });

    cy.stub(Checkout.prototype, 'gasEstimate')
      .as('gasEstimateStub')
      .resolves({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        bridgeFee: {
          estimatedAmount: BigNumber.from('0'),
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: 'NATIVE',
          },
        } as TokenAmountEstimate,
        gasEstimate: {
          estimatedAmount: BigNumber.from('10000000000000'),
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: 'NATIVE',
          },
        } as TokenAmountEstimate,
        bridgeable: true,
      });
  });

  describe('Bridge Widget render', () => {
    it('should show bridge widget on mount', () => {
      const params = {} as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
          web3Provider={mockProvider}
        />,
      );

      cySmartGet('bridge-view').should('exist');
      cySmartGet('bridge-form').should('be.visible');
      cySmartGet('header-title').should('have.text', header.title);
      cySmartGet('bridge-form-content-heading').should('have.text', content.title);
      cySmartGet('close-button').should('be.visible');
    });

    it('should set up bridge widget on mount', () => {
      const params = {} as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
          web3Provider={mockProvider}
        />,
      );
      cySmartGet('@getAllBalancesStub').should('have.been.called');
      cySmartGet('@getTokenAllowListStub').should('have.been.called');
    });
  });

  describe('Bridge Submit', () => {
    beforeEach(() => {
      cy.stub(TokenBridge.prototype, 'getUnsignedApproveBridgeTx').as('getUnsignedApproveBridgeTxStub')
        .resolves({
          required: true,
          unsignedTx: {},
        });

      cy.stub(TokenBridge.prototype, 'getUnsignedDepositTx').as('getUnsignedDepositTxStub')
        .resolves({
          unsignedTx: {},
        });

      cy.stub(TokenBridge.prototype, 'getFee').as('getFeeStub')
        .resolves({
          bridgeable: true,
          feeAmount: BigNumber.from(1),
        });
    });

    it('should submit the bridge and show success when status is 1', () => {
      const { approveSpending, approveBridge } = text.views[BridgeWidgetViews.APPROVE_ERC20];
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .onFirstCall()
        .resolves({
          transactionResponse: {
            wait: () => new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  status: 1,
                });
              }, 1000);
            }),
          },
        })
        .onSecondCall()
        .resolves({
          transactionResponse: {
            wait: () => new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  status: 1,
                });
              }, 1000);
            }),
          },
        });

      cy.stub(TokenBridge.prototype, 'waitForDeposit').as('waitForDepositStub')
        .resolves(new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: CompletionStatus.SUCCESS,
              transactionHash: '0x123245',
            });
          }, 1000);
        }));

      mount(
        <BridgeWidget
          config={{
            environment: Environment.SANDBOX,
            theme: WidgetTheme.DARK,
            isBridgeEnabled: true,
            isSwapEnabled: true,
            isOnRampEnabled: true,
          }}
          params={params}
          web3Provider={mockProvider}
        />,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');

      cySmartGet('simple-text-body__heading').should('have.text', approveSpending.content.heading);
      cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[0]);
      cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[1]);
      cySmartGet('footer-button').should('have.text', approveSpending.footer.buttonText);

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
      cy.wait(1000);

      cySmartGet('simple-text-body__heading').should('have.text', approveBridge.content.heading);
      cySmartGet('simple-text-body__body').should('include.text', approveBridge.content.body[0]);
      cySmartGet('simple-text-body__body').should('include.text', approveBridge.content.body[1]);
      cySmartGet('footer-button').should('have.text', approveBridge.footer.buttonText);

      cySmartGet('footer-button').click();
      cySmartGet('move-in-progress-view').should('be.visible');

      cy.wait(1000);
      cySmartGet('success-box').should('be.visible');
    });

    it('should submit the bridge and show fail screen if wait for deposit does not return success', () => {
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .onFirstCall()
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 1,
            }),
          },
        })
        .onSecondCall()
        .resolves({
          transactionResponse: {
            wait: () => new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  status: 1,
                });
              }, 1000);
            }),
          },
        });

      cy.stub(TokenBridge.prototype, 'waitForDeposit').as('waitForDepositStub')
        .resolves({
          status: CompletionStatus.FAILED,
        });

      mount(
        <BiomeCombinedProviders>
          <BridgeWidget
            config={{
              environment: Environment.SANDBOX,
              theme: WidgetTheme.DARK,
              isBridgeEnabled: true,
              isSwapEnabled: true,
              isOnRampEnabled: true,
            }}
            params={params}
            web3Provider={mockProvider}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
      cy.wait(1000);

      cySmartGet('footer-button').click();
      cySmartGet('move-in-progress-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when status is not 1 when submitting approval transaction', () => {
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 0,
            }),
          },
        });

      mount(
        <BiomeCombinedProviders>
          <BridgeWidget
            config={{
              environment: Environment.SANDBOX,
              theme: WidgetTheme.DARK,
              isBridgeEnabled: true,
              isSwapEnabled: true,
              isOnRampEnabled: true,
            }}
            params={params}
            web3Provider={mockProvider}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
      cy.wait(1000);

      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when status is not 1 when submitting the transaction', () => {
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .onFirstCall()
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 1,
            }),
          },
        })
        .onSecondCall()
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 0,
            }),
          },
        });

      mount(
        <BiomeCombinedProviders>
          <BridgeWidget
            config={{
              environment: Environment.SANDBOX,
              theme: WidgetTheme.DARK,
              isBridgeEnabled: true,
              isSwapEnabled: true,
              isOnRampEnabled: true,
            }}
            params={params}
            web3Provider={mockProvider}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();

      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when recoverable error and refill form when retry', () => {
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .onFirstCall()
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 1,
            }),
          },
        })
        .onSecondCall()
        .rejects({
          type: CheckoutErrorType.INSUFFICIENT_FUNDS,
        });

      mount(
        <BiomeCombinedProviders>
          <BridgeWidget
            config={{
              environment: Environment.SANDBOX,
              theme: WidgetTheme.DARK,
              isBridgeEnabled: true,
              isSwapEnabled: true,
              isOnRampEnabled: true,
            }}
            params={params}
            web3Provider={mockProvider}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();

      cySmartGet('failure-box').should('be.visible');
      cySmartGet('status-action-button').click();

      cySmartGet('bridge-token-select__target').should('have.text', 'IMX');
      cySmartGet('bridge-amount-text__input').should('have.value', '0.1');
    });

    it('should submit the bridge and show shared error screen when unknown error', () => {
      const params = {} as BridgeWidgetParams;

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .onFirstCall()
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 1,
            }),
          },
        })
        .rejects({});

      mount(
        <BiomeCombinedProviders>
          <BridgeWidget
            config={{
              environment: Environment.SANDBOX,
              theme: WidgetTheme.DARK,
              isBridgeEnabled: true,
              isSwapEnabled: true,
              isOnRampEnabled: true,
            }}
            params={params}
            web3Provider={mockProvider}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');

      cySmartGet('footer-button').click();
      cySmartGet('simple-text-body__heading').contains("Something's gone wrong");
    });
  });
});
