/*
 * @jest-environment jsdom
 */
import { connectWalletProvider, ConnectionProviders } from './connect'

import { CheckoutSDK } from './CheckoutSDK'
import { Network, switchWalletNetwork } from './network'
import { Web3Provider } from '@ethersproject/providers'

jest.mock('./connect')
jest.mock('./network')

describe('CheckoutSDK Connect', () => {
  it('should call the connectWalletProvider function', async () => {
    
    const checkoutSDK = new CheckoutSDK()

    await checkoutSDK.connect({
      providerPreference: ConnectionProviders.METAMASK
    })

    expect(connectWalletProvider).toBeCalledTimes(1) 
  })

  it('should call the switchWalletNetwork function', async () => {
    
    const checkoutSDK = new CheckoutSDK()

    await checkoutSDK.switchNetwork({provider: {} as Web3Provider, network: Network.ETHEREUM})

    expect(switchWalletNetwork).toBeCalledTimes(1) 
  })
})
