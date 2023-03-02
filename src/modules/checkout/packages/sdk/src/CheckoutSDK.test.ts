
import { connect, ConnectionProviders } from './connect/connect'

import { CheckoutSDK } from './CheckoutSDK'

jest.mock('./connect/connect')

describe('CheckoutSDK Connect', () => {
  it('should call the connect function', async () => {
    
    const checkoutSDK = new CheckoutSDK()

    const connRes = await checkoutSDK.connect({
      provider: ConnectionProviders.METAMASK
    })

    expect(connect).toBeCalledTimes(1) 
  })
})
