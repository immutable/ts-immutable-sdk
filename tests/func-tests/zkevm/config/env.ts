export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`);
}

export const env = {
  mnemonic: getEnv('MNEMONIC'),
  bankerPrivateKey: getEnv('BANKER_PRIVATE_KEY'),
  apiRateLimitBypassKey: getEnv('API_RATE_LIMIT_BYPASS_KEY'),
  privateKey: process.env['PRIVATE_KEY'],
  chainName: getEnv('CHAIN_NAME'),
  apiUrl: getEnv('API_URL'),
  rpcUrl: getEnv('RPC_URL'),
  imxAPIKey: getEnv('HUB_GENERATED_API_KEY'),
};
