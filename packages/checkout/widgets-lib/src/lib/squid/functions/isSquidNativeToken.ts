import { SQUID_NATIVE_TOKEN } from '../config';

export const isSquidNativeToken = (token: string) => token.toLowerCase() === SQUID_NATIVE_TOKEN.toLowerCase();
