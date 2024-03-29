import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import {
  ChainId, ChainName, Checkout, SwapWidgetParams, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import SwapWidget from './SwapWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { quotesProcessor } from './functions/FetchQuote';
import { ConnectionStatus } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { NATIVE } from '../../lib';

describe('SwapWidget tests', () => {
  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
      populateTransaction: (tx) => Promise.resolve(tx),
    }),
    getNetwork: async () => ({
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      name: ChainName.IMTBL_ZKEVM_TESTNET,
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: mockProvider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: mockProvider,
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: ChainName.IMTBL_ZKEVM_TESTNET,
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        isSupported: true,
        nativeCurrency: {
          symbol: 'eth',
        },
      });

    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('getTokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',
          },
          {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: NATIVE,
          },
        ],
      });
  });

  const params = {} as SwapWidgetParams;
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  describe('SwapWidget Gas Balance Checks', () => {
    it('should show not enough imx drawer when user has no imx balance on load', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('0'),
              formattedBalance: '0',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            {...params}
            config={config}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').should('be.visible');
      cySmartGet('not-enough-gas-add-imx-button').should('be.visible');
      cySmartGet('not-enough-gas-adjust-amount-button').should('not.exist');

      cySmartGet('not-enough-gas-cancel-button').click();
      cySmartGet('not-enough-gas-add-imx-button').should('not.exist');
    });

    it('should show top up view when add imx coins pressed', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('0'),
              formattedBalance: '0',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            {...params}
            config={config}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').should('be.visible');
      cySmartGet('not-enough-gas-add-imx-button').should('be.visible');
      cySmartGet('not-enough-gas-adjust-amount-button').should('not.exist');

      cySmartGet('not-enough-gas-add-imx-button').click();
      cySmartGet('top-up-view').should('be.visible');
    });

    it('should load swap form if user has enough for gas', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('100000000000001'),
              formattedBalance: '1',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            {...params}
            config={config}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
    });

    it('should show top up view with coins if getAllBalances succeed at least once', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .rejects()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('0'),
              formattedBalance: '0',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            {...params}
            config={config}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('not-enough-gas-add-imx-button').click();
      cySmartGet('top-up-view').should('be.visible');
    });
  });

  describe('SwapWidget Form', () => {
    let getAllBalancesStub: any;

    beforeEach(() => {
      getAllBalancesStub = cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('50000000000000000000'),
              formattedBalance: '0.5',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',
              },
            },
            {
              balance: BigNumber.from('90000000000000000000'),
              formattedBalance: '20',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
                address: NATIVE,
              },
            },
            {
              balance: BigNumber.from('100000000'),
              formattedBalance: '100',
              token: {
                name: 'USDCoin',
                symbol: 'USDC',
                decimals: 6,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              },
            },
          ],
        });
    });

    it('should show swap widget on mount', () => {
      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            {...params}
            config={config}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-text-form-text').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-text-form-text').should('be.visible');
    });

    it('should show balances after getAllBalances failure', () => {
      getAllBalancesStub.rejects()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000000000'),
              formattedBalance: '0.1',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            config={config}
            {...params}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-native')
        .should('exist');
    });

    it('should show error screen after getAllBalances unrecoverable failure', () => {
      getAllBalancesStub
        .onFirstCall()
        .rejects({ data: { code: 500 } })
        .onSecondCall()
        .resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000000000'),
              formattedBalance: '0.1',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        });

      mount(
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <SwapWidget
            config={config}
            {...params}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('error-view').should('be.visible');
      cySmartGet('footer-button').click();

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-native')
        .should('exist');
    });

    it('should set fromTokens to user balances filtered by the token allow list', () => {
      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <SwapWidget
            config={config}
            {...params}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .should('exist');
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-native')
        .should('exist');
      cySmartGet('fromTokenInputs-select-form-USDC-USDCoin').should('not.exist');
    });

    describe('Swap Form Submit', () => {
      const mockQuoteFromAmountIn = {
        quote: {
          amount: {
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
            },
            value: BigNumber.from('100000000000000000'),
          },
          amountWithMaxSlippage: {
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
            value: BigNumber.from('10000000000000000'),
          },
          slippage: 10,
        },
        swap: {
          gasFeeEstimate: {
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
            value: BigNumber.from('10000000000000000'),
          },
          transaction: {
            to: 'toSwapAddress',
            from: 'fromSwapAddress',
          },
        },
        approval: {
          gasFeeEstimate: {
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
            value: BigNumber.from('10000000000000000'),
          },
          transaction: {
            to: 'toApprovalAddress',
            from: 'fromApprovalAddress',
          },
        },
      };
      let fromAmountInStub;
      beforeEach(() => {
        fromAmountInStub = cy.stub(quotesProcessor, 'fromAmountIn')
          .as('fromAmountInStub')
          .resolves(mockQuoteFromAmountIn);

        mount(
          <ViewContextTestComponent>
            <ConnectLoaderTestComponent
              initialStateOverride={connectLoaderState}
            >
              <SwapWidget {...params} config={config} />
            </ConnectLoaderTestComponent>
          </ViewContextTestComponent>,
        );
      });

      describe('No approval txn needed', () => {
        it('should submit swap and show success when no approval txn needed', () => {
          cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
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

          // Set up so no approval transaction is needed
          fromAmountInStub.resolves({ ...mockQuoteFromAmountIn, approval: null });

          cySmartGet('fromTokenInputs-select-form-select__target').click();
          cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
            .click();

          cySmartGet('toTokenInputs-select-form-select__target').click();
          cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-native').click();

          cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
          cySmartGet('@fromAmountInStub').should('have.been.called');
          cySmartGet('swap-button').click();

          cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
          cySmartGet('loading-view').should('be.visible');
          cy.wait(1000);
          cySmartGet('success-box').should('be.visible');
        });

        it('should submit swap and show fail view', () => {
          cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
            .onFirstCall()
            .resolves({
              transactionResponse: {
                wait: () => new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({
                      status: 0,
                    });
                  }, 1000);
                }),
              },
            });

          // Set up so no approval transaction is needed
          fromAmountInStub.resolves({ ...mockQuoteFromAmountIn, approval: null });

          cySmartGet('fromTokenInputs-select-form-select__target').click();
          cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
            .click();

          cySmartGet('toTokenInputs-select-form-select__target').click();
          // eslint-disable-next-line max-len
          cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-native').click();

          cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
          cySmartGet('@fromAmountInStub').should('have.been.called');
          cySmartGet('swap-button').click();

          cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
          cySmartGet('loading-view').should('be.visible');
          cy.wait(1000);
          cySmartGet('failure-box').should('be.visible');
        });
      });

      describe('swap flow with approval needed', () => {
        it('should go through Approve ERC20 flow, submit swap and succeed', () => {
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

          cySmartGet('fromTokenInputs-select-form-select__target').click();
          cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
            .click();

          cySmartGet('toTokenInputs-select-form-select__target').click();
          // eslint-disable-next-line max-len
          cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-native').click();

          cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
          cySmartGet('@fromAmountInStub').should('have.been.called');
          cySmartGet('swap-button').click();

          cySmartGet('simple-text-body__heading').should(
            'have.text',
            'You\'ll be asked to set a spending cap for this transaction',
          );
          cySmartGet('simple-text-body__body').should(
            'include.text',
            'Input at least 0.1 ETH for this transaction and future transactions, then follow the prompts.',
          );
          cySmartGet('footer-button').should('have.text', 'Got it');

          // click button for Approval transaction
          cySmartGet('footer-button').click();
          cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
          cySmartGet('@sendTransactionStub')
            .should(
              'have.been.calledWith',
              {
                provider: mockProvider,
                transaction: { from: 'fromApprovalAddress', to: 'toApprovalAddress' },
              },
            );
          cySmartGet('loading-view').should('be.visible');
          cy.wait(1000);

          cySmartGet('simple-text-body__heading').should(
            'have.text',
            'Now you\'ll just need to confirm the transaction',
          );
          cySmartGet('simple-text-body__body').should(
            'include.text',
            'Follow the prompts in your wallet.',
          );
          cySmartGet('footer-button').should('have.text', 'Okay');

          // click button for Swap transaction
          cySmartGet('footer-button').click();
          cySmartGet('@sendTransactionStub').should('have.been.calledTwice');
          cySmartGet('@sendTransactionStub').should('have.been.calledWith', {
            provider: mockProvider,
            transaction: { from: 'fromSwapAddress', to: 'toSwapAddress' },
          });

          cySmartGet('loading-view').should('be.visible');

          cy.wait(1000);
          cySmartGet('success-box').should('be.visible');
        });

        it('should go through Approve ERC20 flow, submit swap and fail', () => {
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
                      status: 0,
                    });
                  }, 1000);
                }),
              },
            });

          cySmartGet('fromTokenInputs-select-form-select__target').click();
          cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
            .click();

          cySmartGet('toTokenInputs-select-form-select__target').click();
          // eslint-disable-next-line max-len
          cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-native').click();

          cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
          cySmartGet('@fromAmountInStub').should('have.been.called');

          cySmartGet('swap-button').click();

          cySmartGet('simple-text-body__heading').should(
            'have.text',
            'You\'ll be asked to set a spending cap for this transaction',
          );
          cySmartGet('simple-text-body__body').should(
            'include.text',
            'Input at least 0.1 ETH for this transaction and future transactions, then follow the prompts.',
          );
          cySmartGet('footer-button').should('have.text', 'Got it');

          // click button for Approval transaction
          cySmartGet('footer-button').click();

          cySmartGet('@fromAmountInStub').should('have.been.called');
          cySmartGet('@sendTransactionStub').should('have.been.calledOnce');
          cySmartGet('@sendTransactionStub')
            .should(
              'have.been.calledWith',
              {
                provider: mockProvider,
                transaction: { from: 'fromApprovalAddress', to: 'toApprovalAddress' },
              },
            );
          cySmartGet('loading-view').should('be.visible');
          cy.wait(1000);

          cySmartGet('simple-text-body__heading').should(
            'have.text',
            'Now you\'ll just need to confirm the transaction',
          );
          cySmartGet('simple-text-body__body').should(
            'include.text',
            'Follow the prompts in your wallet.',
          );
          cySmartGet('footer-button').should('have.text', 'Okay');

          // click button for Swap transaction
          cySmartGet('footer-button').click();
          cySmartGet('@sendTransactionStub').should('have.been.calledTwice');
          cySmartGet('@sendTransactionStub').should('have.been.calledWith', {
            provider: mockProvider,
            transaction: { from: 'fromSwapAddress', to: 'toSwapAddress' },
          });

          cySmartGet('loading-view').should('be.visible');

          cy.wait(1000);
          cySmartGet('failure-box').should('be.visible');
        });
      });
    });
  });
});
