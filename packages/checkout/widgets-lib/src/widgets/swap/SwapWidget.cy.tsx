/* eslint-disable @typescript-eslint/naming-convention */
import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { quotesProcessor } from './functions/FetchQuote';
import { text } from '../../resources/text/textConfig';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';

describe('SwapWidget tests', () => {
  beforeEach(() => {
    cyIntercept();

    cy.viewport('ipad-2');
  });

  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
    }),
    getNetwork: async () => ({
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      name: 'Immutable zkEVM Testnet',
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  beforeEach(() => {
    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: mockProvider,
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: 'Immutable zkEVM Testnet',
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
        isSupported: true,
        nativeCurrency: {
          symbol: 'eth',
        },
      });

    cy.stub(Checkout.prototype, 'getAllBalances')
      .as('getAllBalancesStub')
      .resolves({
        balances: [
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              address: '',
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

    cy.intercept(
      {
        method: 'GET',
        path: '/v1/fiat/conversion*',
      },
      {
        ethereum: { usd: 2000.0 },
        'usd-coin': { usd: 1.0 },
        'immutable-x': { usd: 1.5 },
      },
    ).as('cryptoFiatStub');
  });

  const params = {
    walletProvider: 'metamask',
  } as SwapWidgetParams;
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  it('should show swap widget on mount', () => {
    mount(
      <SwapWidget
        params={params}
        config={config}
        web3Provider={mockProvider}
      />,
    );

    cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
    cySmartGet('fromTokenInputs-text-form-text').should('be.visible');
    cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
    cySmartGet('toTokenInputs-text-form-text').should('be.visible');
  });

  it('should set fromTokens to user balances filtered by the token allow list', () => {
    mount(
      <SwapWidget
        config={config}
        params={params}
        web3Provider={mockProvider}
      />,
    );

    cySmartGet('fromTokenInputs-select-form-select__target').click();
    cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').should('exist');
    cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
      .should('exist');
    cySmartGet('fromTokenInputs-select-form-USDC-USDCoin').should('not.exist');
  });

  describe('swap submit', () => {
    const mockQuoteFromAmountIn = {
      quote: {
        amount: {
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '',
          },
          value: BigNumber.from('112300000000000012'),
        },
        amountWithMaxSlippage: {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
          value: BigNumber.from('112300000000000032'),
        },
        slippage: 10,
      },
      swap: {
        gasFeeEstimate: {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
          value: BigNumber.from('112300000000000045'),
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
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
          value: BigNumber.from('112300000000000045'),
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
        <BiomeCombinedProviders>
          <SwapWidget params={params} config={config} web3Provider={mockProvider} />
        </BiomeCombinedProviders>,
      );
    });

    describe('No approval txn needed', () => {
      it('should submit swap and show success when no approval txn needed', () => {
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
          });

        // Set up so no approval transaction is needed
        fromAmountInStub.resolves({ ...mockQuoteFromAmountIn, approval: null });

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

        cySmartGet('toTokenInputs-select-form-select__target').click();
        // eslint-disable-next-line max-len
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('@fromAmountInStub').should('have.been.called');
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
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

        cySmartGet('toTokenInputs-select-form-select__target').click();
        // eslint-disable-next-line max-len
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('@fromAmountInStub').should('have.been.called');
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

        const { approveSwap, approveSpending } = text.views[SwapWidgetViews.APPROVE_ERC20];

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

        cySmartGet('toTokenInputs-select-form-select__target').click();
        // eslint-disable-next-line max-len
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('simple-text-body__heading').should('have.text', approveSpending.content.heading);
        cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[0]);
        cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[1]);
        cySmartGet('footer-button').should('have.text', approveSpending.footer.buttonText);

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

        cySmartGet('simple-text-body__heading').should('have.text', approveSwap.content.heading);
        cySmartGet('simple-text-body__body').should('include.text', approveSwap.content.body[0]);
        cySmartGet('footer-button').should('have.text', approveSwap.footer.buttonText);

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

        const { approveSwap, approveSpending } = text.views[SwapWidgetViews.APPROVE_ERC20];

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

        cySmartGet('toTokenInputs-select-form-select__target').click();
        // eslint-disable-next-line max-len
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('simple-text-body__heading').should('have.text', approveSpending.content.heading);
        cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[0]);
        cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[1]);
        cySmartGet('footer-button').should('have.text', approveSpending.footer.buttonText);

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

        cySmartGet('simple-text-body__heading').should('have.text', approveSwap.content.heading);
        cySmartGet('simple-text-body__body').should('include.text', approveSwap.content.body[0]);
        cySmartGet('footer-button').should('have.text', approveSwap.footer.buttonText);

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
