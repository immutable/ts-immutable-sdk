import { SQUID_NATIVE_TOKEN } from '../utils/config';

export const isSquidNativeToken = (token: string) => token.toLowerCase() === SQUID_NATIVE_TOKEN.toLowerCase();
