export const scope = 'openid offline_access profile email transact';
export const audience = 'platform_api';
export const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
export const logoutRedirectUri = process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || '';
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
