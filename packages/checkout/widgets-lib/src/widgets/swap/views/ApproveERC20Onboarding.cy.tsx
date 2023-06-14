import { mount } from 'cypress/react18';
import { BigNumber } from 'ethers';
import { TradeInfo } from '@imtbl/dex-sdk';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { Checkout, CheckoutErrorType } from '@imtbl/checkout-sdk';
import { ApproveERC20Onboarding } from './ApproveERC20Onboarding';
import { cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import {
  ApproveERC20Swap,
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { SwapState } from '../context/SwapContext';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';

describe('Approve ERC20 Onboarding', () => {
  let initialSwapState:SwapState;
  let mockApproveERC20Swap: ApproveERC20Swap;
  let sendTransactionStub;
  beforeEach(() => {
    cy.viewport('ipad-2');
    sendTransactionStub = cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub');

    initialSwapState = {
      checkout: {
        sendTransaction: sendTransactionStub,
      } as unknown as Checkout,
      exchange: null,
      provider: {} as Web3Provider,
      providerPreference: null,
      network: null,
      tokenBalances: [
        {
          balance: BigNumber.from('10000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
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
      ],
    };

    mockApproveERC20Swap = {
      approveTransaction: {
        from: 'test-approval',
        to: 'test-approval',
      } as TransactionRequest,
      transaction: {
        from: 'test-swap',
        to: 'test-swap',
      } as TransactionRequest,
      info: {} as TradeInfo,
      swapFormInfo: {
        fromAmount: '0.5',
        fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      } as PrefilledSwapForm,
    };
  });

  describe('Approve Spending Step', () => {
    it('should request user to approve spending transaction on button click', () => {
      mount(
        <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
          <ApproveERC20Onboarding data={mockApproveERC20Swap} />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledOnceWith',
          {
            provider: {},
            transaction: { from: 'test-approval', to: 'test-approval' },
          },
        );
    });

    it('should move to the approve swap content when transaction approved', () => {
      sendTransactionStub.resolves({
        transactionResponse: { wait: () => Promise.resolve({ status: 1 }) },
      });
      const { approveSwap, approveSpending } = text.views[SwapWidgetViews.APPROVE_ERC20];
      mount(
        <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
          <ApproveERC20Onboarding data={mockApproveERC20Swap} />
        </SwapWidgetTestComponent>,
      );

      // assert approve spending copy
      cySmartGet('simple-text-body__heading').should('have.text', approveSpending.content.heading);
      cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[0]);
      cySmartGet('simple-text-body__body').should('include.text', approveSpending.content.body[1]);
      cySmartGet('footer-button').should('have.text', approveSpending.footer.buttonText);

      // make transaction
      cySmartGet('footer-button').click();

      // aeert approve swap copy
      cySmartGet('simple-text-body__heading').should('have.text', approveSwap.content.heading);
      cySmartGet('simple-text-body__body').should('include.text', approveSwap.content.body[0]);
      cySmartGet('footer-button').should('have.text', approveSwap.footer.buttonText);
    });

    it('should show correct approval spending hint (amount and symbol) in body', () => {
      mount(
        <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
          <ApproveERC20Onboarding data={mockApproveERC20Swap} />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('simple-text-body__body').should('include.text', '0.5 IMX');
    });

    it('should reset the button text when user rejects request', () => {
      sendTransactionStub.rejects({ type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR });
      const { footer } = text.views[SwapWidgetViews.APPROVE_ERC20].approveSpending;
      mount(
        <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
          <ApproveERC20Onboarding data={mockApproveERC20Swap} />
        </SwapWidgetTestComponent>,
      );
      cySmartGet('footer-button').should('have.text', footer.buttonText);

      cySmartGet('footer-button').click();

      cySmartGet('footer-button').should('have.text', footer.retryText);
    });
  });

  describe('Approve Swap step', () => {
    it('should request user to approve swap transaction on button click', () => {
      sendTransactionStub.resolves({
        transactionResponse: { wait: () => Promise.resolve({ status: 1 }) },
      });
      mount(
        <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
          <ApproveERC20Onboarding data={mockApproveERC20Swap} />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledOnceWith',
          {
            provider: {},
            transaction: { from: 'test-approval', to: 'test-approval' },
          },
        );

      // second time clicking should be for the swap transaction
      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledWith',
          {
            provider: {},
            transaction: { from: 'test-swap', to: 'test-swap' },
          },
        );
    });
  });
});
