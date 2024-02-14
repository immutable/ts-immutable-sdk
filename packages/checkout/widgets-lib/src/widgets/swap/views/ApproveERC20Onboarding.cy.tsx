import { mount } from 'cypress/react18';
import { cy } from 'local-cypress';
import { BigNumber } from 'ethers';
import { ExternalProvider, TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { Checkout, CheckoutErrorType } from '@imtbl/checkout-sdk';
import { Quote } from '@imtbl/dex-sdk';
import { ApproveERC20Onboarding } from './ApproveERC20Onboarding';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import {
  ApproveERC20SwapData,
  PrefilledSwapForm,
} from '../../../context/view-context/SwapViewContextTypes';
import { SwapState } from '../context/SwapContext';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';
import { ConnectLoaderState, ConnectionStatus } from '../../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { CustomAnalyticsProvider } from '../../../context/analytics-provider/CustomAnalyticsProvider';

describe('Approve ERC20 Onboarding', () => {
  let initialSwapState: SwapState;
  let connectLoaderState: ConnectLoaderState;
  let mockApproveERC20Swap: ApproveERC20SwapData;
  let sendTransactionStub;
  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
      populateTransaction: (tx) => Promise.resolve(tx),
    }),
  } as Web3Provider;

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
    sendTransactionStub = cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub');

    connectLoaderState = {
      checkout: {
        sendTransaction: sendTransactionStub,
      } as unknown as Checkout,
      provider: mockProvider,
      connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
    };

    initialSwapState = {
      exchange: null,
      walletProviderName: null,
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
      info: {} as Quote,
      swapFormInfo: {
        fromAmount: '0.5',
        fromTokenAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      } as PrefilledSwapForm,
    };
  });

  describe('Approve Spending Step', () => {
    it('should request user to approve spending transaction on button click', () => {
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledOnceWith',
          {
            provider: mockProvider,
            transaction: { from: 'test-approval', to: 'test-approval' },
          },
        );
    });

    it('should move to the approve swap content when transaction approved', () => {
      sendTransactionStub.resolves({
        transactionResponse: { wait: () => Promise.resolve({ status: 1 }) },
      });
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      // assert approve spending copy
      cySmartGet('simple-text-body__heading').should(
        'have.text',
        'You\'ll be asked to set a spending cap for this transaction',
      );
      cySmartGet('simple-text-body__body').should(
        'include.text',
        'Input at least 0.5 IMX for this transaction and future transactions, then follow the prompts.',
      );
      cySmartGet('footer-button').should('have.text', 'Got it');

      // make transaction
      cySmartGet('footer-button').click();

      // assert approve swap copy
      cySmartGet('simple-text-body__heading').should('have.text', 'Now you\'ll just need to confirm the transaction');
      cySmartGet('simple-text-body__body').should('include.text', 'Follow the prompts in your wallet.');
      cySmartGet('footer-button').should('have.text', 'Okay');
    });

    it('should move to the approve swap content with Passport', () => {
      sendTransactionStub.resolves({
        transactionResponse: { wait: () => Promise.resolve({ status: 1 }) },
      });
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={
            {
              ...connectLoaderState,
              provider: { ...mockProvider, provider: { isPassport: true } as ExternalProvider } as Web3Provider,
            }
          }
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      // assert approve spending copy
      cySmartGet('simple-text-body__heading').should(
        'have.text',
        'You\'ll be asked to approve a spending cap for this transaction',
      );
      cySmartGet('simple-text-body__body').should(
        'include.text',
        'Follow the prompts in your wallet to approve the spending cap.',
      );
      cySmartGet('footer-button').should('have.text', 'Got it');

      // make transaction
      cySmartGet('footer-button').click();

      // assert approve swap copy
      cySmartGet('simple-text-body__heading').should('have.text', 'Now you\'ll just need to confirm the transaction');
      cySmartGet('simple-text-body__body').should('include.text', 'Follow the prompts in your wallet.');
      cySmartGet('footer-button').should('have.text', 'Okay');
    });

    it('should show correct approval spending hint (amount and symbol) in body', () => {
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('simple-text-body__body').should('include.text', '0.5 IMX');
    });

    it('should reset the button text when user rejects request', () => {
      sendTransactionStub.rejects({ type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR });
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );
      cySmartGet('footer-button').should('have.text', 'Got it');

      cySmartGet('footer-button').click();

      cySmartGet('footer-button').should('have.text', 'Try again');
    });
  });

  describe('Approve Swap step', () => {
    it('should request user to approve swap transaction on button click', () => {
      sendTransactionStub.resolves({
        transactionResponse: { wait: () => Promise.resolve({ status: 1 }) },
      });
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <SwapWidgetTestComponent initialStateOverride={initialSwapState}>
              <ApproveERC20Onboarding data={mockApproveERC20Swap} />
            </SwapWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledOnceWith',
          {
            provider: mockProvider,
            transaction: { from: 'test-approval', to: 'test-approval' },
          },
        );

      // second time clicking should be for the swap transaction
      cySmartGet('footer-button').click();
      cySmartGet('@sendTransactionStub')
        .should(
          'have.been.calledWith',
          {
            provider: mockProvider,
            transaction: { from: 'test-swap', to: 'test-swap' },
          },
        );
    });
  });
});
