import { Checkout } from "@imtbl/checkout-sdk-web";
import { SetCheckoutPayload, SetProviderPayload, SetSwitchNetworkPayload, WalletActions, initialWalletState, walletReducer } from "./WalletContext";
import { Web3Provider } from "@ethersproject/providers";
import { BalanceInfo } from "../functions/tokenBalances";

describe('WalletContext', () => {
  it('should update state with checkout when reducer called with SET_CHECKOUT action', () => {
    const setCheckoutPayload: SetCheckoutPayload = {
      type: WalletActions.SET_CHECKOUT,
      checkout: new Checkout(),
    };
    expect(initialWalletState.checkout).toBeNull();
    const { checkout } = walletReducer(initialWalletState, {
      payload: setCheckoutPayload,
    });
    expect(checkout).toBeInstanceOf(Checkout);
  });

  it('should update state with provider when reducer called with SET_PROVIDER action', () => {
    const setProviderPayload: SetProviderPayload = {
      type: WalletActions.SET_PROVIDER,
      provider: {} as Web3Provider,
    };
    expect(initialWalletState.provider).toBeNull();
    const { provider } = walletReducer(initialWalletState, {
      payload: setProviderPayload,
    });
    expect(provider).not.toBeNull();
  });

  it('should update state with network info and token balances when reducer called with SWITCH_NETWORK action', () => {
    const setSwitchNetworkPayload: SetSwitchNetworkPayload = {
      type: WalletActions.SWITCH_NETWORK,
      network: {
        name: 'Ethereum', 
        chainId: 1, 
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'Ethereum'
        }, 
        isSupported: true
      },
      tokenBalances: [
        {
          id: 'Ethereum-ETH',
          symbol: 'ETH',
          description: 'Ethereum',
          balance: '1000000000000000000',
          fiatAmount: '1800.00'
        } as BalanceInfo
      ]
    };
    expect(initialWalletState.network).toBeNull();
    expect(initialWalletState.tokenBalances).toEqual([]);
    const { network, tokenBalances } = walletReducer(initialWalletState, {
      payload: setSwitchNetworkPayload,
    });
    expect(network).toEqual({
      name: 'Ethereum', 
      chainId: 1, 
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum'
      }, 
      isSupported: true
    });
    expect(tokenBalances).toEqual([
      {
        id: 'Ethereum-ETH',
        symbol: 'ETH',
        description: 'Ethereum',
        balance: '1000000000000000000',
        fiatAmount: '1800.00'
      } as BalanceInfo
    ]);
  });
})