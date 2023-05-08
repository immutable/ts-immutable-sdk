import { BiomeThemeProvider, OverflowPopoverMenu } from '@biom3/react';
import { WalletContext, WalletState } from '../../context/WalletContext';
import React from 'react';
import { mount } from 'cypress/react18';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { BalanceItem } from './BalanceItem';
import { BalanceInfo } from '../../functions/tokenBalances';
import { cySmartGet } from '../../../../lib/testUtils';

describe('BalanceItem', () => {
  it('should show balance details', () => {
    const walletState: WalletState = {
      checkout: new Checkout(),
      network: null,
      provider: null,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    const balanceInfo: BalanceInfo = {
      fiatAmount: '3412.08',
      id: '1',
      symbol: 'IMX',
      balance: '21.32',
      description: 'some description',
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={balanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeThemeProvider>
    );

    cySmartGet('balance-item-IMX').should('include.text', 'IMX');
    cySmartGet('balance-item-IMX').should('include.text', 'some description');
    cySmartGet('balance-item-IMX__price').should('have.text', '21.32');
    cySmartGet('balance-item-IMX__fiatAmount').should(
      'include.text',
      '≈ USD $3,412.08'
    );
  });
  it('should NOT show menu options for the token', () => {
    const walletState: WalletState = {
      checkout: new Checkout(),
      network: null,
      provider: null,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    const balanceInfo: BalanceInfo = {
      fiatAmount: '3412.08',
      id: '1',
      symbol: 'IMX',
      balance: '21.32',
      description: 'some description',
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={balanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeThemeProvider>
    );
    cySmartGet('token-menu').should('not.exist');
  });
  it('should show menu options for the token', () => {
    const walletState: WalletState = {
      checkout: new Checkout(),
      network: null,
      provider: null,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };
    const balanceInfo: BalanceInfo = {
      fiatAmount: '3412.08',
      id: '1',
      symbol: 'IMX',
      balance: '21.32',
      description: 'some description',
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <BalanceItem balanceInfo={balanceInfo}></BalanceItem>
        </WalletContext.Provider>
      </BiomeThemeProvider>
    );
    //todo: how to fetch pop-over menu??????
    cySmartGet('token-menu').should('exist');
  });
});
