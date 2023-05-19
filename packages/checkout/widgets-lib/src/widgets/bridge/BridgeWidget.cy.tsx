import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { Network, WidgetTheme } from '@imtbl/checkout-widgets';
import { Checkout, SwitchNetworkResult } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { BiomeCombinedProviders } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import { Environment } from '@imtbl/config';
import { cySmartGet } from '../../lib/testUtils';
import {
  BridgeWidget,
  BridgeWidgetParams,
} from './BridgeWidget';

// type CypressStub = Cypress.Agent<Sinon.SinonStub<any[], any>>;
describe('Bridge Widget tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  let connectStub: any;
  let switchNetworkStub: any;

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
          address: '',
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
              address: '',
              icon: '123',
            },
          },
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              icon: '123',
            },
          },
        ],
      });

    switchNetworkStub = cy
      .stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub')
      .resolves(connectStubReturnValue);

    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('getTokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '',
          },
          {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        ],
      });

    cy.stub(Checkout.prototype, 'getNetworkAllowList')
      .as('getNetworkAllowListStub')
      .resolves({
        networks: [
          {
            chainId: 1,
            name: 'Ethereum',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            chainId: 137,
            name: 'Immutable zkEVM Testnet',
            nativeCurrency: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
      });
  });

  describe('Bridge Widget render', () => {
    it('should show bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );
      cySmartGet('header-title').should('be.visible');
      cySmartGet('close-button').should('be.visible');
      cySmartGet('select-token__target').should('be.visible');
      cySmartGet('select-token__target').should('have.text', 'ETH');
      cySmartGet('amount__input').should('be.visible');
      cySmartGet('amount__input').should('have.value', '0');
      cySmartGet('bridge-to-network').should(
        'include.text',
        'Immutable zkEVM Testnet',
      );
      cySmartGet('@connectStub').should('have.been.called');
      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    it('should show bridge widget with default set values on mount', () => {
      const params = {
        providerPreference: 'metamask',
        amount: '50.23',
        fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );
      cySmartGet('header-title').should('be.visible');
      cySmartGet('close-button').should('be.visible');
      cySmartGet('select-token__target').should('be.visible');
      cySmartGet('select-token__target').should('have.text', 'IMX');
      cySmartGet('amount__input').should('be.visible');
      cySmartGet('amount__input').should('have.value', '50.23');
      cySmartGet('bridge-to-network').should(
        'include.text',
        'Immutable zkEVM Testnet',
      );
      cySmartGet('@connectStub').should('have.been.called');
      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    it('should switch the selected token when changed', () => {
      const params = {
        providerPreference: 'metamask',
        amount: '50.23',
        fromNetwork: Network.ETHEREUM.toString(),
        fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );
      cy.wait(50);
      cySmartGet('select-token__target').should('have.text', 'IMX');
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
        fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );
      cy.wait(50);
      cySmartGet('select-token__target').should('have.text', 'IMX');
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
          chainId: 11155111,
          name: 'Sepolia',
          nativeCurrency: {
            name: 'Sepolia',
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
          <BridgeWidget
            environment={Environment.PRODUCTION}
            params={params}
            theme={WidgetTheme.DARK}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWrongNetwork.provider,
        chainId: 11155111,
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
          <BridgeWidget
            environment={Environment.PRODUCTION}
            params={params}
            theme={WidgetTheme.DARK}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWrongNetwork.provider,
        chainId: 11155111,
      });

      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });

    // eslint-disable-next-line max-len
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
          <BridgeWidget
            environment={Environment.PRODUCTION}
            params={params}
            theme={WidgetTheme.DARK}
          />
        </BiomeCombinedProviders>,
      );

      cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
        provider: connectStubReturnWhitelistedNetwork.provider,
        chainId: 11155111,
      });

      cySmartGet('@getAllBalancesStub').should('have.been.called');
    });
  });

  describe('Bridge Widget button tests', () => {

    // TODO: uncomment and fix when bridge form is in

    // it('should show success and etherscan transaction when bridge succeeds', () => {
    //   cy.stub(Checkout.prototype, 'sendTransaction')
    //     .as('sendTransactionStub')
    //     .resolves({
    //       transactionResponse: {
    //         hash: '0x123',
    //       },
    //     });

    //   const params = {
    //     providerPreference: 'metamask',
    //     amount: '0.1',
    //     fromNetwork: Network.ETHEREUM.toString(),
    //   } as BridgeWidgetParams;
    //   mount(
    //     <BridgeWidget
    //       environment={Environment.PRODUCTION}
    //       params={params}
    //       theme={WidgetTheme.DARK}
    //     />,
    //   );

    //   cySmartGet('bridge-button').should('be.visible');
    //   cySmartGet('bridge-button').should('be.enabled');
    //   cySmartGet('bridge-button').click();
    //   cySmartGet('success-text').should('be.visible');
    //   cySmartGet('bridge-button').should('not.exist');
    // });

    // TODO: uncomment and fix when failure screen is in

    // it('should show failure when bridge fails', () => {
    //   cy.stub(Checkout.prototype, 'sendTransaction')
    //     .as('sendTransactionStub')
    //     .rejects({});

    //   const params = {
    //     providerPreference: 'metamask',
    //     amount: '0.1',
    //     fromNetwork: Network.ETHEREUM.toString(),
    //   } as BridgeWidgetParams;
    //   mount(
    //     <BridgeWidget
    //       environment={Environment.PRODUCTION}
    //       params={params}
    //       theme={WidgetTheme.DARK}
    //     />,
    //   );

    //   cySmartGet('bridge-button').should('be.visible');
    //   cySmartGet('bridge-button').should('be.enabled');
    //   cySmartGet('bridge-button').click();
    //   cySmartGet('bridge-failure').should('be.visible');
    //   cySmartGet('bridge-button').should('not.exist');
    // });

    // TODO: uncomment and fix when the bridge form validation is in

    //   it('should have disabled button when validation fails', () => {
    //     mount(
    //       <BiomeThemeProvider>
    //         <BridgeButton
    //           updateTransactionResponse={(
    //             // TODO: is this for mocking purposes?
    //             // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //             transactionResponse: TransactionResponse,
    //           ) => {}}
    //         />
    //       </BiomeThemeProvider>,
    //     );

  //     cySmartGet('bridge-button').should('be.visible');
  //     cySmartGet('bridge-button').should('be.disabled');
  //   });
  });
});
