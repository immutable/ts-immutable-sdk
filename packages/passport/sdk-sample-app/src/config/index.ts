export const SCOPE = 'openid offline_access profile email transact';
export const AUDIENCE = 'platform_api';
export const POPUP_REDIRECT_URI = process.env.NEXT_PUBLIC_POPUP_REDIRECT_URI
  || process.env.NEXT_PUBLIC_REDIRECT_URI || '';
export const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
export const LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || '';
export const LOGOUT_MODE = process.env.NEXT_PUBLIC_LOGOUT_MODE as 'redirect' | 'silent' | undefined;
export const SILENT_LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_SILENT_LOGOUT_REDIRECT_URI || '';
export const SILENT_LOGOUT_PARENT_URI = process.env.NEXT_PUBLIC_SILENT_LOGOUT_PARENT_URI || '';
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const MARKETPLACE_FEE_RECIPIENT = '0x3082e7C88f1c8B4E24Be4a75dee018ad362d84d4';
export const MARKETPLACE_FEE_PERCENTAGE = 1;
