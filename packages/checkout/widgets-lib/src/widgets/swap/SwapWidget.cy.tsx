/* eslint-disable @typescript-eslint/naming-convention */
import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { BiomeCombinedProviders } from '@biom3/react';
import { cySmartGet } from '../../lib/testUtils';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { quotesProcessor } from './functions/FetchQuote';
import { text } from '../../resources/text/textConfig';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';

const overrides: any = {
  rpcURL: 'https://rpc.node',
  commonRoutingTokens: [
    {
      chainId: 11155111,
      address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
      decimals: 18,
      symbol: 'FUN',
    },
  ],
  exchangeContracts: {
    multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
  },
  nativeToken: {
    chainId: 11155111,
  },
};

describe('SwapWidget tests', () => {
  beforeEach(() => {
    cy.intercept('https://checkout-api.sandbox.immutable.com/v1/config', { dex: { overrides } });
    cy.intercept('https://rpc.node', {});
    cy.viewport('ipad-2');
  });

  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('dss'),
    }),
    getNetwork: async () => ({
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      name: 'Immutable zkEVM Testnet',
    }),
    provider: {
      request: async () => null,
    },
  };
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

    const fiatPricingValue = {
      ethereum: { usd: 2000.0 },
      'usd-coin': { usd: 1.0 },
      'immutable-x': { usd: 1.5 },
    };

    const coinList = [
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Etherum',
      },
    ];

    cy.intercept(
      {
        method: 'GET',
        path: '/api/v3/coins/list*',
      },
      coinList,
    ).as('coinListStub');

    cy.intercept(
      {
        method: 'GET',
        path: '/api/v3/simple/price*',
      },
      fiatPricingValue,
    ).as('cryptoFiatStub');
  });

  const params = {
    providerName: 'metamask',
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
      info: {
        quote: {
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '',
          },
          amount: BigNumber.from('112300000000000012'),
        },
        quoteWithMaxSlippage: {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
          amount: BigNumber.from('112300000000000032'),
        },
        gasFeeEstimate: {
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
          amount: BigNumber.from('112300000000000045'),
        },
        slippage: 10,
      },
      approveTransaction: {
        from: 'approval',
        to: 'approval',
      },
      transaction: {
        from: 'swap',
        to: 'swap',
      },
    };
    let fromAmountInStub;
    beforeEach(() => {
      fromAmountInStub = cy.stub(quotesProcessor, 'fromAmountIn')
        .as('fromAmountInStub')
        .resolves(mockQuoteFromAmountIn);

      mount(
        <BiomeCombinedProviders>
          <SwapWidget params={params} config={config} />
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
        fromAmountInStub.resolves({ ...mockQuoteFromAmountIn, approveTransaction: null });

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
        fromAmountInStub.resolves({ ...mockQuoteFromAmountIn, approveTransaction: null });

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
              transaction: { from: 'approval', to: 'approval' },
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
          transaction: { from: 'swap', to: 'swap' },
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
              transaction: { from: 'approval', to: 'approval' },
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
          transaction: { from: 'swap', to: 'swap' },
        });

        cySmartGet('loading-view').should('be.visible');

        cy.wait(1000);
        cySmartGet('failure-box').should('be.visible');
      });
    });
  });
});
