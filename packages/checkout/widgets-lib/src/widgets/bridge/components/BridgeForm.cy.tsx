/* eslint-disable @typescript-eslint/naming-convention */
import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { BigNumber, utils } from 'ethers';
import {
  ChainId, Checkout, CheckoutErrorType, GasEstimateType,
} from '@imtbl/checkout-sdk';
import { TokenBridge } from '@imtbl/bridge-sdk';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { BridgeForm } from './BridgeForm';
import { text } from '../../../resources/text/textConfig';

describe('Bridge Form', () => {
  let bridgeState;
  let cryptoConversions;
  const imxAddress = '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff';
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

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
        getNetwork: async () => ({
          chainId: ChainId.SEPOLIA,
          name: 'Sepolia',
        }),
      } as unknown as Web3Provider,
      walletProvider: null,
      network: {
        chainId: ChainId.SEPOLIA,
        name: 'Sepolia',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
          address: '',
        },
      },
      exchange: null,
      tokenBalances: [
        {
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1',
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
            address: imxAddress,
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
          address: imxAddress,
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

    cy.stub(Checkout.prototype, 'gasEstimate').as('gasEstimateStub')
      .resolves({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
        bridgeFee: {
          estimatedAmount: utils.parseEther('0.0001'),
        },
        gasFee: {
          estimatedAmount: utils.parseEther('0.0001'),
        },
        bridgeable: true,
      });
  });

  it('should use name or name and address for option id', () => {
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

    cySmartGet('bridge-token-select__target__defaultLabel').should('have.text', 'Select coin');
    cySmartGet('bridge-token-select__target').click();
    cySmartGet(`bridge-token-coin-selector__option-imx-${imxAddress}`).should('exist');
    cySmartGet(`bridge-token-coin-selector__option-imx-${imxAddress}`).should('exist');
  });

  it('should set defaults when provided and ignore casing on token address', () => {
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
    mount(
      <BridgeWidgetTestComponent
        initialStateOverride={bridgeState}
        cryptoConversionsOverride={cryptoConversions}
      >
        <BridgeForm
          testId="bridge-form"
          defaultFromContractAddress="0xF57E7E7c23978c3caec3c3548e3d615c346e79Ff"
          defaultAmount="10"
        />
      </BridgeWidgetTestComponent>,
    );
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
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();
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
      cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();
      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text__input').blur();
      cySmartGet('bridge-form-button').click();

      cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
        depositorAddress: '0x123',
        token: imxAddress,
        depositAmount: utils.parseUnits('0.1', 18),
      });

      cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
        depositorAddress: '0x123',
        recipientAddress: '0x123',
        token: imxAddress,
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
        cySmartGet('bridge-token-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff').click();
        cySmartGet('bridge-amount-text__input').type('0.1');
        cySmartGet('bridge-amount-text__input').blur();
        cySmartGet('bridge-form-button').click();

        cySmartGet('@getUnsignedApproveBridgeTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
          depositorAddress: '0x123',
          token: imxAddress,
          depositAmount: utils.parseUnits('0.1', 18),
        });

        cySmartGet('@getUnsignedDepositTxStub').should('have.been.calledOnce').should('have.been.calledWith', {
          depositorAddress: '0x123',
          recipientAddress: '0x123',
          token: imxAddress,
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

    describe('it should show not enough eth screen when not enough to cover gas', () => {
      it('should show NotEnoughEth when user has no ETH balance', () => {
        const { heading } = text.drawers.notEnoughGas.content;
        const bridgeStateWithoutETH = {
          ...bridgeState,
          tokenBalances: [
            {
              balance: BigNumber.from('0'),
              formattedBalance: '0',
              token: {
                name: 'ETH',
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
                address: imxAddress,
              },
            }],
        };

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
            initialStateOverride={bridgeStateWithoutETH}
            cryptoConversionsOverride={cryptoConversions}
          >
            <BridgeForm
              testId="bridge-form"
              defaultAmount="0.1"
              defaultFromContractAddress={imxAddress}
            />
          </BridgeWidgetTestComponent>,
        );

        cySmartGet('bridge-form-button').click();
        cySmartGet('@sendTransactionStub').should('not.have.been.called');
        cySmartGet('not-enough-gas-bottom-sheet').should('exist').should('be.visible');
        cySmartGet('not-enough-gas-heading').should('be.visible').should('have.text', heading);
        cySmartGet('not-enough-gas-adjust-amount-button').should('not.exist');
        cySmartGet('not-enough-gas-copy-address-button').should('exist');
        cySmartGet('not-enough-gas-cancel-button').should('exist');
      });

      // WT-1350 Add test back in when native ETH bridges are supported

      // it('should show NotEnoughEth when user is bridging too much ETH', () => {
      //   const { heading } = text.drawers.notEnoughGas.content;
      //   const bridgeStateWithoutETH = {
      //     ...bridgeState,
      //     tokenBalances: [
      //       {
      //         balance: BigNumber.from('100000000000000000'),
      //         formattedBalance: '0.1',
      //         token: {
      //           name: 'ETH',
      //           symbol: 'ETH',
      //           decimals: 18,
      //         },
      //       },
      //       {
      //         balance: BigNumber.from('100000000000000000'),
      //         formattedBalance: '0.1',
      //         token: {
      //           name: 'IMX',
      //           symbol: 'IMX',
      //           decimals: 18,
      //           address: imxAddress,
      //         },
      //       }],
      //   };

      //   cy.stub(TokenBridge.prototype, 'getUnsignedApproveBridgeTx').as('getUnsignedApproveBridgeTxStub')
      //     .resolves({
      //       required: false,
      //     });

      //   cy.stub(TokenBridge.prototype, 'getUnsignedDepositTx').as('getUnsignedDepositTxStub')
      //     .resolves({
      //       required: true,
      //       unsignedTx: {},
      //     });

      //   cy.stub(Checkout.prototype, 'gasEstimate').as('gasEstimateStub')
      //     .resolves({
      //       gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      //       bridgeFee: {
      //         estimatedAmount: utils.parseEther('0.0001'),
      //       },
      //       gasFee: {
      //         estimatedAmount: utils.parseEther('0.0001'),
      //       },
      //       bridgeable: true,
      //     });

      //   cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
      //     .resolves({
      //       transactionResponse: {
      //         wait: () => ({
      //           status: 1,
      //         }),
      //       },
      //     });

      //   mount(
      //     <BridgeWidgetTestComponent
      //       initialStateOverride={bridgeStateWithoutETH}
      //       cryptoConversionsOverride={cryptoConversions}
      //     >
      //       <BridgeForm
      //         testId="bridge-form"
      //         defaultAmount="0.1"
      //         defaultTokenAddress=""
      //       />
      //     </BridgeWidgetTestComponent>,
      //   );

      //   cySmartGet('bridge-token-select__target').click();
      //   cySmartGet('bridge-token-coin-selector__option-eth').click();

      //   cySmartGet('bridge-form-button').click();
      //   cySmartGet('@sendTransactionStub').should('not.have.been.called');
      //   cySmartGet('not-enough-gas-bottom-sheet').should('exist').should('be.visible');
      //   cySmartGet('not-enough-gas-heading').should('be.visible').should('have.text', heading);
      //   cySmartGet('not-enough-gas-adjust-amount-button').should('exist');
      //   cySmartGet('not-enough-gas-copy-address-button').should('exist');
      //   cySmartGet('not-enough-gas-cancel-button').should('exist');
      // });
    });
  });
});
