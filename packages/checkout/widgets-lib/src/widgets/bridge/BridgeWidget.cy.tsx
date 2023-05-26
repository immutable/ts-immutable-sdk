/* eslint-disable @typescript-eslint/naming-convention */
import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { cySmartGet } from '../../lib/testUtils';
import {
  BridgeWidget,
  BridgeWidgetParams,
} from './BridgeWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { text } from '../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';

describe('Bridge Widget tests', () => {
  const { header, content } = text.views[BridgeWidgetViews.BRIDGE];
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  let connectStubReturnValue;
  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.PRODUCTION,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

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

    cy
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

    cy
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

    const fiatPricingValue = {
      ethereum: { usd: 2000.0 },
      'usd-coin': { usd: 1.0 },
      'immutable-x': { usd: 1.5 },
    };

    const coinList = [
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Etherum',
      },
    ];

    cy.intercept(
      {
        method: 'GET',
        path: '/api/v3/coins/list*',
      },
      coinList,
    ).as('coinListStub');

    cy.intercept(
      {
        method: 'GET',
        path: '/api/v3/simple/price*',
      },
      fiatPricingValue,
    ).as('cryptoFiatStub');
  });

  describe('Bridge Widget render', () => {
    it('should show bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
        />,
      );
      cySmartGet('bridge-view').should('exist');
      cySmartGet('bridge-form').should('be.visible');
      cySmartGet('header-title').should('have.text', header.title);
      cySmartGet('bridge-form-content-heading').should('have.text', content.title);
      cySmartGet('close-button').should('be.visible');

      cySmartGet('bridge-token-select__target').should('have.text', 'Select coin');
      cySmartGet('bridge-amount-text__input').should('have.value', '');
    });

    it('should set up bridge widget on mount', () => {
      const params = {
        providerPreference: 'metamask',
      } as BridgeWidgetParams;
      mount(
        <BridgeWidget
          config={config}
          params={params}
        />,
      );
      cySmartGet('@connectStub').should('have.been.called');
      cySmartGet('@getAllBalancesStub').should('have.been.called');
      cySmartGet('@getTokenAllowListStub').should('have.been.called');
    });
  });

  // describe('switch network', () => {
  //   it('should call switch network (to specified network) if provider is on the wrong network to start with', () => {
  //     const connectStubReturnWrongNetwork = {
  //       provider: {
  //         getSigner: () => ({
  //           getAddress: () => Promise.resolve('0xwalletAddress'),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: 250,
  //           name: 'Fantom',
  //         }),
  //         provider: {
  //           request: async () => null,
  //         },
  //       },
  //       network: {
  //         chainId: 250,
  //         name: 'Fantom',
  //         nativeCurrency: {
  //           name: 'FTM',
  //           symbol: 'FTM',
  //           decimals: 18,
  //         },
  //       },
  //     };
  //     connectStub.resolves(connectStubReturnWrongNetwork);

  //     switchNetworkStub.resolves({
  //       network: {
  //         chainId: 11155111,
  //         name: 'Sepolia',
  //         nativeCurrency: {
  //           name: 'Sepolia',
  //           symbol: 'ETH',
  //           decimals: 18,
  //         },
  //       },
  //     } as SwitchNetworkResult);

  //     const params = {
  //       providerPreference: 'metamask',
  //     } as BridgeWidgetParams;
  //     mount(
  //       <BiomeCombinedProviders theme={{ base: onDarkBase }}>
  //         <BridgeWidget
  //           config={config}
  //           params={params}
  //         />
  //       </BiomeCombinedProviders>,
  //     );

  //     cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
  //       provider: connectStubReturnWrongNetwork.provider,
  //       chainId: 11155111,
  //     });
  //   });

  //   it('should call switch network (to default Ethereum) if provider is on the wrong network to start with', () => {
  //     const connectStubReturnWrongNetwork = {
  //       provider: {
  //         getSigner: () => ({
  //           getAddress: () => Promise.resolve('0xwalletAddress'),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: 250,
  //           name: 'Fantom',
  //         }),
  //         provider: {
  //           request: async () => null,
  //         },
  //       },
  //       network: {
  //         chainId: 250,
  //         name: 'Fantom',
  //         nativeCurrency: {
  //           name: 'FTM',
  //           symbol: 'FTM',
  //           decimals: 18,
  //         },
  //       },
  //     };

  //     const connectStubCorrectNetwork = {
  //       provider: {
  //         getSigner: () => ({
  //           getAddress: () => Promise.resolve('0xwalletAddress'),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: 1,
  //           name: 'Ethereum',
  //         }),
  //         provider: {
  //           request: async () => null,
  //         },
  //       },
  //       network: {
  //         chainId: 1,
  //         name: 'Ethereum',
  //         nativeCurrency: {
  //           name: 'Ethereum',
  //           symbol: 'ETH',
  //           decimals: 18,
  //         },
  //       },
  //     };

  //     connectStub
  //       .onFirstCall()
  //       .resolves(connectStubReturnWrongNetwork)
  //       .onSecondCall()
  //       .resolves(connectStubCorrectNetwork);

  //     switchNetworkStub.resolves({
  //       network: {
  //         chainId: 1,
  //         name: 'Ethereum',
  //         nativeCurrency: {
  //           name: 'Ethereum',
  //           symbol: 'ETH',
  //           decimals: 18,
  //         },
  //       },
  //     } as SwitchNetworkResult);

  //     const params = {
  //       providerPreference: 'metamask',
  //     } as BridgeWidgetParams;
  //     mount(
  //       <BiomeCombinedProviders theme={{ base: onDarkBase }}>
  //         <BridgeWidget
  //           config={config}
  //           params={params}
  //         />
  //       </BiomeCombinedProviders>,
  //     );

  //     cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
  //       provider: connectStubReturnWrongNetwork.provider,
  //       chainId: 11155111,
  //     });

  //     cySmartGet('@getAllBalancesStub').should('have.been.called');
  //   });

  //   // eslint-disable-next-line max-len
  //   it('should call switch network (to default Ethereum) if provider is on the whitelisted network to start with', () => {
  //     const connectStubReturnWhitelistedNetwork = {
  //       provider: {
  //         getSigner: () => ({
  //           getAddress: () => Promise.resolve('0xwalletAddress'),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: 13372,
  //           name: 'Immutable zkEVM Testnet',
  //         }),
  //         provider: {
  //           request: async () => null,
  //         },
  //       },
  //       network: {
  //         chainId: 13372,
  //         name: 'Immutable zkEVM Testnet',
  //         nativeCurrency: {
  //           name: 'IMX',
  //           symbol: 'IMX',
  //           decimals: 18,
  //         },
  //       },
  //     };

  //     const connectStubCorrectNetwork = {
  //       provider: {
  //         getSigner: () => ({
  //           getAddress: () => Promise.resolve('0xwalletAddress'),
  //         }),
  //         getNetwork: async () => ({
  //           chainId: 1,
  //           name: 'Ethereum',
  //         }),
  //         provider: {
  //           request: async () => null,
  //         },
  //       },
  //       network: {
  //         chainId: 1,
  //         name: 'Ethereum',
  //         nativeCurrency: {
  //           name: 'Ethereum',
  //           symbol: 'ETH',
  //           decimals: 18,
  //         },
  //       },
  //     };

  //     connectStub
  //       .onFirstCall()
  //       .resolves(connectStubReturnWhitelistedNetwork)
  //       .onSecondCall()
  //       .resolves(connectStubCorrectNetwork);

  //     switchNetworkStub.resolves({
  //       network: {
  //         chainId: 1,
  //         name: 'Ethereum',
  //         nativeCurrency: {
  //           name: 'Ethereum',
  //           symbol: 'ETH',
  //           decimals: 18,
  //         },
  //       },
  //     } as SwitchNetworkResult);

  //     const params = {
  //       providerPreference: 'metamask',
  //     } as BridgeWidgetParams;
  //     mount(
  //       <BiomeCombinedProviders theme={{ base: onDarkBase }}>
  //         <BridgeWidget
  //           config={config}
  //           params={params}
  //         />
  //       </BiomeCombinedProviders>,
  //     );

  //     cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
  //       provider: connectStubReturnWhitelistedNetwork.provider,
  //       chainId: 11155111,
  //     });

  //     cySmartGet('@getAllBalancesStub').should('have.been.called');
  //   });
  // });
});
