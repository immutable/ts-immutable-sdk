import { Passport } from "@imtbl/passport";
import { Environment } from "@imtbl/config";

export const passport = new Passport({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
  clientId: "gYT9Cj8xE7to2mWp4ztBTxBlXCTzAebU",
  redirectUri: "http://localhost:3000/login",
  logoutRedirectUri: "http://localhost:3000/logout",
  logoutMode: "silent",
  audience: "platform_api",
  scope: "openid offline_access email transact",
});
