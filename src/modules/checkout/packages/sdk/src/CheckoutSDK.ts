import { connect as SDKConnect, ConnectParams } from './connect/connect'

export class CheckoutSDK {
  constructor() {}

  public async connect(params: ConnectParams) {
    console.log('[connect] called with', params)
    const connectResult = await SDKConnect(params)      
    return connectResult
  }

}