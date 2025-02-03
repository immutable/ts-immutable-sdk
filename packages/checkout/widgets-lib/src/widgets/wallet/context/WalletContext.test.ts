import { ChainId, GetBalanceResult, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  SetSwitchNetworkPayload,
  WalletActions,
  initialWalletState,
  walletReducer,
  SetSupportedTopUpPayload,
  TopUpFeature,
  SetTokenBalancesPayload,
  SetWalletProviderNamePayload,
} from './WalletContext';

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
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            address: '',
            decimals: 18,
            icon: '',
          },
        } as GetBalanceResult,
      ],
    };

    expect(initialWalletState.tokenBalances).toEqual([]);
    const { tokenBalances } = walletReducer(initialWalletState, {
      payload: setTokenBalancesPayload,
    });
    expect(tokenBalances).toEqual([
      {
        balance: BigInt('1000000000000000000'),
        formattedBalance: '1',
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          address: '',
          decimals: 18,
          icon: '',
        },
      },
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
      isSwapAvailable: true,
      isBridgeEnabled: false,
      isOnRampEnabled: false,
      isAddTokensEnabled: true,
    });
  });

  it('should update wallet provider name when reducer called with SET_WALLET_PROVIDER_NAME action', () => {
    const setWalletProviderNamePayload: SetWalletProviderNamePayload = {
      type: WalletActions.SET_WALLET_PROVIDER_NAME,
      walletProviderName: WalletProviderName.METAMASK,
    };

    expect(initialWalletState.walletProviderName).toEqual(null);
    const { walletProviderName } = walletReducer(initialWalletState, {
      payload: setWalletProviderNamePayload,
    });
    expect(walletProviderName).toEqual(WalletProviderName.METAMASK);
  });
});
