import { Checkout } from '@imtbl/checkout-sdk';
import {
  SetCheckoutPayload,
  SetProviderPayload,
  SetSwitchNetworkPayload,
  SwapActions,
  initialSwapState,
  swapReducer,
  SetSupportedTopUpPayload,
  TopUpFeature,
} from './SwapContext';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';

describe('WalletContext', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: SwapActions.SET_CHECKOUT,
      checkout: new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      }),
    };
    expect(initialSwapState.checkout).toBeNull();
    const { checkout } = swapReducer(initialSwapState, {
      payload: setCheckoutPayload,
    });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const setProviderPayload: SetProviderPayload = {
      type: SwapActions.SET_PROVIDER,
      provider: {} as Web3Provider,
    };
    expect(initialSwapState.provider).toBeNull();
    const { provider } = swapReducer(initialSwapState, {
      payload: setProviderPayload,
    });
    expect(provider).not.toBeNull();
  });

  it('should update state with network info and token balances when reducer called with SWITCH_NETWORK action', () => {
    const setSwitchNetworkPayload: SetSwitchNetworkPayload = {
      type: SwapActions.SET_NETWORK,
      network: {
        name: 'Ethereum',
        chainId: 1,
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'Ethereum',
        },
        isSupported: true,
      },
      tokenBalances: [
        {
          id: 'Ethereum-ETH',
          symbol: 'ETH',
          description: 'Ethereum',
          balance: '1000000000000000000',
          fiatAmount: '1800.00',
        } as any,
      ],
    };
    expect(initialSwapState.network).toBeNull();
    expect(initialSwapState.tokenBalances).toEqual([]);
    const { network, tokenBalances } = swapReducer(initialSwapState, {
      payload: setSwitchNetworkPayload,
    });
    expect(network).toEqual({
      name: 'Ethereum',
      chainId: 1,
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum',
      },
      isSupported: true,
    });
    expect(tokenBalances).toEqual([
      {
        id: 'Ethereum-ETH',
        symbol: 'ETH',
        description: 'Ethereum',
        balance: '1000000000000000000',
        fiatAmount: '1800.00',
      } as any,
    ]);
  });

  it('should update state with supported top-ups when reducer called with SET_SUPPORTED_TOP_UPS action', () => {
    const enabledTopUps: TopUpFeature = {
      isBridgeEnabled: false,
      isOnRampEnabled: false,
    };

    const setSupportedTopUpPayload: SetSupportedTopUpPayload = {
      type: SwapActions.SET_SUPPORTED_TOP_UPS,
      supportedTopUps: { ...enabledTopUps },
    };
    expect(initialSwapState.supportedTopUps).toBeNull();
    const { supportedTopUps } = swapReducer(initialSwapState, {
      payload: setSupportedTopUpPayload,
    });
    expect(supportedTopUps).toEqual({
      isSwapEnabled: true,
      isBridgeEnabled: false,
      isOnRampEnabled: false,
    });
  });
});
