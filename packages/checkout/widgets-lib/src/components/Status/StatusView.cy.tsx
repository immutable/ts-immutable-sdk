import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../lib/testUtils';
import { StatusView } from './StatusView';
import { StatusType } from './StatusType';

describe('status view', () => {
  it('shows success text and button', () => {
    mount(
      <ViewContextTestComponent>
        <StatusView
          actionText="Close"
          testId="status-view"
          onActionClick={() => {
            // eslint-disable-next-line no-console
            console.log('clicked!');
          }}
          statusType={StatusType.SUCCESS}
          statusText="Test success"
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('status-view-container').should('be.visible');
    cySmartGet('status-view').should('be.visible');
    cySmartGet('success-box').should('be.visible');
    cySmartGet('success-icon').should('be.visible');
    cySmartGet('success-text').should('be.visible');
    cySmartGet('success-text').should('have.text', 'Test success');
    cySmartGet('status-action-button').should('be.visible');
    cySmartGet('status-action-button').should('have.text', 'Close');
    cySmartGet('footer-logo-container').should('be.visible');
  });

  it('shows failure text and button', () => {
    mount(
      <ViewContextTestComponent>
        <StatusView
          actionText="Close"
          testId="status-view"
          onActionClick={() => {
            // eslint-disable-next-line no-console
            console.log('clicked!');
          }}
          statusType={StatusType.FAILURE}
          statusText="Test failure"
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('status-view-container').should('be.visible');
    cySmartGet('status-view').should('be.visible');
    cySmartGet('failure-box').should('be.visible');
    cySmartGet('failure-icon').should('be.visible');
    cySmartGet('failure-text').should('be.visible');
    cySmartGet('failure-text').should('have.text', 'Test failure');
    cySmartGet('status-action-button').should('be.visible');
    cySmartGet('status-action-button').should('have.text', 'Close');
    cySmartGet('footer-logo-container').should('be.visible');
  });

  it('shows rejected text and button', () => {
    mount(
      <ViewContextTestComponent>
        <StatusView
          actionText="Close"
          testId="status-view"
          onActionClick={() => {
            // eslint-disable-next-line no-console
            console.log('clicked!');
          }}
          statusType={StatusType.WARNING}
          statusText="Test rejected"
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('status-view-container').should('be.visible');
    cySmartGet('status-view').should('be.visible');
    cySmartGet('warning-box').should('be.visible');
    cySmartGet('warning-icon').should('be.visible');
    cySmartGet('warning-text').should('be.visible');
    cySmartGet('warning-text').should('have.text', 'Test rejected');
    cySmartGet('status-action-button').should('be.visible');
    cySmartGet('status-action-button').should('have.text', 'Close');
    cySmartGet('footer-logo-container').should('be.visible');
  });
});
