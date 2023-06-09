/* eslint-disable @typescript-eslint/naming-convention */
import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { Checkout, CheckoutErrorType } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CompletionStatus, TokenBridge } from '@imtbl/bridge-sdk';
import { BiomeCombinedProviders } from '@biom3/react';
import { cySmartGet } from '../../lib/testUtils';
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
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  let connectStubReturnValue;
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  beforeEach(() => {
    connectStubReturnValue = {
      provider: {
        getSigner: () => ({
          getAddress: () => Promise.resolve('0xwalletAddress'),
        }),
        getNetwork: async () => ({
          chainId: 1,
          name: 'Ethereum',
        }),
        provider: {
          request: async () => null,
        },
      },
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
          address: '',
        },
      },
    };

    cy
      .stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves(connectStubReturnValue);

    cy.stub(Checkout.prototype, 'getAllBalances')
      .as('getAllBalancesStub')
      .resolves({
        balances: [
          {
            balance: BigNumber.from('1000000000000000000'),
            formattedBalance: '0.1',
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

    cy
      .stub(Checkout.prototype, 'switchNetwork')
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
            chainId: 1,
            name: 'Ethereum',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            chainId: 137,
            name: 'Immutable zkEVM Testnet',
            nativeCurrency: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
            },
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

  describe('Bridge Widget render', () => {
    it('should show bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
        />,
      );
      cySmartGet('bridge-view').should('exist');
      cySmartGet('bridge-form').should('be.visible');
      cySmartGet('header-title').should('have.text', header.title);
      cySmartGet('bridge-form-content-heading').should('have.text', content.title);
      cySmartGet('close-button').should('be.visible');

      cySmartGet('bridge-token-select__target').should('have.text', 'ETH');
      cySmartGet('bridge-amount-text__input').should('have.value', '');
    });

    it('should set up bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
        />,
      );
      cySmartGet('@connectStub').should('have.been.called');
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
    });

    it('should submit the bridge and show success when status is 1', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          status: CompletionStatus.SUCCESS,
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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');

      cySmartGet('move-in-progress-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('success-box').should('be.visible');
    });

    it('should submit the bridge and show fail screen if wait for deposit does not return success', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');

      cySmartGet('move-in-progress-view').should('be.visible');
      cy.wait(1000);
      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when status is not 1 when submitting approval transaction', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('not.have.been.called');
      cySmartGet('@sendTransactionStub').should('have.been.calledOnce');

      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when status is not 1 when submitting the transaction', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');

      cySmartGet('failure-box').should('be.visible');
    });

    it('should submit the bridge and show fail when recoverable error and refill form when retry', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');

      cySmartGet('failure-box').should('be.visible');
      cySmartGet('status-action-button').click();

      cySmartGet('bridge-token-select__target').should('have.text', 'ETH');
      cySmartGet('bridge-amount-text__input').should('have.value', '0.1');
    });

    it('should submit the bridge and show shared error screen when unknown error', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;

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
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-ETH').click();

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce');
      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce');
      cySmartGet('@sendTransactionStub').should('have.been.calledTwice');

      cySmartGet('simple-text-body__heading').contains("Something's gone wrong");
    });
  });
});
