export enum ConnectionProviders {
  METAMASK = "metamask"
}

export type ConnectParams = {
  provider: ConnectionProviders
}

export async function connect(params: ConnectParams) {

  console.log('[SDKConnect] called with', params)

  return params

}