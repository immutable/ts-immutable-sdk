import { Environment, ImmutableConfiguration } from "@imtbl/config"

export const baseConfig = new ImmutableConfiguration({environment: Environment.SANDBOX})
export const passportConfig = {
  baseConfig,
  clientId: 'FgazXVH4DAXm5tTTPqpyZa70vUaYhwja',
  logoutRedirectUri: 'http://localhost:3000/marketplace-orchestrator',
  redirectUri: 'http://localhost:3000/marketplace-orchestrator/login/callback',
  scope: 'openid offline_access email transact',
  audience: 'platform_api'
}