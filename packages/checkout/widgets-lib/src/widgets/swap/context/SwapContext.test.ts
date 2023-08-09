import { ChainId } from '@imtbl/checkout-sdk';
import {
  SetNetworkPayload,
  SwapActions,
  initialSwapState,
  swapReducer,
  SetSupportedTopUpPayload,
  TopUpFeature,
  SetTokenBalancesPayload,
} from './SwapContext';

describe('WalletContext', () => {
  it('should update state with network info when reducer called with SET_NETWORK action', () => {
    const setNetworkPayload: SetNetworkPayload = {
      type: SwapActions.SET_NETWORK,
      network: {
        name: 'Ethereum',
        chainId: ChainId.ETHEREUM,
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'Ethereum',
        },
        isSupported: true,
      },
    };
    expect(initialSwapState.network).toBeNull();
    expect(initialSwapState.tokenBalances).toEqual([]);
    const { network } = swapReducer(initialSwapState, {
      payload: setNetworkPayload,
    });
    expect(network).toEqual({
      name: 'Ethereum',
      chainId: ChainId.ETHEREUM,
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum',
      },
      isSupported: true,
    });
  });

  it('should update state with token balances when reducer called with SWITCH_NETWORK action', () => {
    const setTokenBalancesPayload: SetTokenBalancesPayload = {
      type: SwapActions.SET_TOKEN_BALANCES,
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
    const { tokenBalances } = swapReducer(initialSwapState, {
      payload: setTokenBalancesPayload,
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
