import { Passport } from "@imtbl/passport";
import { Environment } from "@imtbl/config";

export const passport = new Passport({
  baseConfig: {
    environment: Environment.PRODUCTION,
  },
  clientId: "jM8e8Qxn5KfYNcy2RqPWWRHxzmDjCRcI",
  redirectUri: "http://localhost:3000/purchase/login",
  logoutRedirectUri: "http://localhost:3000/purchase/logout",
  logoutMode: "silent",
  audience: "platform_api",
  scope: "openid offline_access email transact",
});
