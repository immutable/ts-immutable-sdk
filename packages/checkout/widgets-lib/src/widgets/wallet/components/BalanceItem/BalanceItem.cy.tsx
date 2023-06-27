import React from 'react';
import { mount } from 'cypress/react18';
import { ChainId, Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { cy } from 'local-cypress';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { WalletState } from '../../context/WalletContext';
import { BalanceItem } from './BalanceItem';
import { BalanceInfo } from '../../functions/tokenBalances';
import { cySmartGet } from '../../../../lib/testUtils';
import { WalletWidgetTestComponent } from '../../test-components/WalletWidgetTestComponent';
import { orchestrationEvents } from '../../../../lib/orchestrationEvents';

describe('BalanceItem', () => {
  const baseWalletState: WalletState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    }),
    network: null,
    provider: null,
    walletProvider: WalletProviderName.METAMASK,
    tokenBalances: [],
    supportedTopUps: null,
  };

  const testBalanceInfo: BalanceInfo = {
    fiatAmount: '3412.08',
    id: '1',
    symbol: 'IMX',
    balance: '21.32',
    description: 'some description',
  };

  beforeEach(() => {
    cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as('requestSwapEventStub');
    cy.stub(orchestrationEvents, 'sendRequestBridgeEvent').as('requestBridgeEventStub');
    cy.stub(orchestrationEvents, 'sendRequestOnrampEvent').as('requestOnrampEventStub');
  });

  it('should show balance details', () => {
    mount(
      <WalletWidgetTestComponent>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );

    cySmartGet('balance-item-IMX').should('include.text', 'IMX');
    cySmartGet('balance-item-IMX').should('include.text', 'some description');
    cySmartGet('balance-item-IMX__price').should('have.text', '21.32');
    cySmartGet('balance-item-IMX__fiatAmount').should(
      'include.text',
      '≈ USD $3,412.08',
    );
  });

  it('should show menu options for the token', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: 'Immutable zkEVM Testnet',
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: [testBalanceInfo],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <WalletWidgetTestComponent initialStateOverride={testWalletState}>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
  });

  it('should show ONLY the add and swap options on POLYGON_ZKEVM when all topUps are enabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: 'Immutable zkEVM Testnet',
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: [testBalanceInfo],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <WalletWidgetTestComponent initialStateOverride={testWalletState}>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('be.visible');
    cySmartGet('balance-item-add-option').should('have.text', 'Add IMX');
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
    cySmartGet('balance-item-move-option').should('not.be.visible');
  });

  it('should ONLY show swap option on POLYGON_ZKEVM if onramp is disabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: 'Immutable zkEVM Testnet',
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: [testBalanceInfo],
      supportedTopUps: {
        isOnRampEnabled: false,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <WalletWidgetTestComponent initialStateOverride={testWalletState}>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('not.be.visible');
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
    cySmartGet('balance-item-move-option').should('not.be.visible');
  });

  it('should show ONLY the move option on Ethereum when all topUps are enabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.SEPOLIA,
        name: 'Ethereum',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: [testBalanceInfo],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <WalletWidgetTestComponent initialStateOverride={testWalletState}>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );
    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('not.be.visible');
    cySmartGet('balance-item-swap-option').should('not.be.visible');
    cySmartGet('balance-item-move-option').should('be.visible');
    cySmartGet('balance-item-move-option').should('have.text', 'Move IMX');
  });

  it('should NOT show menu options for the token when all top ups are disabled', () => {
    const testWalletState = {
      ...baseWalletState,
      supportedTopUps: {
        isOnRampEnabled: false,
        isSwapEnabled: false,
        isBridgeEnabled: false,
      },
    };
    mount(
      <WalletWidgetTestComponent initialStateOverride={testWalletState}>
        <BalanceItem balanceInfo={testBalanceInfo} />
      </WalletWidgetTestComponent>,
    );

    cySmartGet('token-menu').should('not.exist');
  });

  describe('Balance Item events', () => {
    let testWalletState;
    beforeEach(() => {
      testWalletState = {
        ...baseWalletState,
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: 'Immutable zkEVM Testnet',
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
          isSupported: true,
        },
        tokenBalances: [testBalanceInfo],
        supportedTopUps: {
          isOnRampEnabled: true,
          isSwapEnabled: true,
          isBridgeEnabled: true,
        },
      };
    });

    it('should emit sendRequestSwapEvent when swap menu button is clicked', () => {
      mount(
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem balanceInfo={testBalanceInfo} />
        </WalletWidgetTestComponent>,
      );

      cySmartGet('token-menu').should('exist');
      cySmartGet('token-menu').click();
      cySmartGet('balance-item-swap-option').click();
      cySmartGet('@requestSwapEventStub').should('have.been.called');
      cySmartGet('@requestSwapEventStub').should('have.been.calledWith', IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
        toTokenAddress: '',
        fromTokenAddress: '',
        amount: '',
      });
    });

    it('should emit sendRequestOnrampEvent when add menu button is clicked', () => {
      mount(
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem balanceInfo={testBalanceInfo} />
        </WalletWidgetTestComponent>,
      );

      cySmartGet('token-menu').should('exist');
      cySmartGet('token-menu').click();
      cySmartGet('balance-item-add-option').click();
      cySmartGet('@requestOnrampEventStub').should('have.been.called');
      cySmartGet('@requestOnrampEventStub').should(
        'have.been.calledWith',
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,

        {
          tokenAddress: '',
          amount: '',
        },
      );
    });

    it('should emit sendRequestBridgeEvent when move menu button is clicked', () => {
      testWalletState = {
        ...testWalletState,
        network: {
          chainId: ChainId.SEPOLIA,
          name: 'Immutable zkEVM Testnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          isSupported: true,
        },
      };
      mount(
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem balanceInfo={testBalanceInfo} />
        </WalletWidgetTestComponent>,
      );

      cySmartGet('token-menu').should('exist');
      cySmartGet('token-menu').click();
      cySmartGet('balance-item-move-option').click();
      cySmartGet('@requestBridgeEventStub').should('have.been.called');
      cySmartGet('@requestBridgeEventStub').should(
        'have.been.calledWith',
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        {
          tokenAddress: '',
          amount: '',
        },
      );
    });
  });
});
