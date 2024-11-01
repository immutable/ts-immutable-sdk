import { Passport } from "@imtbl/passport";
import { Environment } from "@imtbl/config";

export const passport = new Passport({
  baseConfig: {
    environment: Environment.PRODUCTION,
  },
  clientId: "gYT9Cj8xE7to2mWp4ztBTxBlXCTzAebU",
  redirectUri: "http://localhost:3000/add-tokens/login",
  logoutRedirectUri: "http://localhost:3000/add-tokens/logout",
  logoutMode: "silent",
  audience: "platform_api",
  scope: "openid offline_access email transact",
});
