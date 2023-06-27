import { Checkout, WalletProviderName, TokenInfo } from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { WalletBalances } from './WalletBalances';
import { WalletContext, WalletState } from '../context/WalletContext';
import { cySmartGet } from '../../../lib/testUtils';

describe('WalletBalances', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  // @ts-ignore
  // TODO: please fix the interface for this and remove above @ts-ignore
  const checkout = new Checkout({
    baseConfig: { environment: Environment.PRODUCTION },
  });

  const provider = {
    getSigner: () => ({
      getAddress: async () => Promise.resolve(''),
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  const baseWalletState: WalletState = {
    checkout,
    network: {
      chainId: 13372,
      name: 'Immutable zkEVM Testnet',
      nativeCurrency: {} as unknown as TokenInfo,
      isSupported: true,
    },
    provider,
    walletProvider: WalletProviderName.METAMASK,
    tokenBalances: [],
    supportedTopUps: null,
  };

  it('should show add coins button on ZKEVM when topUps are supported', () => {
    const topUpFeatureTestCases = [
      {
        isOnRampEnabled: true,
        isSwapEnabled: false,
        isBridgeEnabled: false,
      },
      {
        isOnRampEnabled: false,
        isSwapEnabled: true,
        isBridgeEnabled: false,
      },
      {
        isOnRampEnabled: false,
        isSwapEnabled: false,
        isBridgeEnabled: true,
      },
    ];
    topUpFeatureTestCases.forEach((topUpFeatures) => {
      const testWalletState = {
        ...baseWalletState,
        supportedTopUps: {
          ...topUpFeatures,
        },
      };
      mount(
        <BiomeCombinedProviders>
          <WalletContext.Provider
            value={{ walletState: testWalletState, walletDispatch: () => {} }}
          >
            <WalletBalances />
          </WalletContext.Provider>
        </BiomeCombinedProviders>,
      );
      cySmartGet('add-coins').should('exist');
    });
  });

  it('should NOT show add coins on Polygon when all supportedTopUps are disabled', () => {
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
          <WalletBalances />
        </WalletContext.Provider>
      </BiomeCombinedProviders>,
    );
    cySmartGet('add-coins').should('not.exist');
  });

  it('should NOT show add coins button on Ethereum', () => {
    const walletState: WalletState = {
      checkout,
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: true,
      },
      provider,
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: {
        isOnRampEnabled: true,
        isSwapEnabled: true,
        isBridgeEnabled: true,
      },
    };
    mount(
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <WalletBalances />
        </WalletContext.Provider>
      </BiomeCombinedProviders>,
    );
    cySmartGet('Ethereum-network-button').click();
    cySmartGet('add-coins').should('not.exist');
  });
});
