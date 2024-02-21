import React from 'react';
import { mount } from 'cypress/react18';
import {
  ChainId,
  ChainName,
  Checkout,
  WalletProviderName,
  IMTBLWidgetEvents,
  GetBalanceResult,
  WidgetTheme,
} from '@imtbl/checkout-sdk';
import { cy } from 'local-cypress';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { BalanceInfo } from 'widgets/wallet/functions/tokenBalances';
import { WalletState } from '../../context/WalletContext';
import { BalanceItem } from './BalanceItem';
import { cyIntercept, cySmartGet } from '../../../../lib/testUtils';
import { WalletWidgetTestComponent } from '../../test-components/WalletWidgetTestComponent';
import { orchestrationEvents } from '../../../../lib/orchestrationEvents';
import { ConnectionStatus } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { NATIVE } from '../../../../lib';

describe('BalanceItem', () => {
  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: {} as Web3Provider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  const testTokenBalances: GetBalanceResult[] = [{
    balance: BigNumber.from('21320000000000000000'),
    formattedBalance: '21.32',
    token: {
      name: 'Immutable X',
      symbol: 'IMX',
      decimals: 18,
      address: NATIVE,
    },
  }];

  const baseWalletState: WalletState = {
    network: null,
    walletProviderName: WalletProviderName.METAMASK,
    tokenBalances: testTokenBalances,
    supportedTopUps: null,
  };

  const testBalanceInfo: BalanceInfo = {
    fiatAmount: '3412.08',
    id: '1',
    symbol: 'IMX',
    balance: '21.32',
    address: NATIVE,
    description: 'some description',
  };

  beforeEach(() => {
    cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as(
      'requestSwapEventStub',
    );
    cy.stub(orchestrationEvents, 'sendRequestOnrampEvent').as(
      'requestOnrampEventStub',
    );
    cyIntercept();
  });

  it('should show balance details', () => {
    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={baseWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
      </ConnectLoaderTestComponent>,
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
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: NATIVE,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
        isSwapAvailable: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
  });

  it('should show the move option on zkEVM when all topUps are enabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
        isSwapAvailable: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
        ,
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-move-option').should('be.visible');
    cySmartGet('balance-item-move-option').should('have.text', 'Move IMX');
  });

  it('should show the swap option on zkEVM when all topUps are enabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
        isSwapAvailable: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
        ,
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
  });

  it('should hide the swap option on zkEVM when swap is unavailable', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
        isSwapAvailable: false,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-swap-option').should('not.be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
  });

  it('should show the add option on zkEVM when token is in onramp allowlist', () => {
    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('tokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'tIMX',
            symbol: 'tIMX',
            decimals: 18,
            address: NATIVE,
          },
        ],
      });
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
        ,
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('be.visible');
    cySmartGet('balance-item-add-option').should('have.text', 'Add IMX');
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
  });

  it('should NOT show the add option on zkEVM if token is not in allowlist', () => {
    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('tokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'tIMX',
            symbol: 'tIMX',
            decimals: 18,
            address: NATIVE,
          },
        ],
      });
    const balanceInfoNotInAllowList = {
      fiatAmount: '3412.08',
      id: '1',
      symbol: 'zkTEST',
      balance: '21.32',
      address: '0x1234567890123456789012345678901234567890',
      description: 'some description',
    };
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: [],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={balanceInfoNotInAllowList}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
        ,
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('not.be.visible');
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap zkTEST');
  });

  it('should ONLY show swap option on zkEVM if onramp is disabled', () => {
    const testWalletState = {
      ...baseWalletState,
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
        isSupported: true,
      },
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: false,
        isSwapEnabled: true,
        isBridgeEnabled: true,
        isSwapAvailable: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
        ,
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('exist');
    cySmartGet('token-menu').click();
    cySmartGet('balance-item-add-option').should('not.be.visible');
    cySmartGet('balance-item-swap-option').should('be.visible');
    cySmartGet('balance-item-swap-option').should('have.text', 'Swap IMX');
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
      tokenBalances: testTokenBalances,
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };

    mount(
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
      </ConnectLoaderTestComponent>,
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
      <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
        <WalletWidgetTestComponent initialStateOverride={testWalletState}>
          <BalanceItem
            balanceInfo={testBalanceInfo}
            bridgeToL2OnClick={() => {}}
            theme={WidgetTheme.DARK}
          />
        </WalletWidgetTestComponent>
      </ConnectLoaderTestComponent>,
    );

    cySmartGet('token-menu').should('not.exist');
  });

  describe('Balance Item events', () => {
    let testWalletState;
    beforeEach(() => {
      cy.stub(Checkout.prototype, 'getTokenAllowList')
        .as('tokenAllowListStub')
        .resolves({
          tokens: [
            {
              name: 'tIMX',
              symbol: 'tIMX',
              decimals: 18,
              address: NATIVE,
            },
          ],
        });
      testWalletState = {
        ...baseWalletState,
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: ChainName.IMTBL_ZKEVM_TESTNET,
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
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <WalletWidgetTestComponent initialStateOverride={testWalletState}>
            <BalanceItem
              balanceInfo={testBalanceInfo}
              bridgeToL2OnClick={() => {}}
              theme={WidgetTheme.DARK}
            />
          </WalletWidgetTestComponent>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('token-menu').should('exist');
      cySmartGet('token-menu').click();
      cySmartGet('balance-item-swap-option').click();
      cySmartGet('@requestSwapEventStub').should('have.been.called');
      cySmartGet('@requestSwapEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        {
          toTokenAddress: '',
          fromTokenAddress: NATIVE,
          amount: '',
        },
      );
    });

    it('should emit sendRequestOnrampEvent when add menu button is clicked', () => {
      mount(
        <ConnectLoaderTestComponent initialStateOverride={connectLoaderState}>
          <WalletWidgetTestComponent initialStateOverride={testWalletState}>
            <BalanceItem
              balanceInfo={testBalanceInfo}
              bridgeToL2OnClick={() => {}}
              theme={WidgetTheme.DARK}
            />
          </WalletWidgetTestComponent>
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('token-menu').should('exist');
      cySmartGet('token-menu').click();
      cySmartGet('balance-item-add-option').click();
      cySmartGet('@requestOnrampEventStub').should('have.been.called');
      cySmartGet('@requestOnrampEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        {
          tokenAddress: NATIVE,
          amount: '',
        },
      );
    });
  });
});
