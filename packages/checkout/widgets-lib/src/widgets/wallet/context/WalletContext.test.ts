import { ChainId } from '@imtbl/checkout-sdk';
import {
  SetSwitchNetworkPayload,
  WalletActions,
  initialWalletState,
  walletReducer,
  SetSupportedTopUpPayload,
  TopUpFeature,
  SetTokenBalancesPayload,
} from './WalletContext';
import { BalanceInfo } from '../functions/tokenBalances';

describe('WalletContext', () => {
  it('should update state with network info and token balances when reducer called with SET_NETWORK action', () => {
    const setSwitchNetworkPayload: SetSwitchNetworkPayload = {
      type: WalletActions.SET_NETWORK,
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
    expect(initialWalletState.network).toBeNull();
    expect(initialWalletState.tokenBalances).toEqual([]);
    const { network } = walletReducer(initialWalletState, {
      payload: setSwitchNetworkPayload,
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

  it('should update token balances when reducer called with SET_TOKEN_BALANCES action', () => {
    const setTokenBalancesPayload: SetTokenBalancesPayload = {
      type: WalletActions.SET_TOKEN_BALANCES,
      tokenBalances: [
        {
          id: 'Ethereum-ETH',
          symbol: 'ETH',
          description: 'Ethereum',
          balance: '1000000000000000000',
          fiatAmount: '1800.00',
        } as BalanceInfo,
      ],
    };

    expect(initialWalletState.tokenBalances).toEqual([]);
    const { tokenBalances } = walletReducer(initialWalletState, {
      payload: setTokenBalancesPayload,
    });
    expect(tokenBalances).toEqual([
      {
        id: 'Ethereum-ETH',
        symbol: 'ETH',
        description: 'Ethereum',
        balance: '1000000000000000000',
        fiatAmount: '1800.00',
      } as BalanceInfo,
    ]);
  });

  it('should update state with supported top-ups when reducer called with SET_SUPPORTED_TOP_UPS action', () => {
    const enabledTopUps: TopUpFeature = {
      isBridgeEnabled: false,
      isOnRampEnabled: false,
    };

    const setSupportedTopUpPayload: SetSupportedTopUpPayload = {
      type: WalletActions.SET_SUPPORTED_TOP_UPS,
      supportedTopUps: { ...enabledTopUps },
    };
    expect(initialWalletState.supportedTopUps).toBeNull();
    const { supportedTopUps } = walletReducer(initialWalletState, {
      payload: setSupportedTopUpPayload,
    });
    expect(supportedTopUps).toEqual({
      isSwapEnabled: true,
      isBridgeEnabled: false,
      isOnRampEnabled: false,
    });
  });
});
