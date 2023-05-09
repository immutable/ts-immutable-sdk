import { BiomeCombinedProviders } from '@biom3/react';
import { WalletContext, WalletState } from '../../context/WalletContext';
import React from 'react';
import { mount } from 'cypress/react18';
import { ChainId, Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { BalanceItem } from './BalanceItem';
import { BalanceInfo } from '../../functions/tokenBalances';
import { cySmartGet } from '../../../../lib/testUtils';
import { Environment } from '@imtbl/config';

describe('BalanceItem', () => {
  let baseWalletState: WalletState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    }),
    network: null,
    provider: null,
    providerPreference: ConnectionProviders.METAMASK,
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

  it('should show balance details', () => {
    mount(
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: baseWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
    );

    cySmartGet('balance-item-IMX').should('include.text', 'IMX');
    cySmartGet('balance-item-IMX').should('include.text', 'some description');
    cySmartGet('balance-item-IMX__price').should('have.text', '21.32');
    cySmartGet('balance-item-IMX__fiatAmount').should(
      'include.text',
      '≈ USD $3,412.08'
    );
  });

  it('should show menu options for the token', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.POLYGON_ZKEVM_TESTNET,
        name: 'POLYGON_ZKEVM_TESTNET',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
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
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: testWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
    );

    cySmartGet('token-menu').should('exist');
  });

  it('should show ONLY the add and swap options on POLYGON_ZKEVM when all topUps are enabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.POLYGON_ZKEVM_TESTNET,
        name: 'POLYGON_ZKEVM_TESTNET',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
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
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: testWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
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
        chainId: ChainId.POLYGON_ZKEVM_TESTNET,
        name: 'POLYGON_ZKEVM_TESTNET',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
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
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: testWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
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
        chainId: ChainId.GOERLI,
        name: 'GOERLI',
        nativeCurrency: {
          name: 'GOERLI',
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
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: testWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
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
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState: testWalletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={testBalanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeCombinedProviders>
    );
    cySmartGet('token-menu').should('not.exist');
  });
});
