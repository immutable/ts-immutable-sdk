import { Environment, ImmutableConfiguration } from "@imtbl/config";
import { Passport } from "@imtbl/passport";

const baseConfig = new ImmutableConfiguration({environment: Environment.SANDBOX})

// create and export one instance of passport for marketplace-orchestrator
export const passport = new Passport({
  baseConfig,
  clientId: 'FgazXVH4DAXm5tTTPqpyZa70vUaYhwja',
  logoutRedirectUri: 'http://localhost:3000/marketplace-orchestrator',
  redirectUri: 'http://localhost:3000/marketplace-orchestrator/login/callback',
  scope: 'openid offline_access email transact',
  audience: 'platform_api',
  logoutMode: 'silent',
});