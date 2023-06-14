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

describe('SwapWidget tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  beforeEach(() => {
    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('dss'),
          }),
          getNetwork: async () => ({
            // FIXME: stop hardcoding this, only doing because dev net is reset
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'Immutable zkEVM Testnet',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          // FIXME: stop hardcoding this, only doing because dev net is reset
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
  });

  const params = {
    providerPreference: 'metamask',
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
    beforeEach(() => {
      cy.stub(quotesProcessor, 'fromAmountIn')
        .as('fromAmountInStub')
        .resolves({
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
          approveTransaction: {},
          transaction: {},
        });

      mount(
        <BiomeCombinedProviders>
          <SwapWidget params={params} config={config} />
        </BiomeCombinedProviders>,
      );
    });

    it('should submit swap and show success', () => {
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

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

      cySmartGet('toTokenInputs-select-form-select__target').click();
      // eslint-disable-next-line max-len
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
      cySmartGet('fromTokenInputs-text-form-text__input').blur();

      cySmartGet('swap-button').click();

      cySmartGet('@fromAmountInStub').should('have.been.called');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');
      cySmartGet('loading-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('success-box').should('be.visible');
    });

    it('should submit swap and show fail view', () => {
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
                  status: 0,
                });
              }, 1000);
            }),
          },
        });

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').click();

      cySmartGet('toTokenInputs-select-form-select__target').click();
      // eslint-disable-next-line max-len
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();

      cySmartGet('fromTokenInputs-text-form-text__input').type('0.1');
      cySmartGet('fromTokenInputs-text-form-text__input').blur();

      cySmartGet('swap-button').click();

      cySmartGet('@fromAmountInStub').should('have.been.called');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');
      cySmartGet('loading-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('failure-box').should('be.visible');
    });
  });
});
