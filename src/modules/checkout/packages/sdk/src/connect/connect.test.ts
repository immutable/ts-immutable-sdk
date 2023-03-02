
import { connect, ConnectionProviders } from './connect'

describe('connect', () => {
  it('should call the connect function', async () => {
    const connRes = await connect({
      provider: ConnectionProviders.METAMASK
    })

    expect(connRes.provider).toBe(ConnectionProviders.METAMASK) 
  })
})