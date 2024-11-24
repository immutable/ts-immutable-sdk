import { passport } from "@imtbl/sdk";
import { ImmutableConfiguration } from "@imtbl/sdk/x";
import config, { applicationEnvironment } from "../config/config"; // Create Passport instance once
import { parseJwt } from "../utils/jwt";

export const passportInstance = new passport.Passport({
  baseConfig: new ImmutableConfiguration({ environment: applicationEnvironment, publishableKey: config[applicationEnvironment].immutablePublishableKey }),
  clientId: config[applicationEnvironment].passportClientId,
  redirectUri: config[applicationEnvironment].passportRedirectUri,
  logoutRedirectUri: config[applicationEnvironment].passportLogoutRedirectUri,
  audience: "platform_api",
  scope: "openid offline_access email transact",
});

export const zkEVMProvider = passportInstance.connectEvm({ announceProvider: true });

export async function login() {
  let userProfile;
  let walletAddress = '';
  try {
    await zkEVMProvider?.request({ method: "eth_requestAccounts" });
  } catch (err) {
    console.log("Failed to login");
    console.error(err);
  }

  try {
    userProfile = await passportInstance.getUserInfo();
  } catch (err) {
    console.log("Failed to fetch user info");
    console.error(err);
  }

  try {
    const idToken = await passportInstance.getIdToken();
    console.log(idToken);
    const parsedIdToken = parseJwt(idToken!);
    console.log(parsedIdToken);
    console.log("parsing ID token");
    console.log(`wallet address: ${parsedIdToken.passport.zkevm_eth_address}`);
    walletAddress = parsedIdToken.passport.zkevm_eth_address
  } catch (err) {
    console.log("Failed to fetch idToken");
    console.error(err);
  }

  return { userProfile, walletAddress }
}
