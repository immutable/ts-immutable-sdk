import { Environment } from '@imtbl/config';

export const CURRENCY_NAME = 'USDC';

export const PRIMARY_SALES_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://api.sandbox.immutable.com/v1/primary-sales',
  [Environment.PRODUCTION]: 'https://api.immutable.com/v1/primary-sales',
};
