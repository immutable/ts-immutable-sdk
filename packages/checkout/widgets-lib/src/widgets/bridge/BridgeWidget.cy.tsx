import {
  BridgeWidget,
  BridgeWidgetParams,
  BridgeWidgetViews,
} from './BridgeWidget';
import { describe, it, cy, beforeEach } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Network, WidgetTheme } from '@imtbl/checkout-widgets';
import { cySmartGet } from '../../lib/testUtils';
import { Checkout, SwitchNetworkResult } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { BiomeCombinedProviders, BiomeThemeProvider } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import Sinon from 'cypress/types/sinon';
import { BridgeButton } from './components/BridgeButton';
import { TransactionResponse } from '@ethersproject/providers';

type CypressStub = Cypress.Agent<Sinon.SinonStub<any[], any>>;
describe('Bridge Widget tests', () => {
  let connectStub: any;
  let switchNetworkStub: CypressStub;

  let connectStubReturnValue;

  beforeEach(() => {
    connectStubReturnValue = {
      provider: {
        getSigner: () => ({
          getAddress: () => Promise.resolve('0xwalletAddress'),
        }),
        getNetwork: async () => ({
          chainId: 1,
          name: 'Ethereum',
        }),
        provider: {
          request: async () => null,
        },
      },
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    };

    connectStub = cy
      .stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves(connectStubReturnValue);

    cy.stub(Checkout.prototype, 'getAllBalances')
      .as('getAllBalancesStub')
      .resolves({
        balances: [
          {
            balance: BigNumber.from('1000000000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              icon: '123',
            },
          },
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
              decimals: 18,
              address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
              icon: '123',
            },
          },
        ],
      });

    switchNetworkStub = cy
      .stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub');
  });

  describe('Bridge Widget render', () => {
    it('should show bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);
      cySmartGet('heading').should('be.visible');
      cySmartGet('close-button').should('be.visible');
      cySmartGet('select-network__target').should('be.visible');
      cySmartGet('select-network__target').should('have.text', 'Ethereum');
      cySmartGet('select-token__target').should('be.visible');
      cySmartGet('select-token__target').should('have.text', 'ETH');
      cySmartGet('amount__input').should('be.visible');
      cySmartGet('amount__input').should('have.value', '0');
      cySmartGet('bridge-to-network').should(
        'include.text',
        'Immutable zkEVM Testnet'
      );
      cySmartGet('@connectStub').should('have.been.called');
      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    it('should show bridge widget with default set values on mount', () => {
      const params = {
        providerPreference: 'metamask',
        amount: '50.23',
        fromNetwork: Network.ETHEREUM.toString(),
        fromContractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);
      cySmartGet('heading').should('be.visible');
      cySmartGet('close-button').should('be.visible');
      cySmartGet('select-network__target').should('be.visible');
      cySmartGet('select-network__target').should('have.text', 'Ethereum');
      cySmartGet('select-token__target').should('be.visible');
      cySmartGet('select-token__target').should('have.text', 'MATIC');
      cySmartGet('amount__input').should('be.visible');
      cySmartGet('amount__input').should('have.value', '50.23');
      cySmartGet('bridge-to-network').should(
        'include.text',
        'Immutable zkEVM Testnet'
      );
      cySmartGet('@connectStub').should('have.been.called');
      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    it('should switch the selected token when changed', () => {
      const params = {
        providerPreference: 'metamask',
        amount: '50.23',
        fromNetwork: Network.ETHEREUM.toString(),
        fromContractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);
      cy.wait(50);
      cySmartGet('select-token__target').should('have.text', 'MATIC');
      cySmartGet('select-token__target').click();
      cySmartGet('select-token-ETH').click();
      cySmartGet('select-token__target').should('have.text', 'ETH');
      cySmartGet('receive-text').should('include.text', '50.23 ETH');
    });

    it('should update the bridge amount when typed', () => {
      const params = {
        providerPreference: 'metamask',
        amount: '0',
        fromNetwork: Network.ETHEREUM.toString(),
        fromContractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);
      cy.wait(50);
      cySmartGet('select-token__target').should('have.text', 'MATIC');
      cySmartGet('select-token__target').click();
      cySmartGet('select-token-ETH').click();
      cySmartGet('select-token__target').should('have.text', 'ETH');
      cySmartGet('amount__input').clear();
      cySmartGet('amount__input').type('50.456');
      cySmartGet('amount__input').should('have.value', '50.456');
      cySmartGet('receive-text').should('include.text', '50.456 ETH');
    });
  });

  describe('switch network', () => {
    it('it should call switch network when dropdown clicked and other network selected', async () => {
      switchNetworkStub.resolves({
        network: {
          chainId: 137,
          name: 'Polygon',
          nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18,
          },
        },
      } as SwitchNetworkResult);
      const params = {
        providerPreference: 'metamask',
        fromNetwork: Network.ETHEREUM.toString(),
      } as BridgeWidgetParams;
      mount(
        <BiomeCombinedProviders theme={{ base: onDarkBase }}>
          <BridgeWidget params={params} theme={WidgetTheme.DARK} />
        </BiomeCombinedProviders>
      );

      cySmartGet('select-network__target').should('have.text', 'Ethereum');
      cy.wait(50);
      cySmartGet('select-network__target').click();
      cySmartGet('select-network-Polygon').click();

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnValue.provider,
        chainId: 137,
      });
      cySmartGet('select-network__target').should('have.text', 'Polygon');

      cySmartGet('bridge-to-network').should('include.text', 'Ethereum');
    });

    it('should call switch network (to specified network) if provider is on the wrong network to start with', () => {
      const connectStubReturnWrongNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 250,
            name: 'Fantom',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 250,
          name: 'Fantom',
          nativeCurrency: {
            name: 'FTM',
            symbol: 'FTM',
            decimals: 18,
          },
        },
      };
      connectStub.resolves(connectStubReturnWrongNetwork);

      switchNetworkStub.resolves({
        network: {
          chainId: 13372,
          name: 'Immutable zkEVM Testnet',
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      } as SwitchNetworkResult);

      const params = {
        providerPreference: 'metamask',
        fromNetwork: Network.IMTBL_ZKEVM_TESTNET.toString(),
      } as BridgeWidgetParams;
      mount(
        <BiomeCombinedProviders theme={{ base: onDarkBase }}>
          <BridgeWidget params={params} theme={WidgetTheme.DARK} />
        </BiomeCombinedProviders>
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWrongNetwork.provider,
        chainId: 137,
      });
    });

    it('should call switch network (to default Ethereum) if provider is on the wrong network to start with', () => {
      const connectStubReturnWrongNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 250,
            name: 'Fantom',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 250,
          name: 'Fantom',
          nativeCurrency: {
            name: 'FTM',
            symbol: 'FTM',
            decimals: 18,
          },
        },
      };

      const connectStubCorrectNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      };

      connectStub
        .onFirstCall()
        .resolves(connectStubReturnWrongNetwork)
        .onSecondCall()
        .resolves(connectStubCorrectNetwork);

      switchNetworkStub.resolves({
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      } as SwitchNetworkResult);

      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BiomeCombinedProviders theme={{ base: onDarkBase }}>
          <BridgeWidget params={params} theme={WidgetTheme.DARK} />
        </BiomeCombinedProviders>
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWrongNetwork.provider,
        chainId: 1,
      });

      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    it('should call switch network (to specified network) if provider is on the whitelisted network to start with', () => {
      const connectStubReturnWhitelistedNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      };
      connectStub.resolves(connectStubReturnWhitelistedNetwork);

      switchNetworkStub.resolves({
        network: {
          chainId: 13372,
          name: 'Immutable zkEVM Testnet',
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      } as SwitchNetworkResult);

      const params = {
        providerPreference: 'metamask',
        fromNetwork: Network.IMTBL_ZKEVM_TESTNET.toString(),
      } as BridgeWidgetParams;
      mount(
        <BiomeCombinedProviders theme={{ base: onDarkBase }}>
          <BridgeWidget params={params} theme={WidgetTheme.DARK} />
        </BiomeCombinedProviders>
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWhitelistedNetwork.provider,
        chainId: 13372,
      });
    });
    it('should call switch network (to default Ethereum) if provider is on the whitelisted network to start with', () => {
      const connectStubReturnWhitelistedNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 13372,
            name: 'Immutable zkEVM Testnet',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 13372,
          name: 'Immutable zkEVM Testnet',
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      };

      const connectStubCorrectNetwork = {
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('0xwalletAddress'),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      };

      connectStub
        .onFirstCall()
        .resolves(connectStubReturnWhitelistedNetwork)
        .onSecondCall()
        .resolves(connectStubCorrectNetwork);

      switchNetworkStub.resolves({
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      } as SwitchNetworkResult);

      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BiomeCombinedProviders theme={{ base: onDarkBase }}>
          <BridgeWidget params={params} theme={WidgetTheme.DARK} />
        </BiomeCombinedProviders>
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWhitelistedNetwork.provider,
        chainId: 1,
      });

      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });
  });

  describe('Bridge Widget button tests', () => {
    it('should show success and etherscan transaction when bridge succeeds', () => {
      cy.stub(Checkout.prototype, 'sendTransaction')
        .as('sendTransactionStub')
        .resolves({
          transactionResponse: {
            hash: '0x123',
          },
        });

      const params = {
        providerPreference: 'metamask',
        amount: '0.1',
        fromNetwork: Network.ETHEREUM.toString(),
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);

      cySmartGet('bridge-button').should('be.visible');
      cySmartGet('bridge-button').should('be.enabled');
      cySmartGet('bridge-button').click();
      cySmartGet('bridge-success').should('be.visible');
      cySmartGet('etherscan-link')
        .invoke('attr', 'href')
        .should('eq', 'https://etherscan.io/tx/0x123');
      cySmartGet('bridge-button').should('not.exist');
    });

    it('should show failure when bridge fails', () => {
      cy.stub(Checkout.prototype, 'sendTransaction')
        .as('sendTransactionStub')
        .rejects({});

      const params = {
        providerPreference: 'metamask',
        amount: '0.1',
        fromNetwork: Network.ETHEREUM.toString(),
      } as BridgeWidgetParams;
      mount(<BridgeWidget params={params} theme={WidgetTheme.DARK} />);

      cySmartGet('bridge-button').should('be.visible');
      cySmartGet('bridge-button').should('be.enabled');
      cySmartGet('bridge-button').click();
      cySmartGet('bridge-failure').should('be.visible');
      cySmartGet('bridge-button').should('not.exist');
    });

    it('should have disabled button when validation fails', () => {
      mount(
        <BiomeThemeProvider>
          <BridgeButton
            updateTransactionResponse={(
              transactionResponse: TransactionResponse
            ) => {}}
            updateView={(view: BridgeWidgetViews, err?: any) => {}}
          />
        </BiomeThemeProvider>
      );

      cySmartGet('bridge-button').should('be.visible');
      cySmartGet('bridge-button').should('be.disabled');
    });
  });
});
