/*
 * @jest-environment jsdom
 */
import { ConnectionProviders, connectWalletProvider, getNetworkInfo } from "./connect";

import { CheckoutSDK } from "./CheckoutSDK";
import { switchWalletNetwork } from "./network";
import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "./types";

jest.mock('./connect')
jest.mock('./network')

describe('CheckoutSDK Connect', () => {
  it('should call the connectWalletProvider function', async () => {

    const checkoutSDK = new CheckoutSDK()

    await checkoutSDK.connect({
      providerPreference: ConnectionProviders.METAMASK
    })

    expect(connectWalletProvider).toBeCalledTimes(1);
    expect(getNetworkInfo).toBeCalledTimes(1);
  })

  it('should call the switchWalletNetwork function', async () => {

    const checkoutSDK = new CheckoutSDK()

    await checkoutSDK.switchNetwork({provider: {} as Web3Provider, chainId: ChainId.ETHEREUM})

    expect(switchWalletNetwork).toBeCalledTimes(1)
  })
})
