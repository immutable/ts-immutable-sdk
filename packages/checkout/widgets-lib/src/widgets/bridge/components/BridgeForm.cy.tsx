import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { BigNumber, utils } from 'ethers';
import { Checkout, CheckoutErrorType, GasEstimateType } from '@imtbl/checkout-sdk';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { BridgeForm } from './BridgeForm';

describe('Bridge Form', () => {
  let bridgeState;
  let cryptoConversions;
  beforeEach(() => {
    cy.viewport('ipad-2');
    cy.intercept('https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia', []);
    cy.intercept('https://zkevm-rpc.dev.x.immutable.com/', []);

    cryptoConversions = new Map<string, number>([['eth', 1800], ['imx', 0.75]]);
    bridgeState = {
      checkout: new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
      }),
      tokenBridge: new TokenBridge({}),
      provider: {
        getSigner: () => ({
          getAddress: async () => Promise.resolve('0x123'),
        }),
        getFeeData: () => ({
          maxFeePerGas: BigNumber.from(100),
          maxPriorityFeePerGas: BigNumber.from(100),
          gasPrice: BigNumber.from(100),
        }),
      } as unknown as Web3Provider,
      providerPreference: null,
      network: null,
      exchange: null,
      tokenBalances: [
        {
          balance: BigNumber.from('100000000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          balance: BigNumber.from('100000000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        },
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0',
          token: {
            name: 'RandomAllowedToken',
            symbol: 'RANDA',
            decimals: 18,
            address: '0x11111e7C23978C3cAEC3C3548E3D615c11111111',
          },
        },
      ],
      supportedTopUps: null,
      allowedTokens: [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '',
        },
        {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        },
        {
          name: 'RandomAllowedToken',
          symbol: 'RANDA',
          decimals: 18,
          address: '0x11111e7C23978C3cAEC3C3548E3D615c11111111',
        },
        {
          name: 'SecondAllowedToken',
          symbol: 'SEC',
          decimals: 18,
          address: '0x22222e7C23978C3cAEC3C3548E3D615c22222222',
        },
      ],
    };

    cy.stub(TokenBridge.prototype, 'getFee').as('getFeeStub')
      .resolves({
        bridgeable: true,
        feeAmount: BigNumber.from(1),
      });
  });

  describe('Bridge Form submit', () => {
    it('should submit bridge and make required sdk calls', () => {
      cy.stub(TokenBridge.prototype, 'getUnsignedApproveBridgeTx').as('getUnsignedApproveBridgeTxStub')
        .resolves({
          required: true,
          unsignedTx: {},
        });

      cy.stub(TokenBridge.prototype, 'getUnsignedDepositTx').as('getUnsignedDepositTxStub')
        .resolves({
          required: true,
          unsignedTx: {},
        });

      cy.stub(Checkout.prototype, 'gasEstimate').as('gasEstimateStub')
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          bridgeFee: {
            estimatedAmount: utils.parseEther('0.0001'),
          },
          gasEstimate: {
            estimatedAmount: utils.parseEther('0.0001'),
          },
          bridgeable: true,
        });

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
              status: 1,
            }),
          },
        });

      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={bridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <BridgeForm
            testId="bridge-form"
          />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-Ethereum').click();
      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();

      cySmartGet('@gasEstimateStub').should('have.been.called');
      cy.wait(1000);

      cySmartGet('bridge-form-button').click();

      // assert on viewDispatch to have dispatched an action for BridgeWidgetViews.APPROVE_ERC20
    });

    it('should submit bridge and skip approval if not required', () => {
      cy.stub(TokenBridge.prototype, 'getUnsignedApproveBridgeTx').as('getUnsignedApproveBridgeTxStub')
        .resolves({
          required: false,
        });

      cy.stub(TokenBridge.prototype, 'getUnsignedDepositTx').as('getUnsignedDepositTxStub')
        .resolves({
          required: true,
          unsignedTx: {},
        });

      cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
        .resolves({
          transactionResponse: {
            wait: () => ({
              status: 1,
            }),
          },
        });

      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={bridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <BridgeForm
            testId="bridge-form"
          />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-coin-selector__option-ETH-Ethereum').click();
      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
        depositorAddress: '0x123',
        token: 'NATIVE',
        depositAmount: utils.parseUnits('0.1', 18),
      });

      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
        depositorAddress: '0x123',
        recipientAddress: '0x123',
        token: 'NATIVE',
        depositAmount: utils.parseUnits('0.1', 18),
      });

      cySmartGet('@sendTransactionStub')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          provider: bridgeState.provider,
          transaction: {},
        });
    });

    describe('when approval transaction is not required and user rejected signing the bridge transaction', () => {
      beforeEach(() => {
        cy.stub(TokenBridge.prototype, 'getUnsignedApproveBridgeTx').as('getUnsignedApproveBridgeTxStub')
          .resolves({
            required: false,
          });

        cy.stub(TokenBridge.prototype, 'getUnsignedDepositTx').as('getUnsignedDepositTxStub')
          .resolves({
            required: true,
            unsignedTx: {},
          });

        mount(
          <BridgeWidgetTestComponent
            initialStateOverride={bridgeState}
            cryptoConversionsOverride={cryptoConversions}
          >
            <BridgeForm
              testId="bridge-form"
            />
          </BridgeWidgetTestComponent>,
        );
      });

      it('show error state bottom drawer', () => {
        cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
          .rejects({
            type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
          });

        cySmartGet('bridge-token-select__target').click();
        cySmartGet('bridge-token-coin-selector__option-ETH-Ethereum').click();
        cySmartGet('bridge-amount-text__input').type('0.1');
        cySmartGet('bridge-amount-text__input').blur();
        cySmartGet('bridge-form-button').click();

        cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
          depositorAddress: '0x123',
          token: 'NATIVE',
          depositAmount: utils.parseUnits('0.1', 18),
        });

        cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
          depositorAddress: '0x123',
          recipientAddress: '0x123',
          token: 'NATIVE',
          depositAmount: utils.parseUnits('0.1', 18),
        });

        cySmartGet('@sendTransactionStub')
          .should('have.been.calledOnce')
          .should('have.been.calledWith', {
            provider: bridgeState.provider,
            transaction: {},
          });

        cySmartGet('transaction-rejected-heading').should('be.visible');
        cySmartGet('transaction-rejected-cancel-button').should('be.visible');
      });
    });
  });
});
