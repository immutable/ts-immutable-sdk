import { passport } from "@imtbl/sdk";
import { Environment, ImmutableConfiguration } from "@imtbl/sdk/config";

	// #doc passport-telegram-mini-app-configuration
	export const passportInstance = new passport.Passport({
		baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
		// The client ID of the application created in Hub
		clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "<CLIENT_ID>",
		// The redirect URI set in the application created in Hub
		redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "<REDIRECT_URI>",
		// The logout redirect URI set in the application created in Hub
		logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || "<LOGOUT_REDIRECT_URI>",
		audience: "platform_api",
		scope: "openid offline_access email transact",
		// Set crossSdkBridgeEnabled to enable pre-approved transactions
		crossSdkBridgeEnabled: true,
	});
	// #enddoc passport-telegram-mini-app-configuration