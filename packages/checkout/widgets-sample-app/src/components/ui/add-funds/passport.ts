import { Passport } from "@imtbl/passport";
import { Environment } from "@imtbl/config";

export const passport = new Passport({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
  clientId: "UZhOvcNaFocj5SvqQHh4kvmJYv8fIIYz",
  redirectUri: "http://localhost:3000/add-funds/login",
  logoutRedirectUri: "http://localhost:3000/add-funds/logout",
  logoutMode: "silent",
  audience: "platform_api",
  scope: "openid offline_access email transact",
});
