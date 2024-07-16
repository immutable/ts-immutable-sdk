const clientId = process.env.PASSPORT_CLIENT_ID as string;
const redirectUri = process.env.PASSPORT_REDIRECT_URI as string;
const logoutRedirectUri = process.env.PASSPORT_LOGOUT_REDIRECT_URI as string;
const audience = process.env.PASSPORT_AUDIENCE as string;
const scope = process.env.PASSPORT_SCOPE as string;

if (!clientId || !redirectUri || !logoutRedirectUri || !audience || !scope) {
  throw new Error(
    'Please set the environment variables for Passport configuration.',
  );
}

export { clientId, redirectUri, logoutRedirectUri, audience, scope };
