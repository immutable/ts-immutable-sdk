import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { TransactionResponse } from '@ethersproject/providers';
import { CompletionStatus, TokenBridge } from '@imtbl/bridge-sdk';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { MoveInProgress } from './MoveInProgress';
import { initialBridgeState } from '../context/BridgeContext';

describe('MoveInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  const { heading, body1, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];

  it('should render the MoveInProgress view with the correct token symbol in the body text', () => {
    mount(
      <BridgeWidgetTestComponent>
        <MoveInProgress
          token={{
            name: 'Immutable X',
            symbol: 'IMX',
            decimals: 18,
          }}
          transactionResponse={{
            wait: () => ({ status: 1 }),
          } as unknown as TransactionResponse}
          bridgeForm={{
            tokenAddress: '',
            amount: '',
          }}
        />
      </BridgeWidgetTestComponent>,
    );

    cySmartGet('move-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', heading);
    cySmartGet('simple-text-body__body').should('have.text', body1('IMX') + body2);
  });

  it('should call wait for deposit with transaction hash when status is 1', () => {
    const bridgeState = {
      ...initialBridgeState,
      tokenBridge: new TokenBridge({}),
    };

    cy.stub(TokenBridge.prototype, 'waitForDeposit').as('waitForDepositStub')
      .resolves({
        status: CompletionStatus.SUCCESS,
      });

    mount(
      <BridgeWidgetTestComponent
        initialStateOverride={bridgeState}
      >
        <MoveInProgress
          token={{
            name: 'Immutable X',
            symbol: 'IMX',
            decimals: 18,
          }}
          transactionResponse={{
            wait: () => ({ status: 1, transactionHash: 'txnHash' }),
          } as unknown as TransactionResponse}
          bridgeForm={{
            tokenAddress: '',
            amount: '',
          }}
        />
      </BridgeWidgetTestComponent>,
    );

    cySmartGet('move-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', heading);
    cySmartGet('simple-text-body__body').should('have.text', body1('IMX') + body2);

    cySmartGet('@waitForDepositStub').should('have.been.calledOnce').should('have.been.calledWith', {
      transactionHash: 'txnHash',
    });
  });

  it('should not call wait for deposit when status is not 1', () => {
    const bridgeState = {
      ...initialBridgeState,
      tokenBridge: new TokenBridge({}),
    };

    cy.stub(TokenBridge.prototype, 'waitForDeposit').as('waitForDepositStub')
      .resolves({
        status: CompletionStatus.SUCCESS,
      });

    mount(
      <BridgeWidgetTestComponent
        initialStateOverride={bridgeState}
      >
        <MoveInProgress
          token={{
            name: 'Immutable X',
            symbol: 'IMX',
            decimals: 18,
          }}
          transactionResponse={{
            wait: () => ({ status: 0 }),
          } as unknown as TransactionResponse}
          bridgeForm={{
            tokenAddress: '',
            amount: '',
          }}
        />
      </BridgeWidgetTestComponent>,
    );

    cySmartGet('move-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', heading);
    cySmartGet('simple-text-body__body').should('have.text', body1('IMX') + body2);

    cySmartGet('@waitForDepositStub').should('not.have.been.called');
  });
});
