import { mount } from 'cypress/react18';
import React from 'react';
import { BiomeCombinedProviders } from '@biom3/react';
import { cy, it } from 'local-cypress';
import {
  Checkout, WalletProviderName, TokenInfo, ChainId, ChainName,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { WalletContext, WalletState } from '../../context/WalletContext';
import { text } from '../../../../resources/text/textConfig';
import { cySmartGet } from '../../../../lib/testUtils';
import { NetworkMenu } from './NetworkMenu';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';
import { ConnectionStatus } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';

describe('Network Menu', () => {
  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: {} as Web3Provider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  beforeEach(() => {
    cy.stub(Checkout.prototype, 'getNetworkAllowList')
      .as('getNetworkAllowListStub')
      .resolves({
        networks: [
          {
            name: 'Ethereum',
            chainId: ChainId.ETHEREUM,
          },
          {
            name: 'ImmutablezkEVMTestnet',
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          },
        ],
      });
  });

  it('should have heading', () => {
    mount(
      <BiomeCombinedProviders>
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <NetworkMenu setBalancesLoading={() => {}} />
        </ConnectLoaderTestComponent>
      </BiomeCombinedProviders>,
    );

    cySmartGet('network-heading').should(
      'include.text',
      text.views[WalletWidgetViews.WALLET_BALANCES].networkStatus.heading,
    );
  });
  it('should have network buttons', () => {
    const walletState: WalletState = {
      network: null,
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    mount(
      <BiomeCombinedProviders>
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletContext.Provider
            value={{ walletState, walletDispatch: () => {} }}
          >
            <NetworkMenu setBalancesLoading={() => {}} />
          </WalletContext.Provider>
        </ConnectLoaderTestComponent>
      </BiomeCombinedProviders>,
    );
    cySmartGet('@getNetworkAllowListStub').should('have.been.called');
    cySmartGet('Ethereum-network-button').should('exist');
    cySmartGet('ImmutablezkEVMTestnet-network-button').should('exist');
  });

  it('should switch network', () => {
    cy.stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub')
      .resolves({
        network: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          name: ChainName.IMTBL_ZKEVM_TESTNET,
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });

    const walletState: WalletState = {
      network: {
        chainId: ChainId.ETHEREUM,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: false,
      },
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    mount(
      <BiomeCombinedProviders>
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletContext.Provider
            value={{ walletState, walletDispatch: () => {} }}
          >
            <NetworkMenu setBalancesLoading={() => {}} />
          </WalletContext.Provider>
        </ConnectLoaderTestComponent>
      </BiomeCombinedProviders>,
    );

    cySmartGet('ImmutablezkEVMTestnet-network-button').click();

    cySmartGet('@switchNetworkStub').should('have.been.called');
    cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
      provider: {},
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
    });
  });
});
