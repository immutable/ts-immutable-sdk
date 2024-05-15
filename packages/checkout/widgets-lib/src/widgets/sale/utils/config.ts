import { Environment } from '@imtbl/config';

export const PRIMARY_SALES_API_BASE_URL = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DEV: 'https://api.dev.immutable.com/v1/primary-sales',
  [Environment.SANDBOX]: 'https://api.sandbox.immutable.com/v1/primary-sales',
  [Environment.PRODUCTION]: 'https://api.immutable.com/v1/primary-sales',
};
