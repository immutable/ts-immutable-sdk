import {
  Checkout,
  ConnectionProviders,
  TokenInfo,
} from '@imtbl/checkout-sdk-web';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { WalletBalances } from './WalletBalances';
import { BiomeCombinedProviders } from '@biom3/react';
import { WalletContext } from '../context/WalletContext';
import { Web3Provider } from '@ethersproject/providers';
import { cySmartGet } from '../../../lib/testUtils';

describe('WalletBalances', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should show add coins button', () => {
    const checkout = new Checkout();
    const provider = {} as unknown as Web3Provider;
    const walletState = {
      checkout: checkout,
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: false,
      },
      provider,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
    };
    mount(
      <BiomeCombinedProviders>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <WalletBalances
            totalFiatAmount={100}
            getTokenBalances={(checkout, provider, networkName, chainId) => {}}
          />
        </WalletContext.Provider>
      </BiomeCombinedProviders>
    );
    cySmartGet('Ethereum-network-button').click();
    cySmartGet('add-coins').should('exist'); // eventually we want to hide this on L1 network
    cySmartGet('Polygon-network-button').click();
    cySmartGet('add-coins').should('exist');
  });
});
